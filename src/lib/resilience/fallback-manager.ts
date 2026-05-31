/**
 * Fallback Provider Manager
 *
 * Automatically switches between LLM providers when the primary
 * provider fails. Adapted from p-mas donor for 3A Studio's
 * existing ProviderConfig / callLLM architecture.
 *
 * Key difference from donor: uses our ProviderConfig type and
 * callLLM function instead of a Provider base class.
 */

import { CircuitBreaker } from "./circuit-breaker";
import type { ProviderConfig, LLMSettings, LLMMessage } from "@/lib/llm/types";
import { callLLM, type CallParams } from "@/lib/llm/client";

export interface FallbackResult {
  content: string;
  providerId: string;
  providerName: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  fallbackUsed: boolean;
}

export class FallbackManager {
  private currentProviderIndex = 0;
  private failureCount = 0;
  private readonly circuitBreakers: Map<string, CircuitBreaker> = new Map();

  constructor(private readonly providers: ProviderConfig[]) {
    for (const provider of providers) {
      this.circuitBreakers.set(provider.id, new CircuitBreaker({ failureThreshold: 5, timeout: 60000 }));
    }
  }

  /**
   * Execute an LLM call with automatic fallback to other providers.
   * Tries providers in priority order (enabled ones first).
   */
  async chat(
    messages: LLMMessage[],
    settings: LLMSettings,
    options?: { model?: string; temperature?: number; maxTokens?: number },
  ): Promise<FallbackResult> {
    const enabledProviders = this.providers.filter((p) => p.enabled);
    if (enabledProviders.length === 0) {
      throw new Error("No providers available");
    }

    const orderedProviders = this.getProvidersInPriorityOrder(enabledProviders);
    let fallbackUsed = false;

    for (const provider of orderedProviders) {
      try {
        const cb = this.circuitBreakers.get(provider.id);
        if (!cb) continue;

        const model = options?.model || settings.activeModel;
        const params: CallParams = {
          provider,
          model,
          messages,
          temperature: options?.temperature ?? settings.temperature,
          maxTokens: options?.maxTokens ?? settings.maxTokens,
        };

        const result = await cb.execute(async () => {
          return await callLLM(params);
        });

        // Success -- update tracking
        this.currentProviderIndex = this.providers.indexOf(provider);
        this.failureCount = 0;

        return {
          content: result.content,
          providerId: provider.id,
          providerName: provider.name,
          model: result.model,
          usage: result.usage,
          fallbackUsed,
        };
      } catch (error) {
        this.failureCount++;
        console.warn(
          `[fallback] Provider ${provider.name} failed:`,
          error instanceof Error ? error.message : String(error)
        );

        if (this.failureCount >= 3) {
          this.switchToNextProvider(enabledProviders);
          this.failureCount = 0;
        }

        fallbackUsed = true;
      }
    }

    throw new Error("All providers failed");
  }

  getCurrentProvider(): ProviderConfig | undefined {
    return this.providers[this.currentProviderIndex];
  }

  getStatus(): {
    currentProvider: string;
    providers: Array<{ id: string; name: string; enabled: boolean; circuitState: string }>;
  } {
    return {
      currentProvider: this.getCurrentProvider()?.name ?? "none",
      providers: this.providers.map((p) => ({
        id: p.id,
        name: p.name,
        enabled: p.enabled,
        circuitState: this.circuitBreakers.get(p.id)?.getState() ?? "UNKNOWN",
      })),
    };
  }

  /** Reset a specific circuit breaker (e.g. after user intervention) */
  resetCircuit(providerId: string): void {
    this.circuitBreakers.get(providerId)?.reset();
  }

  private getProvidersInPriorityOrder(providers: ProviderConfig[]): ProviderConfig[] {
    // Current provider first, then others in their original order
    const sorted = [...providers];
    const current = this.providers[this.currentProviderIndex];
    if (current && current.enabled) {
      const idx = sorted.findIndex(p => p.id === current.id);
      if (idx > 0) {
        sorted.splice(idx, 1);
        sorted.unshift(current);
      }
    }
    return sorted;
  }

  private switchToNextProvider(providers: ProviderConfig[]): void {
    const currentIdx = providers.findIndex(p => p.id === this.providers[this.currentProviderIndex]?.id);
    const nextIdx = (currentIdx + 1) % providers.length;
    const nextProvider = providers[nextIdx];
    this.currentProviderIndex = this.providers.findIndex(p => p.id === nextProvider.id);
    console.warn(`[fallback] Switched to provider: ${nextProvider.name}`);
  }
}

// Tests for src/lib/llm/types.ts -- LLM provider types and defaults

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_LLM_SETTINGS,
  LLM_PROVIDERS,
  builtinToConfig,
  blankCustomProvider,
} from './types';

describe('LLM Types', () => {
  describe('DEFAULT_LLM_SETTINGS', () => {
    it('should have zai as default active provider', () => {
      expect(DEFAULT_LLM_SETTINGS.activeProviderId).toBe('zai');
    });

    it('should have a default model', () => {
      expect(DEFAULT_LLM_SETTINGS.activeModel).toBe('glm-4.7-flashx');
    });

    it('should have valid temperature range', () => {
      expect(DEFAULT_LLM_SETTINGS.temperature).toBeGreaterThan(0);
      expect(DEFAULT_LLM_SETTINGS.temperature).toBeLessThanOrEqual(2);
    });

    it('should have reasonable maxTokens', () => {
      expect(DEFAULT_LLM_SETTINGS.maxTokens).toBeGreaterThan(0);
    });
  });

  describe('LLM_PROVIDERS', () => {
    it('should have zai provider', () => {
      expect(LLM_PROVIDERS.zai).toBeDefined();
      expect(LLM_PROVIDERS.zai.name).toContain('Z.ai');
    });

    it('should have openai provider', () => {
      expect(LLM_PROVIDERS.openai).toBeDefined();
      expect(LLM_PROVIDERS.openai.baseUrl).toContain('openai.com');
    });

    it('should have anthropic provider', () => {
      expect(LLM_PROVIDERS.anthropic).toBeDefined();
      expect(LLM_PROVIDERS.anthropic.baseUrl).toContain('anthropic.com');
    });

    it('should have openrouter provider', () => {
      expect(LLM_PROVIDERS.openrouter).toBeDefined();
      expect(LLM_PROVIDERS.openrouter.baseUrl).toContain('openrouter.ai');
    });

    it('each provider should have at least one model', () => {
      for (const [key, provider] of Object.entries(LLM_PROVIDERS)) {
        expect(provider.models.length).toBeGreaterThan(0);
      }
    });

    it('zai should be enabled by default in builtinToConfig', () => {
      const config = builtinToConfig('zai');
      expect(config.enabled).toBe(true);
    });

    it('non-zai providers should be disabled by default', () => {
      const openai = builtinToConfig('openai');
      expect(openai.enabled).toBe(false);
    });
  });

  describe('builtinToConfig', () => {
    it('should throw for unknown provider', () => {
      expect(() => builtinToConfig('nonexistent' as any)).toThrow();
    });

    it('should map provider fields correctly', () => {
      const config = builtinToConfig('openai');
      expect(config.id).toBe('openai');
      expect(config.name).toBe(LLM_PROVIDERS.openai.name);
      expect(config.baseUrl).toBe(LLM_PROVIDERS.openai.baseUrl);
      expect(config.apiKey).toBe('');
    });
  });

  describe('blankCustomProvider', () => {
    it('should create provider with defaults', () => {
      const provider = blankCustomProvider();
      expect(provider.id).toMatch(/^custom-/);
      expect(provider.name).toBe('New Provider');
      expect(provider.baseUrl).toBe('');
      expect(provider.apiKey).toBe('');
      expect(provider.enabled).toBe(true);
      expect(provider.format).toBe('openai');
    });

    it('should use custom name', () => {
      const provider = blankCustomProvider('My Groq');
      expect(provider.name).toBe('My Groq');
    });
  });
});

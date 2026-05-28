import { create } from "zustand";
import { usePromptStudioStore } from "@/features/prompt-studio/store/prompt-studio-store";

const STORAGE_KEY = "3a-prompt-favorites";

function loadFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveFavorites(favs: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favs]));
  } catch { /* quota exceeded */ }
}

interface PromptLibraryStore {
  favorites: Set<string>;
  search: string;
  categoryFilter: string;

  setSearch: (q: string) => void;
  setCategoryFilter: (c: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  sendToStudio: (prompt: string) => void;
  copyToClipboard: (prompt: string) => Promise<void>;
}

export const usePromptLibraryStore = create<PromptLibraryStore>((set, get) => ({
  favorites: loadFavorites(),
  search: "",
  categoryFilter: "",

  setSearch: (q) => set({ search: q }),
  setCategoryFilter: (c) => set({ categoryFilter: c }),

  toggleFavorite: (id) =>
    set((s) => {
      const next = new Set(s.favorites);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveFavorites(next);
      return { favorites: next };
    }),

  isFavorite: (id) => get().favorites.has(id),

  sendToStudio: (prompt) => {
    usePromptStudioStore.getState().loadToEditor(prompt);
  },

  copyToClipboard: async (prompt) => {
    await navigator.clipboard.writeText(prompt);
  },
}));

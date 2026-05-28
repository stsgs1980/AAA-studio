import { create } from "zustand";

interface WikiStore {
  isOpen: boolean;
  activePage: string;
  searchQuery: string;
  open: (page?: string) => void;
  close: () => void;
  setPage: (page: string) => void;
  setSearch: (query: string) => void;
}

export const useWikiStore = create<WikiStore>((set) => ({
  isOpen: false,
  activePage: "overview",
  searchQuery: "",
  open: (page) =>
    set({ isOpen: true, searchQuery: "", activePage: page ?? "overview" }),
  close: () => set({ isOpen: false, searchQuery: "" }),
  setPage: (page) => set({ activePage: page }),
  setSearch: (query) => set({ searchQuery: query }),
}));

import { create } from "zustand";

// Type for filter values
type FilterValue = string | number | boolean | null | undefined;

interface UIState {
  // Global loading state
  isGlobalLoading: boolean;
  setIsGlobalLoading: (isLoading: boolean) => void;

  // Modal states
  modals: {
    [key: string]: boolean;
  };
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
  closeAllModals: () => void;

  // Filter states
  filters: {
    [key: string]: FilterValue;
  };
  setFilter: (filterKey: string, value: FilterValue) => void;
  resetFilter: (filterKey: string) => void;
  resetAllFilters: () => void;

  // Pagination states
  pagination: {
    [key: string]: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
    };
  };
  setCurrentPage: (key: string, page: number) => void;
  setItemsPerPage: (key: string, itemsPerPage: number) => void;
  setTotalItems: (key: string, totalItems: number) => void;
  resetPagination: (key: string) => void;

  // Search states
  searchTerms: {
    [key: string]: string;
  };
  setSearchTerm: (key: string, term: string) => void;
  clearSearchTerm: (key: string) => void;
  clearAllSearchTerms: () => void;

  // Sidebar state (for dashboard)
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Global loading
  isGlobalLoading: false,
  setIsGlobalLoading: (isLoading) => set({ isGlobalLoading: isLoading }),

  // Modals
  modals: {},
  openModal: (modalId) =>
    set((state) => ({
      modals: { ...state.modals, [modalId]: true },
    })),
  closeModal: (modalId) =>
    set((state) => ({
      modals: { ...state.modals, [modalId]: false },
    })),
  toggleModal: (modalId) =>
    set((state) => ({
      modals: { ...state.modals, [modalId]: !state.modals[modalId] },
    })),
  closeAllModals: () => set({ modals: {} }),

  // Filters
  filters: {},
  setFilter: (filterKey, value) =>
    set((state) => ({
      filters: { ...state.filters, [filterKey]: value },
    })),
  resetFilter: (filterKey) =>
    set((state) => {
      const newFilters = { ...state.filters };
      delete newFilters[filterKey];
      return { filters: newFilters };
    }),
  resetAllFilters: () => set({ filters: {} }),

  // Pagination
  pagination: {},
  setCurrentPage: (key, page) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        [key]: {
          ...state.pagination[key],
          currentPage: page,
        },
      },
    })),
  setItemsPerPage: (key, itemsPerPage) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        [key]: {
          ...state.pagination[key],
          itemsPerPage,
        },
      },
    })),
  setTotalItems: (key, totalItems) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        [key]: {
          ...state.pagination[key],
          totalItems,
        },
      },
    })),
  resetPagination: (key) =>
    set((state) => {
      const newPagination = { ...state.pagination };
      delete newPagination[key];
      return { pagination: newPagination };
    }),

  // Search
  searchTerms: {},
  setSearchTerm: (key, term) =>
    set((state) => ({
      searchTerms: { ...state.searchTerms, [key]: term },
    })),
  clearSearchTerm: (key) =>
    set((state) => {
      const newSearchTerms = { ...state.searchTerms };
      delete newSearchTerms[key];
      return { searchTerms: newSearchTerms };
    }),
  clearAllSearchTerms: () => set({ searchTerms: {} }),

  // Sidebar
  isSidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}));

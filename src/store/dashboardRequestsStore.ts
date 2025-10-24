import { create } from "zustand";

type RequestType = "borrowing" | "booking" | "acquiring";

interface DashboardRequestsState {
  // Current request type
  currentRequestType: RequestType;
  setCurrentRequestType: (type: RequestType) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Selected items for bulk actions
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
  clearSelection: () => void;
  selectAll: (ids: number[]) => void;
  toggleSelection: (id: number) => void;

  // Action dropdown
  showActionDropdown: boolean;
  setShowActionDropdown: (show: boolean) => void;

  // Notifications
  showReturnNotifications: boolean;
  setShowReturnNotifications: (show: boolean) => void;
  showDoneNotifications: boolean;
  setShowDoneNotifications: (show: boolean) => void;

  // Pagination
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;

  // Reset all state
  resetAll: () => void;
}

export const useDashboardRequestsStore = create<DashboardRequestsState>()(
  (set) => ({
    // Initial state
    currentRequestType: "borrowing",
    isLoading: false,
    selectedIds: [],
    showActionDropdown: false,
    showReturnNotifications: false,
    showDoneNotifications: false,
    currentPage: 1,
    totalPages: 1,

    // Actions
    setCurrentRequestType: (type) =>
      set({ currentRequestType: type, selectedIds: [], currentPage: 1 }),

    setIsLoading: (loading) => set({ isLoading: loading }),

    setSelectedIds: (ids) => set({ selectedIds: ids }),

    clearSelection: () => set({ selectedIds: [] }),

    selectAll: (ids) => set({ selectedIds: ids }),

    toggleSelection: (id) =>
      set((state) => ({
        selectedIds: state.selectedIds.includes(id)
          ? state.selectedIds.filter((selectedId) => selectedId !== id)
          : [...state.selectedIds, id],
      })),

    setShowActionDropdown: (show) => set({ showActionDropdown: show }),

    setShowReturnNotifications: (show) =>
      set({ showReturnNotifications: show }),

    setShowDoneNotifications: (show) => set({ showDoneNotifications: show }),

    setCurrentPage: (page) => set({ currentPage: page, selectedIds: [] }),

    setTotalPages: (pages) => set({ totalPages: pages }),

    resetAll: () =>
      set({
        currentRequestType: "borrowing",
        isLoading: false,
        selectedIds: [],
        showActionDropdown: false,
        showReturnNotifications: false,
        showDoneNotifications: false,
        currentPage: 1,
        totalPages: 1,
      }),
  })
);

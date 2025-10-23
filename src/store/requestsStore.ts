import { create } from "zustand";
import type {
  Borrowing,
  Booking,
  Acquiring,
} from "@/app/my-requests/utils/helpers";

export type RequestType = "borrowing" | "booking" | "acquiring";

interface RequestsState {
  // Request type
  currentRequestType: RequestType;
  setCurrentRequestType: (type: RequestType) => void;

  // Borrowing state
  borrowingRequests: Borrowing[];
  borrowingPage: number;
  borrowingTotalPages: number;
  setBorrowingRequests: (requests: Borrowing[]) => void;
  setBorrowingPage: (page: number) => void;
  setBorrowingTotalPages: (totalPages: number) => void;

  // Booking state
  bookingRequests: Booking[];
  bookingPage: number;
  bookingTotalPages: number;
  setBookingRequests: (requests: Booking[]) => void;
  setBookingPage: (page: number) => void;
  setBookingTotalPages: (totalPages: number) => void;

  // Acquiring state
  acquiringRequests: Acquiring[];
  acquiringPage: number;
  acquiringTotalPages: number;
  setAcquiringRequests: (requests: Acquiring[]) => void;
  setAcquiringPage: (page: number) => void;
  setAcquiringTotalPages: (totalPages: number) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;

  // Selection state
  selectedIds: number[];
  setSelectedIds: (ids: number[]) => void;
  clearSelection: () => void;
  selectAll: (ids: number[]) => void;
  toggleSelection: (id: number) => void;

  // Modal states
  showReturnModal: boolean;
  showDoneModal: boolean;
  showDeleteModal: boolean;
  setShowReturnModal: (show: boolean) => void;
  setShowDoneModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  closeAllModals: () => void;

  // Modal form states
  receiverName: string;
  completionNotes: string;
  setReceiverName: (name: string) => void;
  setCompletionNotes: (notes: string) => void;
  clearModalForms: () => void;

  // Submission states
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;

  // Reset all state
  resetAll: () => void;
}

export const useRequestsStore = create<RequestsState>((set) => ({
  // Request type
  currentRequestType: "borrowing",
  setCurrentRequestType: (type) =>
    set({ currentRequestType: type, selectedIds: [] }),

  // Borrowing
  borrowingRequests: [],
  borrowingPage: 1,
  borrowingTotalPages: 1,
  setBorrowingRequests: (requests) => set({ borrowingRequests: requests }),
  setBorrowingPage: (page) => set({ borrowingPage: page, selectedIds: [] }),
  setBorrowingTotalPages: (totalPages) =>
    set({ borrowingTotalPages: totalPages }),

  // Booking
  bookingRequests: [],
  bookingPage: 1,
  bookingTotalPages: 1,
  setBookingRequests: (requests) => set({ bookingRequests: requests }),
  setBookingPage: (page) => set({ bookingPage: page, selectedIds: [] }),
  setBookingTotalPages: (totalPages) => set({ bookingTotalPages: totalPages }),

  // Acquiring
  acquiringRequests: [],
  acquiringPage: 1,
  acquiringTotalPages: 1,
  setAcquiringRequests: (requests) => set({ acquiringRequests: requests }),
  setAcquiringPage: (page) => set({ acquiringPage: page, selectedIds: [] }),
  setAcquiringTotalPages: (totalPages) =>
    set({ acquiringTotalPages: totalPages }),

  // Loading
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  // Selection
  selectedIds: [],
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
  selectAll: (ids) => set({ selectedIds: ids }),
  toggleSelection: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedIds, id],
    })),

  // Modals
  showReturnModal: false,
  showDoneModal: false,
  showDeleteModal: false,
  setShowReturnModal: (show) => set({ showReturnModal: show }),
  setShowDoneModal: (show) => set({ showDoneModal: show }),
  setShowDeleteModal: (show) => set({ showDeleteModal: show }),
  closeAllModals: () =>
    set({
      showReturnModal: false,
      showDoneModal: false,
      showDeleteModal: false,
    }),

  // Modal forms
  receiverName: "",
  completionNotes: "",
  setReceiverName: (name) => set({ receiverName: name }),
  setCompletionNotes: (notes) => set({ completionNotes: notes }),
  clearModalForms: () => set({ receiverName: "", completionNotes: "" }),

  // Submission
  isSubmitting: false,
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

  // Reset
  resetAll: () =>
    set({
      currentRequestType: "borrowing",
      borrowingRequests: [],
      borrowingPage: 1,
      borrowingTotalPages: 1,
      bookingRequests: [],
      bookingPage: 1,
      bookingTotalPages: 1,
      acquiringRequests: [],
      acquiringPage: 1,
      acquiringTotalPages: 1,
      isLoading: false,
      selectedIds: [],
      showReturnModal: false,
      showDoneModal: false,
      showDeleteModal: false,
      receiverName: "",
      completionNotes: "",
      isSubmitting: false,
    }),
}));

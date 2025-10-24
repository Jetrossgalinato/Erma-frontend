import { create } from "zustand";

// Types
export interface EquipmentLog {
  id: number;
  log_message: string;
  created_at: string;
}

export interface FacilityLog {
  id: number;
  log_message: string;
  created_at: string;
}

export interface SupplyLog {
  id: number;
  log_message: string;
  created_at: string;
}

export interface PaginationState {
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
  totalPages: number;
}

interface MonitoringState {
  // Equipment Logs
  equipmentLogs: EquipmentLog[];
  isLoadingEquipmentLogs: boolean;
  equipmentLogsPagination: PaginationState;
  setEquipmentLogs: (logs: EquipmentLog[]) => void;
  setIsLoadingEquipmentLogs: (isLoading: boolean) => void;
  setEquipmentLogsPagination: (pagination: Partial<PaginationState>) => void;

  // Facility Logs
  facilityLogs: FacilityLog[];
  isLoadingFacilityLogs: boolean;
  facilityLogsPagination: PaginationState;
  setFacilityLogs: (logs: FacilityLog[]) => void;
  setIsLoadingFacilityLogs: (isLoading: boolean) => void;
  setFacilityLogsPagination: (pagination: Partial<PaginationState>) => void;

  // Supply Logs
  supplyLogs: SupplyLog[];
  isLoadingSupplyLogs: boolean;
  supplyLogsPagination: PaginationState;
  setSupplyLogs: (logs: SupplyLog[]) => void;
  setIsLoadingSupplyLogs: (isLoading: boolean) => void;
  setSupplyLogsPagination: (pagination: Partial<PaginationState>) => void;

  // Clear all data
  clearAll: () => void;
}

const initialPagination: PaginationState = {
  currentPage: 1,
  totalCount: 0,
  itemsPerPage: 10,
  totalPages: 0,
};

export const useMonitoringStore = create<MonitoringState>((set) => ({
  // Equipment Logs state
  equipmentLogs: [],
  isLoadingEquipmentLogs: false,
  equipmentLogsPagination: initialPagination,

  setEquipmentLogs: (logs) => set({ equipmentLogs: logs }),
  setIsLoadingEquipmentLogs: (isLoading) =>
    set({ isLoadingEquipmentLogs: isLoading }),
  setEquipmentLogsPagination: (pagination) =>
    set((state) => ({
      equipmentLogsPagination: {
        ...state.equipmentLogsPagination,
        ...pagination,
      },
    })),

  // Facility Logs state
  facilityLogs: [],
  isLoadingFacilityLogs: false,
  facilityLogsPagination: initialPagination,

  setFacilityLogs: (logs) => set({ facilityLogs: logs }),
  setIsLoadingFacilityLogs: (isLoading) =>
    set({ isLoadingFacilityLogs: isLoading }),
  setFacilityLogsPagination: (pagination) =>
    set((state) => ({
      facilityLogsPagination: {
        ...state.facilityLogsPagination,
        ...pagination,
      },
    })),

  // Supply Logs state
  supplyLogs: [],
  isLoadingSupplyLogs: false,
  supplyLogsPagination: initialPagination,

  setSupplyLogs: (logs) => set({ supplyLogs: logs }),
  setIsLoadingSupplyLogs: (isLoading) =>
    set({ isLoadingSupplyLogs: isLoading }),
  setSupplyLogsPagination: (pagination) =>
    set((state) => ({
      supplyLogsPagination: {
        ...state.supplyLogsPagination,
        ...pagination,
      },
    })),

  // Clear all data
  clearAll: () =>
    set({
      equipmentLogs: [],
      isLoadingEquipmentLogs: false,
      equipmentLogsPagination: initialPagination,
      facilityLogs: [],
      isLoadingFacilityLogs: false,
      facilityLogsPagination: initialPagination,
      supplyLogs: [],
      isLoadingSupplyLogs: false,
      supplyLogsPagination: initialPagination,
    }),
}));

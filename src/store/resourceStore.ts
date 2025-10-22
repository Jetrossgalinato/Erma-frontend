import { create } from "zustand";

// Types
export interface Equipment {
  equipment_id: number;
  equipment_name: string;
  description?: string;
  category: string;
  status: string;
  facility_id: number;
  facility_name: string;
  person_liable?: string;
  remarks?: string;
  image_url?: string;
}

export interface Facility {
  facility_id: number;
  facility_name: string;
  facility_type: string;
  floor_level: string;
  capacity: number;
  description?: string;
  status: string;
  image_url?: string;
}

export interface Supply {
  supply_id: number;
  supply_name: string;
  description?: string;
  category: string;
  quantity: number;
  stocking_point: number;
  stock_unit: string;
  facility_id: number;
  facility_name: string;
  remarks?: string;
  image_url?: string;
}

interface ResourceState {
  // Equipment
  equipments: Equipment[];
  isLoadingEquipments: boolean;
  setEquipments: (equipments: Equipment[]) => void;
  setIsLoadingEquipments: (isLoading: boolean) => void;
  addEquipment: (equipment: Equipment) => void;
  updateEquipment: (id: number, equipment: Partial<Equipment>) => void;
  removeEquipment: (id: number) => void;

  // Facilities
  facilities: Facility[];
  isLoadingFacilities: boolean;
  setFacilities: (facilities: Facility[]) => void;
  setIsLoadingFacilities: (isLoading: boolean) => void;
  addFacility: (facility: Facility) => void;
  updateFacility: (id: number, facility: Partial<Facility>) => void;
  removeFacility: (id: number) => void;

  // Supplies
  supplies: Supply[];
  isLoadingSupplies: boolean;
  setSupplies: (supplies: Supply[]) => void;
  setIsLoadingSupplies: (isLoading: boolean) => void;
  addSupply: (supply: Supply) => void;
  updateSupply: (id: number, supply: Partial<Supply>) => void;
  removeSupply: (id: number) => void;

  // Clear all data
  clearAll: () => void;
}

export const useResourceStore = create<ResourceState>((set) => ({
  // Equipment state
  equipments: [],
  isLoadingEquipments: false,

  setEquipments: (equipments) => set({ equipments }),
  setIsLoadingEquipments: (isLoading) =>
    set({ isLoadingEquipments: isLoading }),

  addEquipment: (equipment) =>
    set((state) => ({
      equipments: [...state.equipments, equipment],
    })),

  updateEquipment: (id, equipment) =>
    set((state) => ({
      equipments: state.equipments.map((e) =>
        e.equipment_id === id ? { ...e, ...equipment } : e
      ),
    })),

  removeEquipment: (id) =>
    set((state) => ({
      equipments: state.equipments.filter((e) => e.equipment_id !== id),
    })),

  // Facilities state
  facilities: [],
  isLoadingFacilities: false,

  setFacilities: (facilities) => set({ facilities }),
  setIsLoadingFacilities: (isLoading) =>
    set({ isLoadingFacilities: isLoading }),

  addFacility: (facility) =>
    set((state) => ({
      facilities: [...state.facilities, facility],
    })),

  updateFacility: (id, facility) =>
    set((state) => ({
      facilities: state.facilities.map((f) =>
        f.facility_id === id ? { ...f, ...facility } : f
      ),
    })),

  removeFacility: (id) =>
    set((state) => ({
      facilities: state.facilities.filter((f) => f.facility_id !== id),
    })),

  // Supplies state
  supplies: [],
  isLoadingSupplies: false,

  setSupplies: (supplies) => set({ supplies }),
  setIsLoadingSupplies: (isLoading) => set({ isLoadingSupplies: isLoading }),

  addSupply: (supply) =>
    set((state) => ({
      supplies: [...state.supplies, supply],
    })),

  updateSupply: (id, supply) =>
    set((state) => ({
      supplies: state.supplies.map((s) =>
        s.supply_id === id ? { ...s, ...supply } : s
      ),
    })),

  removeSupply: (id) =>
    set((state) => ({
      supplies: state.supplies.filter((s) => s.supply_id !== id),
    })),

  // Clear all data
  clearAll: () =>
    set({
      equipments: [],
      facilities: [],
      supplies: [],
      isLoadingEquipments: false,
      isLoadingFacilities: false,
      isLoadingSupplies: false,
    }),
}));

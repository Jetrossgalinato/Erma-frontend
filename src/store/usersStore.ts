import { create } from "zustand";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  department: string;
  phone_number: string;
  acc_role: string;
  approved_acc_role: string | null;
  email: string;
}

interface PaginationState {
  currentPage: number;
  totalCount: number;
  itemsPerPage: number;
  totalPages: number;
}

interface UsersState {
  // Users data
  users: User[];
  isLoadingUsers: boolean;
  usersPagination: PaginationState;

  // Filters
  departmentFilter: string;
  roleFilter: string;

  // Actions
  setUsers: (users: User[]) => void;
  setIsLoadingUsers: (loading: boolean) => void;
  setUsersPagination: (pagination: Partial<PaginationState>) => void;
  setDepartmentFilter: (filter: string) => void;
  setRoleFilter: (filter: string) => void;
  clearFilters: () => void;
  clearAll: () => void;
}

export const useUsersStore = create<UsersState>((set) => ({
  // Initial state
  users: [],
  isLoadingUsers: false,
  usersPagination: {
    currentPage: 1,
    totalCount: 0,
    itemsPerPage: 10,
    totalPages: 0,
  },
  departmentFilter: "",
  roleFilter: "",

  // Actions
  setUsers: (users) => set({ users }),

  setIsLoadingUsers: (loading) => set({ isLoadingUsers: loading }),

  setUsersPagination: (pagination) =>
    set((state) => ({
      usersPagination: { ...state.usersPagination, ...pagination },
    })),

  setDepartmentFilter: (filter) => set({ departmentFilter: filter }),

  setRoleFilter: (filter) => set({ roleFilter: filter }),

  clearFilters: () =>
    set({
      departmentFilter: "",
      roleFilter: "",
      usersPagination: {
        currentPage: 1,
        totalCount: 0,
        itemsPerPage: 10,
        totalPages: 0,
      },
    }),

  clearAll: () =>
    set({
      users: [],
      isLoadingUsers: false,
      usersPagination: {
        currentPage: 1,
        totalCount: 0,
        itemsPerPage: 10,
        totalPages: 0,
      },
      departmentFilter: "",
      roleFilter: "",
    }),
}));

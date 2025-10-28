import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
export interface User {
  userId: string;
  email: string;
  role: string;
  accountRequestId?: number;
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
}

// Auth Store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      setUser: (user) => set({ user }),

      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      setIsLoading: (isLoading) => set({ isLoading }),

      // Login action
      login: (token, user) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", token);
          localStorage.setItem("userId", user.userId);
          localStorage.setItem("userEmail", user.email);
          localStorage.setItem("userRole", user.role);
          if (user.accountRequestId) {
            localStorage.setItem(
              "accountRequestId",
              user.accountRequestId.toString()
            );
          }
        }
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // Logout action
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userId");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userRole");
          localStorage.removeItem("accountRequestId");
        }
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Initialize auth from localStorage
      initializeAuth: async () => {
        if (typeof window === "undefined") {
          set({ isLoading: false });
          return;
        }

        try {
          const token = localStorage.getItem("authToken");

          if (!token) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }

          // Verify token with backend
          const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            // Token is invalid
            get().logout();
            return;
          }

          const authData = await response.json();

          const user: User = {
            userId:
              authData.user_id?.toString() ||
              localStorage.getItem("userId") ||
              "",
            email: authData.email || localStorage.getItem("userEmail") || "",
            role: authData.role || localStorage.getItem("userRole") || "",
            accountRequestId: localStorage.getItem("accountRequestId")
              ? parseInt(localStorage.getItem("accountRequestId")!)
              : undefined,
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error initializing auth:", error);
          get().logout();
        }
      },
    }),
    {
      name: "auth-storage", // unique name for localStorage key
      storage: createJSONStorage(() => {
        // Only use localStorage on client side
        if (typeof window !== "undefined") {
          return localStorage;
        }
        // Return a dummy storage for server-side
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

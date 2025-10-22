// Export all stores from a single location
export { useAuthStore } from "./authStore";
export type { User } from "./authStore";

export { useResourceStore } from "./resourceStore";
export type { Equipment, Facility, Supply } from "./resourceStore";

export { useUIStore } from "./uiStore";

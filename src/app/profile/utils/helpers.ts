// Types
export interface ProfileData {
  first_name: string;
  last_name: string;
  department: string;
  phone_number: string;
  acc_role: string;
  email: string;
}

export interface UpdateProfileData {
  first_name: string;
  last_name: string;
  department: string;
  phone_number: string;
  acc_role: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthVerifyResponse {
  user_id: string;
  email: string;
  role: string;
}

// Constants
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper Functions

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

/**
 * Handle API errors consistently
 */
export function handleError(error: unknown, context: string): string {
  console.error(`Error in ${context}:`, error);
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
}

// FastAPI Functions

/**
 * Verify JWT token with FastAPI backend
 */
export async function verifyAuth(): Promise<AuthVerifyResponse | null> {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log("verifyAuth: No auth token found");
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Auth verification failed:", response.statusText);
      return null;
    }

    const data: AuthVerifyResponse = await response.json();
    return data;
  } catch (error) {
    handleError(error, "verifyAuth");
    return null;
  }
}

/**
 * Fetch user profile data from FastAPI
 */
export async function fetchUserProfile(
  userId: string
): Promise<ProfileData | null> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/users/${userId}/profile`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const data: ProfileData = await response.json();
    return data;
  } catch (error) {
    handleError(error, "fetchUserProfile");
    return null;
  }
}

/**
 * Update user profile data via FastAPI
 */
export async function updateUserProfile(
  userId: string,
  profileData: UpdateProfileData
): Promise<ProfileData | null> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/users/${userId}/profile`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || "Failed to update profile");
    }

    const data: ProfileData = await response.json();
    return data;
  } catch (error) {
    handleError(error, "updateUserProfile");
    return null;
  }
}

/**
 * Update user password via FastAPI
 */
export async function updateUserPassword(
  passwordData: UpdatePasswordData
): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || "Failed to update password");
    }

    return true;
  } catch (error) {
    throw new Error(handleError(error, "updateUserPassword"));
  }
}

/**
 * Validate password requirements
 */
export function validatePassword(password: string): {
  isValid: boolean;
  message: string;
} {
  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters long",
    };
  }
  return { isValid: true, message: "" };
}

/**
 * Validate passwords match
 */
export function validatePasswordsMatch(
  password: string,
  confirmPassword: string
): { isValid: boolean; message: string } {
  if (password !== confirmPassword) {
    return { isValid: false, message: "Passwords do not match" };
  }
  return { isValid: true, message: "" };
}

/**
 * Format user initials for avatar
 */
export function formatInitials(firstName?: string, lastName?: string): string {
  const firstInitial = firstName?.[0]?.toUpperCase() || "";
  const lastInitial = lastName?.[0]?.toUpperCase() || "";
  return `${firstInitial}${lastInitial}`;
}

/**
 * Format full name
 */
export function formatFullName(firstName?: string, lastName?: string): string {
  return `${firstName || ""} ${lastName || ""}`.trim();
}

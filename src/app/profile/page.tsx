"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import ProfileHeader from "./components/ProfileHeader";
import ProfileForm from "./components/ProfileForm";
import SecuritySection from "./components/SecuritySection";
import SuccessMessage from "./components/SuccessMessage";
import LoadingState from "./components/LoadingState";
import ErrorMessage from "./components/ErrorMessage";
import {
  ProfileData,
  UpdatePasswordData,
  verifyAuth,
  fetchUserProfile,
  updateUserProfile,
  updateUserPassword,
  validatePassword,
  validatePasswordsMatch,
} from "./utils/helpers";

export default function MyProfilePage() {
  // State management
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    department: "",
    phone_number: "",
    acc_role: "",
    email: "",
  });

  // Password management
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState<
    UpdatePasswordData & { confirmPassword: string }
  >({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // UI feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();

  // Fetch profile data
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const profileData = await fetchUserProfile(userId);

      if (!profileData) {
        throw new Error("Failed to load profile data");
      }

      setProfile(profileData);
      setEditForm(profileData);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Auth check and profile loading
  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      // Wait for auth store to initialize
      if (authLoading) return;

      // Check if user is authenticated
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // Verify authentication with backend
      const authData = await verifyAuth();
      if (!authData) {
        router.push("/login");
        return;
      }

      // Fetch profile data
      await fetchProfile(authData.user_id);
    };

    checkAuthAndFetchProfile();
  }, [authLoading, isAuthenticated, router, fetchProfile]);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleEditClick = () => {
    setIsEditing(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(
      profile || {
        first_name: "",
        last_name: "",
        department: "",
        phone_number: "",
        acc_role: "",
        email: "",
      }
    );
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Verify auth and get user ID
      const authData = await verifyAuth();
      if (!authData) {
        router.push("/login");
        return;
      }

      // Update profile
      const updatedProfile = await updateUserProfile(authData.user_id, {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        department: editForm.department,
        phone_number: editForm.phone_number,
        acc_role: editForm.acc_role,
      });

      if (!updatedProfile) {
        throw new Error("Failed to update profile");
      }

      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Password change handlers
  const handlePasswordChange = async () => {
    // Validation
    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    const passwordValidation = validatePassword(passwordForm.newPassword);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
      return;
    }

    const matchValidation = validatePasswordsMatch(
      passwordForm.newPassword,
      passwordForm.confirmPassword
    );
    if (!matchValidation.isValid) {
      setPasswordError(matchValidation.message);
      return;
    }

    try {
      setSaving(true);
      setPasswordError(null);

      await updateUserPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      // Reset form and exit editing mode
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsEditingPassword(false);
      setSuccessMessage("Password updated successfully!");
    } catch (err) {
      console.error("Error updating password:", err);
      setPasswordError(
        err instanceof Error ? err.message : "Failed to update password"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPasswordEdit = () => {
    setIsEditingPassword(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError(null);
  };

  const handlePasswordFormChange = (
    field: keyof (UpdatePasswordData & { confirmPassword: string }),
    value: string
  ) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Loading State
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex flex-col">
        <Navbar />
        <LoadingState
          message={
            authLoading
              ? "Checking authentication..."
              : "Loading your profile..."
          }
        />
        <Footer />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex flex-col">
        <Navbar />
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <ErrorMessage
              message={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex flex-col">
      <Navbar />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <ProfileHeader
            firstName={profile?.first_name}
            lastName={profile?.last_name}
            role={profile?.acc_role}
            department={profile?.department}
          />

          {/* Success Message */}
          {successMessage && (
            <SuccessMessage
              message={successMessage}
              onDismiss={() => setSuccessMessage(null)}
            />
          )}

          {/* Profile Information Card */}
          <ProfileForm
            profile={profile}
            isEditing={isEditing}
            editForm={editForm}
            saving={saving}
            onInputChange={handleInputChange}
            onSave={handleSave}
            onCancel={handleCancelEdit}
            onEdit={handleEditClick}
          />

          {/* Password Change Card */}
          <SecuritySection
            isEditingPassword={isEditingPassword}
            passwordForm={passwordForm}
            passwordError={passwordError}
            saving={saving}
            onPasswordChange={handlePasswordFormChange}
            onSave={handlePasswordChange}
            onCancel={handleCancelPasswordEdit}
            onEdit={() => setIsEditingPassword(true)}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}

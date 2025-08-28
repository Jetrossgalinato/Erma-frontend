"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/auth-helpers-nextjs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

interface ProfileData {
  first_name: string;
  last_name: string;
  department: string;
  phone_number: string;
  acc_role: string;
}

export default function MyProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    department: "",
    phone_number: "",
    acc_role: "",
  });

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        setLoading(true);
        setAuthLoading(true);

        // Check authentication first
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError) {
          console.error("Auth error:", authError);
          router.push("/login");
          return;
        }

        if (!session?.user) {
          router.push("/login");
          return;
        }

        // Set the user from session
        setUser(session.user);

        // Fetch profile data from account_requests table
        const { data: profileData, error: profileError } = await supabase
          .from("account_requests")
          .select("first_name, last_name, department, phone_number, acc_role")
          .eq("user_id", session.user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(profileData);
        setEditForm(
          profileData || {
            first_name: "",
            last_name: "",
            department: "",
            phone_number: "",
            acc_role: "",
          }
        );
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
        setAuthLoading(false);
      }
    };

    checkAuthAndFetchData();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login");
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

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
      }
    );
    setError(null);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);

      const { data, error } = await supabase
        .from("account_requests")
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          department: editForm.department,
          phone_number: editForm.phone_number,
          acc_role: editForm.acc_role,
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
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

  const handlePasswordChange = async () => {
    if (!user) return;

    // Validation
    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    try {
      setSaving(true);
      setPasswordError(null);

      // First, verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: passwordForm.currentPassword,
      });

      if (signInError) {
        setPasswordError("Current password is incorrect");
        return;
      }

      // If current password is correct, update to new password
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

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

  // Loading State
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="relative">
              <RefreshCw className="w-8 h-8 mx-auto text-orange-500 mb-4 animate-spin" />
            </div>
            <p className="text-slate-600 mt-6 text-lg font-medium">
              {authLoading
                ? "Checking authentication..."
                : "Loading your profile..."}
            </p>
          </div>
        </div>
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
            <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-red-400 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-red-800 font-semibold text-lg">
                    Unable to Load Profile
                  </h3>
                  <p className="text-red-700 mt-1">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 text-red-800 underline hover:text-red-900 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
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
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {profile?.first_name?.[0]}
                  {profile?.last_name?.[0]}
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-800 mb-2">
                  {profile?.first_name} {profile?.last_name}
                </h1>
                <p className="text-slate-600 text-lg">{profile?.acc_role}</p>
                <p className="text-slate-500">{profile?.department}</p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 shadow-sm animate-pulse">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-400 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Profile Information Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 mb-8">
            <div className="p-8 border-b border-slate-200/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Profile Information
                </h2>
                <p className="text-slate-600">
                  Manage your personal account details
                </p>
              </div>

              {!isEditing ? (
                <button
                  onClick={handleEditClick}
                  className="group inline-flex items-center px-6 py-3 border-2 border-slate-300 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white/80 hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="inline-flex items-center px-6 py-3 border-2 border-slate-300 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white/80 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-6 py-3 border-2 border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* First Name */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.first_name || ""}
                      onChange={(e) =>
                        handleInputChange("first_name", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-slate-200 text-gray-800 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/80"
                      placeholder="Enter your first name"
                    />
                  ) : (
                    <div className="bg-slate-50/80 px-4 py-3 rounded-xl border-2 border-slate-100">
                      <p className="text-slate-800 font-medium">
                        {profile?.first_name || "Not specified"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.last_name || ""}
                      onChange={(e) =>
                        handleInputChange("last_name", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-slate-200 text-gray-800 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/80"
                      placeholder="Enter your last name"
                    />
                  ) : (
                    <div className="bg-slate-50/80 px-4 py-3 rounded-xl border-2 border-slate-100">
                      <p className="text-slate-800 font-medium">
                        {profile?.last_name || "Not specified"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-4 py-3 rounded-xl border-2 border-slate-200 flex items-center">
                      <svg
                        className="w-5 h-5 text-slate-400 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                      <p className="text-slate-700 font-medium">
                        {user?.email}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Email address cannot be modified
                    </p>
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Department
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.department || ""}
                      onChange={(e) =>
                        handleInputChange("department", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-slate-200 text-gray-800 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/80"
                      placeholder="Enter your department"
                    />
                  ) : (
                    <div className="bg-slate-50/80 px-4 py-3 rounded-xl border-2 border-slate-100">
                      <p className="text-slate-800 font-medium">
                        {profile?.department || "Not specified"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone_number || ""}
                      onChange={(e) =>
                        handleInputChange("phone_number", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-slate-200 text-gray-800 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/80"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="bg-slate-50/80 px-4 py-3 rounded-xl border-2 border-slate-100">
                      <p className="text-slate-800 font-medium">
                        {profile?.phone_number || "Not provided"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Account Role */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Account Role
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.acc_role || ""}
                      onChange={(e) =>
                        handleInputChange("acc_role", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-slate-200 text-gray-800 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/80"
                      placeholder="Enter your account role"
                    />
                  ) : (
                    <div className="bg-slate-50/80 px-4 py-3 rounded-xl border-2 border-slate-100">
                      <p className="text-slate-800 font-medium">
                        {profile?.acc_role || "Not specified"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
            <div className="p-8 border-b border-slate-200/50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Security Settings
                </h2>
                <p className="text-slate-600">
                  Update your account password and security preferences
                </p>
              </div>

              {!isEditingPassword ? (
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="group inline-flex items-center px-6 py-3 border-2 border-amber-300 rounded-xl shadow-sm text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 hover:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20 transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Change Password
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelPasswordEdit}
                    disabled={saving}
                    className="inline-flex items-center px-6 py-3 border-2 border-slate-300 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white/80 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={saving}
                    className="inline-flex items-center px-6 py-3 border-2 border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="p-8">
              {!isEditingPassword ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-600 text-lg">
                    Keep your account secure by updating your password regularly
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Click {"Change Password"} above to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {passwordError && (
                    <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-red-400 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-red-800 font-medium">
                          {passwordError}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-slate-200 text-orange-800 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/80"
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-slate-200 text-orange-800 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/80"
                      placeholder="Enter your new password"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-slate-200 text-orange-800 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/80"
                      placeholder="Confirm your new password"
                    />
                  </div>

                  <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-4 mt-6">
                    <div className="flex items-start">
                      <svg
                        className="w-5 h-5 text-orange-400 mr-3 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <h4 className="text-orange-800 font-semibold mb-1">
                          Password Requirements
                        </h4>
                        <ul className="text-orange-700 text-sm space-y-1">
                          <li>• Minimum 6 characters long</li>
                          <li>• Use a strong, unique password</li>
                          <li>
                            • Consider using a mix of letters, numbers, and
                            symbols
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

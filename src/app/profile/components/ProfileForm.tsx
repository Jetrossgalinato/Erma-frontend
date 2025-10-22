import { ProfileData } from "../utils/helpers";

interface ProfileFormProps {
  profile: ProfileData | null;
  isEditing: boolean;
  editForm: ProfileData;
  saving: boolean;
  onInputChange: (field: keyof ProfileData, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
}

export default function ProfileForm({
  profile,
  isEditing,
  editForm,
  saving,
  onInputChange,
  onSave,
  onCancel,
  onEdit,
}: ProfileFormProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 mb-8">
      {/* Header */}
      <div className="p-8 border-b border-slate-200/50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Profile Information
          </h2>
          <p className="text-slate-600">Manage your personal account details</p>
        </div>

        {!isEditing ? (
          <button
            onClick={onEdit}
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
              onClick={onCancel}
              disabled={saving}
              className="inline-flex items-center px-6 py-3 border-2 border-slate-300 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white/80 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center px-6 py-3 border-2 border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
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

      {/* Form Fields */}
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
                onChange={(e) => onInputChange("first_name", e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 text-gray-800 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/80"
                placeholder="Enter your first name"
              />
            ) : (
              <div className="bg-slate-50/80 px-4 py-3 rounded-xl border-2 border-slate-100">
                <p className="text-slate-800 font-medium">
                  {profile?.first_name || "Not provided"}
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
                onChange={(e) => onInputChange("last_name", e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 text-gray-800 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/80"
                placeholder="Enter your last name"
              />
            ) : (
              <div className="bg-slate-50/80 px-4 py-3 rounded-xl border-2 border-slate-100">
                <p className="text-slate-800 font-medium">
                  {profile?.last_name || "Not provided"}
                </p>
              </div>
            )}
          </div>

          {/* Email (Read-only) */}
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
                  {profile?.email || "Not provided"}
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
                onChange={(e) => onInputChange("department", e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 text-gray-800 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/80"
                placeholder="Enter your department"
              />
            ) : (
              <div className="bg-slate-50/80 px-4 py-3 rounded-xl border-2 border-slate-100">
                <p className="text-slate-800 font-medium">
                  {profile?.department || "Not provided"}
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
                onChange={(e) => onInputChange("phone_number", e.target.value)}
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
                onChange={(e) => onInputChange("acc_role", e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 text-gray-800 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/80"
                placeholder="Enter your account role"
              />
            ) : (
              <div className="bg-slate-50/80 px-4 py-3 rounded-xl border-2 border-slate-100">
                <p className="text-slate-800 font-medium">
                  {profile?.acc_role || "Not provided"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

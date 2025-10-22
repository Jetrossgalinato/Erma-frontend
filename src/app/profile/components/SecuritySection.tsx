import { UpdatePasswordData } from "../utils/helpers";

interface SecuritySectionProps {
  isEditingPassword: boolean;
  passwordForm: UpdatePasswordData & { confirmPassword: string };
  passwordError: string | null;
  saving: boolean;
  onPasswordChange: (
    field: keyof (UpdatePasswordData & { confirmPassword: string }),
    value: string
  ) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
}

export default function SecuritySection({
  isEditingPassword,
  passwordForm,
  passwordError,
  saving,
  onPasswordChange,
  onSave,
  onCancel,
  onEdit,
}: SecuritySectionProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
      {/* Header */}
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
            onClick={onEdit}
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
              onClick={onCancel}
              disabled={saving}
              className="inline-flex items-center px-6 py-3 border-2 border-slate-300 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white/80 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center px-6 py-3 border-2 border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                  Update Password
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
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
              Click &quot;Change Password&quot; above to get started
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
                  <p className="text-red-800 font-medium">{passwordError}</p>
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
                  onPasswordChange("currentPassword", e.target.value)
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
                  onPasswordChange("newPassword", e.target.value)
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
                  onPasswordChange("confirmPassword", e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-slate-200 text-orange-800 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/80"
                placeholder="Confirm your new password"
              />
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-4 mt-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-orange-400 mr-3 mt-0.5"
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
                  <h4 className="text-orange-800 font-semibold text-sm">
                    Password Requirements
                  </h4>
                  <ul className="text-orange-700 text-sm mt-2 space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• New password must match confirmation</li>
                    <li>• Current password is required for verification</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

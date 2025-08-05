import { supabase } from "./supabaseClient"; // Adjust path as needed

// Helper function to map original roles to system roles
export function mapRoleToSystemRole(originalRole: string): string {
  const superAdminRoles = ["CCIS Dean", "Lab Technician", "Comlab Adviser"];
  const adminRoles = ["Department Chairperson", "Associate Dean"];
  const staffRoles = ["College Clerk", "Student Assistant"];
  const facultyRoles = ["Lecturer", "Instructor"];

  if (superAdminRoles.includes(originalRole)) {
    return "Super Admin";
  } else if (adminRoles.includes(originalRole)) {
    return "Admin";
  } else if (staffRoles.includes(originalRole)) {
    return "Staff";
  } else if (facultyRoles.includes(originalRole)) {
    return "Faculty";
  } else {
    return "Unknown"; // Handle edge case
  }
}

// Example usage in your admin approval function
export async function approveAccount(userId: string, originalRole: string) {
  const approvedRole = mapRoleToSystemRole(originalRole);

  // Update the account_requests table with the approved role
  const { error } = await supabase
    .from("account_requests")
    .update({
      approved_acc_role: approvedRole,
      status: "approved", // if you have a status column
      approved_at: new Date().toISOString(), // if you want to track approval time
    })
    .eq("user_id", userId);

  if (error) {
    console.error("Error approving account:", error);
    return { success: false, error };
  }

  // Optionally, you might also want to update the user's metadata in Supabase Auth
  const { error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    {
      user_metadata: {
        acc_role: approvedRole, // Update to the system role
      },
    }
  );

  if (authError) {
    console.error("Error updating user metadata:", authError);
    return { success: false, error: authError };
  }

  return { success: true, approvedRole };
}

// Additional helper function to get all available roles
export function getAvailableRoles() {
  return [
    "CCIS Dean",
    "Lab Technician",
    "Comlab Adviser",
    "Department Chairperson",
    "Associate Dean",
    "College Clerk",
    "Student Assistant",
    "Lecturer",
    "Instructor",
  ];
}

// Helper to get system roles
export function getSystemRoles() {
  return ["Super Admin", "Admin", "Staff", "Faculty"];
}

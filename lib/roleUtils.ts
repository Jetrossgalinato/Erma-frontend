// Helper function to map original roles to system roles
export function mapRoleToSystemRole(originalRole: string): string {
  const superAdminRoles = [
    "CCIS Dean",
    "Lab Technician",
    "Comlab Adviser",
    "Super Admin",
  ];
  const adminRoles = ["Department Chairperson", "Associate Dean", "Admin"];
  const staffRoles = ["College Clerk", "Student Assistant", "Staff"];
  const facultyRoles = ["Faculty", "Lecturer", "Instructor"];

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

// Helper to get Tailwind badge classes for a given role
export function getRoleBadgeClass(role: string): string {
  const systemRole = mapRoleToSystemRole(role);
  switch (systemRole) {
    case "Super Admin":
      return "border border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
    case "Admin":
      return "border border-purple-300 dark:border-purple-700 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400";
    case "Staff":
      return "border border-teal-300 dark:border-teal-700 bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400";
    case "Faculty":
      return "border border-blue-200 dark:border-blue-700 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400";
    default:
      return "border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400";
  }
}

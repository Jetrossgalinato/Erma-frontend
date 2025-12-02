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

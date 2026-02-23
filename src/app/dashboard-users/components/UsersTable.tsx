import { User } from "../utils/helpers";
import { mapRoleToSystemRole } from "../../../../lib/roleUtils";

function getRoleBadgeClass(role: string): string {
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

interface UsersTableProps {
  users: User[];
  selectedRows: string[];
  onSelectRow: (id: string) => void;
  onSelectAll: () => void;
}

export default function UsersTable({
  users,
  selectedRows,
  onSelectRow,
  onSelectAll,
}: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-gray-500 dark:text-gray-400">No users found</span>
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
              checked={selectedRows.length === users.length && users.length > 0}
              onChange={onSelectAll}
            />
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
            First Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
            Last Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
            Email
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
            Department
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
            Phone Number
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Account Role
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {users.map((user) => (
          <tr
            key={user.id}
            className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <td className="w-12 px-6 py-4 whitespace-nowrap border-r border-gray-100 dark:border-gray-700">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                checked={selectedRows.includes(user.id)}
                onChange={() => onSelectRow(user.id)}
              />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 border-r border-gray-100 dark:border-gray-700">
              {user.first_name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-r border-gray-100 dark:border-gray-700">
              {user.last_name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-r border-gray-100 dark:border-gray-700">
              {user.email}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-r border-gray-100 dark:border-gray-700">
              {user.department}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-r border-gray-100 dark:border-gray-700">
              {user.phone_number}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeClass(user.acc_role)}`}
              >
                {user.acc_role}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

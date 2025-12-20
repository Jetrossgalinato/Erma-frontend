import { User } from "../utils/helpers";

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
          <th className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
              checked={selectedRows.length === users.length && users.length > 0}
              onChange={onSelectAll}
            />
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            First Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Last Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Email
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Department
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Phone Number
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Account Role
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Approved Role
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        {users.map((user) => (
          <tr
            key={user.id}
            className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <td className="w-12 px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                checked={selectedRows.includes(user.id)}
                onChange={() => onSelectRow(user.id)}
              />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
              {user.first_name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              {user.last_name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              {user.email}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              {user.department}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
              {user.phone_number}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-700 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                {user.acc_role}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {user.approved_acc_role ? (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border border-green-200 dark:border-green-700 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                  {user.approved_acc_role}
                </span>
              ) : (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400">
                  Pending
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

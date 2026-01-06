import { Facility, getStatusColor } from "../utils/helpers";

interface FacilitiesTableProps {
  data: Facility[];
  isAuthenticated: boolean;
  isLoading: boolean;
  onBook: (facility: Facility) => void;
  onViewDetails: (facility: Facility) => void;
}

export default function FacilitiesTable({
  data,
  isAuthenticated,
  isLoading,
  onBook,
  onViewDetails,
}: FacilitiesTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-8 sm:mb-12">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Floor
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Capacity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-l"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((facility) => (
              <tr key={facility.facility_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {facility.facility_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {facility.facility_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {facility.floor_level}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {facility.capacity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      facility.status
                    )}`}
                  >
                    {facility.status}
                  </span>
                </td>
                <td
                  className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate"
                  title={facility.description || ""}
                >
                  {facility.description || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white shadow-l">
                  <div className="flex justify-end gap-2">
                    {/* View Details Logic is usually handled by modal, but since table shows all, maybe unnecessary? 
                        User asked for "same row form feature". In Equipment, I kept 'Actions' but removed Details button 
                        and added columns. For Facility, I've added Description column. 
                        I will keep the Book button. 
                    */}
                    {isLoading ? (
                      <div className="px-3 py-1 bg-gray-200 rounded-lg animate-pulse w-20 h-6"></div>
                    ) : (
                      <button
                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                          facility.status === "Available" && isAuthenticated
                            ? "bg-orange-600 text-white hover:bg-orange-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        onClick={() => {
                          if (
                            facility.status === "Available" &&
                            isAuthenticated
                          ) {
                            onBook(facility);
                          }
                        }}
                        disabled={
                          facility.status !== "Available" || !isAuthenticated
                        }
                        title={
                          !isAuthenticated
                            ? "Please log in to book facility"
                            : facility.status !== "Available"
                            ? "This facility is currently unavailable"
                            : "Book this facility"
                        }
                      >
                        Book
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

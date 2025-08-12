"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Define the shape of one row from your equipments table
type Equipment = {
  id: number;
  po_number?: string;
  unit_number?: string;
  brand_name?: string;
  description?: string;
  category?: string;
  status?: string;
  date_acquired?: string;
  supplier?: string;
  amount?: string;
  estimated_life?: string;
  item_number?: string;
  property_num?: string;
  control_numb?: string;
  serial_number?: string;
  person_liable?: string;
  remarks?: string;
  updated_at?: string;
  name: string;
  facility_id?: number;
  availability?: string;
  quantity: number;
  created_at: string;
};

export default function DashboardEquipmentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const fetchEquipments = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("equipments").select("*");

      if (error) {
        console.error("Error fetching equipments:", error);
      } else {
        setEquipments(data as Equipment[]);
      }
      setLoading(false);
    };

    fetchEquipments();
  }, [supabase]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <span className="text-gray-400">-</span>;

    const statusColors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      retired: "bg-gray-100 text-gray-800",
    };

    const colorClass =
      statusColors[status.toLowerCase() as keyof typeof statusColors] ||
      "bg-blue-100 text-blue-800";

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        {status}
      </span>
    );
  };

  const getAvailabilityBadge = (availability?: string) => {
    if (!availability) return <span className="text-gray-400">-</span>;

    const availabilityColors = {
      available: "bg-green-100 text-green-800",
      unavailable: "bg-red-100 text-red-800",
      "in use": "bg-yellow-100 text-yellow-800",
    };

    const colorClass =
      availabilityColors[
        availability.toLowerCase() as keyof typeof availabilityColors
      ] || "bg-blue-100 text-blue-800";

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
      >
        {availability}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 shadow-sm">
        <DashboardNavbar />
      </header>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="w-64 h-full">
          <Sidebar />
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 relative overflow-y-auto focus:outline-none mt-16">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="mb-8 pt-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Equipments
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Welcome to the Equipments page, where you can manage all your
                  equipment efficiently.
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-3 text-gray-600">
                    Loading equipments...
                  </span>
                </div>
              ) : equipments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg">
                    No equipments found.
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            ID
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Name
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            PO Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Unit Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Brand
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Category
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Status
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Availability
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Quantity
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Date Acquired
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Supplier
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Amount
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Serial Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Property Number
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Person Liable
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {equipments.map((eq, index) => (
                          <tr
                            key={eq.id}
                            className={`hover:bg-gray-50 ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            }`}
                          >
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100 font-mono">
                              {eq.id}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-100">
                              {eq.name}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 font-mono">
                              {eq.po_number || "-"}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 font-mono">
                              {eq.unit_number || "-"}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {eq.brand_name || "-"}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {eq.category || "-"}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm border-r border-gray-100">
                              {getStatusBadge(eq.status)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm border-r border-gray-100">
                              {getAvailabilityBadge(eq.availability)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100 font-semibold">
                              {eq.quantity}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {formatDate(eq.date_acquired)}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {eq.supplier || "-"}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100 font-mono">
                              {eq.amount ? `₱${eq.amount}` : "-"}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 font-mono">
                              {eq.serial_number || "-"}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 font-mono">
                              {eq.property_num || "-"}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100">
                              {eq.person_liable || "-"}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-600 max-w-xs">
                              <div
                                className="truncate"
                                title={eq.description || ""}
                              >
                                {eq.description || "-"}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table footer with row count */}
                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Showing {equipments.length} equipment
                      {equipments.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

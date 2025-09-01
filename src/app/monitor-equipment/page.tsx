"use client";
import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface EquipmentLog {
  id: number;
  log_message: string;
  created_at: string;
}

export default function MonitorEquipmentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };
  const [equipmentLogs, setEquipmentLogs] = useState<EquipmentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchEquipmentLogs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("equipment_logs")
          .select(
            `
    id,
    log_message,
    created_at
  `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Add this line to actually use the fetched data
        setEquipmentLogs(data || []);
      } catch (error) {
        console.error("Error fetching equipment logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentLogs();
  }, [supabase]);

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
              <div className="mb-8 pt-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Equipment Monitoring
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    View and track the status of all equipment in real time,
                    including availability, usage, and maintenance updates.
                  </p>
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Equipment Logs
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-gray-500">
                        Loading equipment logs...
                      </div>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Log Message
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {equipmentLogs.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              No equipment logs found
                            </td>
                          </tr>
                        ) : (
                          equipmentLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <div className="max-w-xs truncate">
                                  {log.log_message}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";
import DashboardNavbar from "@/components/DashboardNavbar";
import Sidebar from "@/components/Sidebar";
import BorrowingRequests from "@/components/BorrowingRequests";
import BookingRequests from "@/components/BookingRequests";
import AcquiringRequests from "@/components/AcquiringRequests";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User as SupabaseUser } from "@supabase/supabase-js";

export default function DashboardRequestsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRequestType, setSelectedRequestType] =
    useState("Borrowing Requests");
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Auth guard logic (copied and adapted from dashboard-equipment)
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace("/home");
      } else {
        setCurrentUser(session.user);
      }
      setAuthLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        router.replace("/home");
      } else {
        setCurrentUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-gray-500 dark:text-gray-300">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                    Requests List
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Monitor requests for borrowing equipment, booking
                    facilities, and acquiring supplies—all in one place.
                  </p>
                </div>
                <div className="mb-6">
                  <div className="relative inline-block text-left">
                    <select
                      value={selectedRequestType}
                      onChange={(e) => setSelectedRequestType(e.target.value)}
                      className="block w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Borrowing Requests">
                        Borrowing Requests
                      </option>
                      <option value="Booking Requests">Booking Requests</option>
                      <option value="Acquiring Requests">
                        Acquiring Requests
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            {selectedRequestType === "Borrowing Requests" && (
              <BorrowingRequests />
            )}
            {selectedRequestType === "Booking Requests" && <BookingRequests />}
            {selectedRequestType === "Acquiring Requests" && (
              <AcquiringRequests />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

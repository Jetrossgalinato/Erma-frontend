import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { RefreshCw } from "lucide-react";

export default function SuppliesPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Facilities
              </h1>
              <p className="text-gray-600">
                View all facility records, filter by type, floor level, or
                building, and search for specific facilities.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchFacilities}
                disabled={loading}
                className="px-4 py-2 cursor-pointer text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

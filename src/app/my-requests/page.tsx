"use client";
import Navbar from "@/components/Navbar";
import { useCallback, useState } from "react";
import { RefreshCw } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/../lib/database.types";

type BorrowingStatus = "Pending" | "Approved" | "Rejected";

interface Borrowing {
  id: number;
  created_at: string;
}

export default function MyRequestsPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient<Database>();
  const [borrowingData, setBorrowingData] = useState<Borrowing[]>([]);

  const fetchBorrowing = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("borrowing").select("*");
    if (error) {
      console.error("Failed to fetch borrowing data:", error);
    } else {
      setBorrowingData(data as Borrowing[]);
    }
    setLoading(false);
  }, [supabase]);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Requests
              </h1>
              <p className="text-gray-600">
                Track your equipment borrowing requests and their current status
              </p>
            </div>
            <div className="flex gap-3 mb-6">
              <button
                onClick={fetchBorrowing}
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
    </div>
  );
}

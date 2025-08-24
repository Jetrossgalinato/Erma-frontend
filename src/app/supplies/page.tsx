"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/../lib/database.types";

interface Supplies {
  id: number;
  image?: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  stocking_point: number;
  stock_unit: string;
  facilities: {
    id: number;
    name: string;
  };
  remarks?: string;
}

export default function SuppliesPage() {
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(false);
  const [supplies, setSupplies] = useState<Supplies[]>([]);

  const fetchSupplies = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("supplies").select("*");

    if (error) {
      console.error("Error fetching supplies:", error);
    } else {
      setSupplies(data as Supplies[]);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Supplies
              </h1>
              <p className="text-gray-600">
                View all supply records, filter by category, or search for
                specific supplies.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchSupplies}
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

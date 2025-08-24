"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
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

const facility = [
  "All Facilities",
  "CL1",
  "CL2",
  "CL3",
  "CL4",
  "CL5",
  "CL6",
  "CL10",
  "CL11",
  "MULTIMEDIA LAB",
  "MSIT LAB",
  "NET LAB",
  "DEANS OFFICE",
  "FACULTY OFFICE",
  "REPAIR ROOM",
  "AIR LAB",
  "CHCI",
  "VLRC",
  "ICTC",
  "NAVIGATU",
];

export default function SuppliesPage() {
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(false);
  const [supplies, setSupplies] = useState<Supplies[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedFacility, setSelectedFacility] = useState("All Facilities");

  const fetchSupplies = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("supplies")
      .select("*, facilities(id, name)");

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

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(
        supplies
          .map((e) => e.category)
          .filter((cat): cat is string => cat !== null)
      )
    );
    return ["All Categories", ...unique];
  }, [supplies]);

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
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search supply..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  value={selectedCategory ?? ""}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <select
                  value={selectedFacility ?? ""}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  {facility.map((facility) => (
                    <option key={facility} value={facility}>
                      {facility}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

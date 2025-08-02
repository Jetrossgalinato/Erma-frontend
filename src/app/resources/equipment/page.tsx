import Navbar from "@/components/Navbar";
export default function EquipmentPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Equipment Management</h1>
          <p className="text-gray-600 mb-4">
            Manage your equipment efficiently.
          </p>
          {/* Additional content for equipment management can be added here */}
        </div>
      </div>
    </div>
  );
}

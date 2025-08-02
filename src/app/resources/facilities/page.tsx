import Navbar from "@/components/Navbar";

export default function FacilitiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Facilities Management</h1>
          <p className="text-gray-600 mb-4">
            Manage your facilities efficiently.
          </p>
          {/* Additional content for facilities management can be added here */}
        </div>
      </div>
    </div>
  );
}

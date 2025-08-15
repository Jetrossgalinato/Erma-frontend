import Navbar from "@/components/Navbar";

export default function MyRequestsPage() {
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
          </div>
        </div>
      </div>
    </div>
  );
}

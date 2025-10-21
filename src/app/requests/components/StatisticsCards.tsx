import { Calendar, UserCheck, UserX } from "lucide-react";

interface StatisticsCardsProps {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export default function StatisticsCards({
  pendingCount,
  approvedCount,
  rejectedCount,
}: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Pending Requests
            </p>
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-full">
            <Calendar className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <UserCheck className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
          </div>
          <div className="p-3 bg-red-100 rounded-full">
            <UserX className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

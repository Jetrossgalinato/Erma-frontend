import { User, Mail, ArrowRight, UserCheck, UserX, Trash2 } from "lucide-react";
import { mapRoleToSystemRole } from "@/../lib/roleUtils";
import type { AccountRequest } from "../utils/helpers";
import { getStatusColor } from "../utils/helpers";

interface RequestCardProps {
  request: AccountRequest;
  onApprove: (requestId: number, originalRole: string) => void;
  onReject: (requestId: number) => void;
  onDelete: (requestId: number) => void;
}

export default function RequestCard({
  request,
  onApprove,
  onReject,
  onDelete,
}: RequestCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 flex-1">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {request.firstName} {request.lastName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-600">{request.email}</p>
              </div>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              request.status
            )}`}
          >
            {request.status}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {request.department && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Department:</span>{" "}
              {request.department}
            </p>
          )}

          {request.acc_role && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Requested Role:</span>{" "}
              {request.acc_role}
              {request.approved_acc_role && request.status === "Approved" && (
                <div className="flex items-center gap-2 mt-1 text-xs text-green-600">
                  <ArrowRight className="w-3 h-3" />
                  <span>Approved as: {request.approved_acc_role}</span>
                </div>
              )}
            </div>
          )}

          {request.phoneNumber && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Phone:</span> {request.phoneNumber}
            </p>
          )}

          <p className="text-sm text-gray-600">
            <span className="font-medium">Requested:</span>{" "}
            {request.requestedAt}
          </p>
        </div>

        <div className="space-y-2 mt-auto">
          {request.status === "Pending" && (
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(request.id, request.acc_role || "")}
                className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
              >
                <UserCheck className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => onReject(request.id)}
                className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
              >
                <UserX className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}
          <button
            onClick={() => onDelete(request.id)}
            className="w-full px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 flex items-center justify-center gap-2 group"
            title="Remove request"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Remove Request</span>
          </button>
        </div>
      </div>
    </div>
  );
}

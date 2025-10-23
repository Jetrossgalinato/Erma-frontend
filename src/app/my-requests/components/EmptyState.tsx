import { Inbox } from "lucide-react";

interface EmptyStateProps {
  requestType: "borrowing" | "booking" | "acquiring";
}

export default function EmptyState({ requestType }: EmptyStateProps) {
  const getMessage = () => {
    switch (requestType) {
      case "borrowing":
        return "No borrowing requests found";
      case "booking":
        return "No booking requests found";
      case "acquiring":
        return "No acquiring requests found";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Inbox className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-gray-600 text-sm">{getMessage()}</p>
    </div>
  );
}

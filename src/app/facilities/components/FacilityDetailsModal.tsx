import { Facility } from "../utils/helpers";

interface FacilityDetailsModalProps {
  isOpen: boolean;
  facility: Facility | null;
  onClose: () => void;
}

export default function FacilityDetailsModal({
  isOpen,
  facility,
  onClose,
}: FacilityDetailsModalProps) {
  if (!isOpen || !facility) return null;

  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-sm bg-opacity-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-xs sm:max-w-xl p-3 sm:p-6 relative shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          &times;
        </button>
        <h2 className="text-lg sm:text-2xl text-gray-800 font-bold mb-2 sm:mb-4">
          {facility.facility_name}
        </h2>
        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
          <p>
            <strong>Facility ID:</strong> {facility.facility_id}
          </p>
          <p>
            <strong>Facility Type:</strong> {facility.facility_type}
          </p>
          <p>
            <strong>Floor Level:</strong> {facility.floor_level}
          </p>
          <p>
            <strong>Capacity:</strong> {facility.capacity}
          </p>
          <p>
            <strong>Status:</strong> {facility.status}
          </p>
          {facility.description && (
            <p>
              <strong>Description:</strong> {facility.description}
            </p>
          )}
          {facility.image_url && (
            <p>
              <strong>Image:</strong>{" "}
              <a
                href={facility.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:underline"
              >
                View Image
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { Facility, BookingFormData } from "../utils/helpers";

interface BookFacilityModalProps {
  isOpen: boolean;
  facility: Facility | null;
  bookingData: BookingFormData;
  bookingLoading: boolean;
  onClose: () => void;
  onBookingDataChange: (data: BookingFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function BookFacilityModal({
  isOpen,
  facility,
  bookingData,
  bookingLoading,
  onClose,
  onBookingDataChange,
  onSubmit,
}: BookFacilityModalProps) {
  if (!isOpen || !facility) return null;

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getMinEndDate = (startDate: string) => {
    if (!startDate) return getCurrentDateTime();

    // Create a new Date object from the startDate string
    const date = new Date(startDate);

    // Add 1 minute to ensure end date is after start date
    date.setMinutes(date.getMinutes() + 1);

    // Format the date back to YYYY-MM-DDTHH:mm string manually
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-sm bg-opacity-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-xs sm:max-w-md p-3 sm:p-6 relative shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          &times;
        </button>
        <h2 className="text-lg sm:text-2xl text-gray-800 font-semibold mb-2 sm:mb-4">
          Book {facility.facility_name}
        </h2>

        <form onSubmit={onSubmit} className="space-y-2 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Purpose <span className="text-red-500">*</span>
            </label>
            <textarea
              value={bookingData.purpose}
              onChange={(e) =>
                onBookingDataChange({ ...bookingData, purpose: e.target.value })
              }
              placeholder="Describe the purpose of your booking..."
              required
              rows={2}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={bookingData.start_date}
              onChange={(e) =>
                onBookingDataChange({
                  ...bookingData,
                  start_date: e.target.value,
                })
              }
              required
              min={getCurrentDateTime()}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={bookingData.end_date}
              onChange={(e) =>
                onBookingDataChange({
                  ...bookingData,
                  end_date: e.target.value,
                })
              }
              required
              min={getMinEndDate(bookingData.start_date)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 text-xs sm:text-sm text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-base text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookingLoading}
              className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 text-xs sm:text-base"
            >
              {bookingLoading ? "Booking..." : "Submit Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React from "react";

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  equipmentName: string | null;
  onClose: () => void;
}

export default function ImageModal({
  isOpen,
  imageUrl,
  equipmentName,
  onClose,
}: ImageModalProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
      tabIndex={0}
      autoFocus
    >
      {/* Equipment name - Fixed to top-left of screen */}
      <div className="fixed top-2 sm:top-4 left-2 sm:left-4 z-10 bg-black bg-opacity-50 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
        <h3 className="text-white text-base sm:text-lg font-semibold">
          {equipmentName}
        </h3>
      </div>

      {/* Close button - Fixed to top-right of screen */}
      <button
        onClick={onClose}
        className="fixed top-2 sm:top-4 right-2 sm:right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-1 sm:p-2 hover:bg-opacity-70 transition-all"
        title="Close (Esc)"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="relative max-w-xs sm:max-w-4xl max-h-[70vh] sm:max-h-[90vh] w-full h-full flex items-center justify-center">
        <div
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
          onClick={onClose}
        >
          <img
            src={imageUrl}
            alt="Equipment preview"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            style={{
              maxWidth: "90vw",
              maxHeight: "70vh",
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML =
                  '<div class="text-white text-center"><p class="text-lg mb-2">Failed to load image</p><p class="text-sm opacity-75">The image could not be displayed</p></div>';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * ImageModal Component
 *
 * Modal for viewing full-size supply images
 */

import React from "react";
import { X } from "lucide-react";

interface ImageModalProps {
  imageUrl: string;
  supplyName: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  imageUrl,
  supplyName,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-75"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
      tabIndex={0}
      role="dialog"
      aria-label="Image preview"
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
          title="Close (Esc)"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Supply name */}
        <div className="fixed top-4 left-4 z-10 bg-black bg-opacity-50 rounded-lg px-3 py-2">
          <p className="text-white text-sm font-medium">{supplyName}</p>
        </div>

        {/* Image container */}
        <img
          src={imageUrl}
          alt={`${supplyName} supply preview`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          style={{ maxWidth: "90vw", maxHeight: "90vh" }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default ImageModal;

"use client";
import React from "react";
import { X } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  imageName: string;
  onClose: () => void;
}

export default function ImageModal({
  isOpen,
  imageUrl,
  imageName,
  onClose,
}: ImageModalProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-75"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
      tabIndex={0}
      autoFocus
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
          title="Close (Esc)"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="fixed top-4 left-4 z-10 bg-black bg-opacity-50 rounded-lg px-3 py-2">
          <p className="text-white text-sm font-medium">{imageName}</p>
        </div>

        <div
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
          onClick={onClose}
        >
          <img
            src={imageUrl}
            alt={`${imageName} equipment preview`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
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

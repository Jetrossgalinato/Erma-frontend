import Image from "next/image";

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
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-75"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
      tabIndex={0}
      autoFocus
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="fixed top-2 sm:top-4 right-2 sm:right-4 z-10 p-1.5 sm:p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
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

        {/* Supply name */}
        <div className="fixed top-2 sm:top-4 left-2 sm:left-4 z-10 bg-black bg-opacity-50 rounded-lg px-2 sm:px-3 py-1 sm:py-2">
          <p className="text-white text-xs sm:text-sm font-medium">
            {imageName}
          </p>
        </div>

        {/* Image container */}
        <div
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
          onClick={onClose}
        >
          <Image
            src={imageUrl}
            alt={`${imageName} supply preview`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            style={{ maxWidth: "90vw", maxHeight: "90vh" }}
            width={500}
            height={500}
            sizes="100vw"
          />
        </div>
      </div>
    </div>
  );
}

"use client";

interface ErrorBannerProps {
  message: string;
  onClose?: () => void;
}

export default function ErrorBanner({ message, onClose }: ErrorBannerProps) {
  if (!message) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-6 py-3 flex items-center justify-between">
      <span className="text-sm">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-white font-bold text-lg leading-none">
          ×
        </button>
      )}
    </div>
  );
}

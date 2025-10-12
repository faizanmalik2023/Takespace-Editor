'use client';

interface ClearCanvasModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ClearCanvasModal({ isOpen, onConfirm, onCancel }: ClearCanvasModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Clear Canvas</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to clear the entire canvas? This will remove all shapes, drawings, text, and other elements. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Yes, Clear Canvas
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}










'use client';

import { useState, useEffect } from 'react';

interface TextEditModalProps {
  isOpen: boolean;
  text: string;
  onSave: (newText: string) => void;
  onCancel: () => void;
}

export default function TextEditModal({ isOpen, text, onSave, onCancel }: TextEditModalProps) {
  const [textValue, setTextValue] = useState(text);

  // Update textValue when text prop changes
  useEffect(() => {
    setTextValue(text);
  }, [text]);

  const handleSave = () => {
    onSave(textValue);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Edit Text</h3>
        <textarea
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          className="w-full p-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Enter your text..."
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

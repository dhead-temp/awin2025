import React, { memo } from "react";

interface SubmitButtonsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isUploading: boolean;
  hasFile: boolean;
}

const SubmitButtons = memo(({ 
  onCancel, 
  onSubmit, 
  isUploading, 
  hasFile 
}: SubmitButtonsProps) => (
  <div className="flex gap-3 pt-4">
    <button
      onClick={onCancel}
      className="flex-1 py-3 px-4 rounded-xl font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
    >
      Cancel
    </button>
    <button
      onClick={onSubmit}
      disabled={!hasFile || isUploading}
      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
        !hasFile || isUploading
          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
      }`}
    >
      {isUploading ? "Submitting..." : "Submit Proof"}
    </button>
  </div>
));

SubmitButtons.displayName = "SubmitButtons";

export default SubmitButtons;

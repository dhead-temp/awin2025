import React, { memo } from "react";
import { AlertCircle } from "lucide-react";

const WarningMessage = memo(() => (
  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
    <div className="flex items-start gap-2">
      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
      <div className="text-sm text-red-800">
        <p className="font-semibold mb-1">Important Warning:</p>
        <p>
          Wrong or fake screenshots can result in account blocking and loss of all earnings. 
          Please ensure your screenshots are genuine and clearly show the required action.
        </p>
      </div>
    </div>
  </div>
));

WarningMessage.displayName = "WarningMessage";

export default WarningMessage;

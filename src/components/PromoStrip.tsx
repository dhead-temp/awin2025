import React from 'react';
import { Gift, DollarSign, Shield } from 'lucide-react';

export default function PromoStrip() {
  return (
    <div className="bg-green-700 text-white py-2 px-3 shadow-lg">
      <div className="max-w-7xl mx-auto">
        {/* Desktop: Single line with separator */}
        <div className="hidden sm:flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <Gift className="h-4 w-4" />
            <span className="font-semibold text-xs">Guaranteed Free Prize</span>
          </div>
          <div className="w-px h-4 bg-white/30"></div>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span className="font-semibold text-xs">No Deposit Required</span>
          </div>       
        </div>
        
        {/* Mobile: Horizontally scrollable */}
        <div className="sm:hidden overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-center space-x-6 min-w-max px-2">
            <div className="flex items-center space-x-1 whitespace-nowrap">
              <Gift className="h-4 w-4" />
              <span className="font-semibold text-xs">Guaranteed Free Prize</span>
            </div>
            <div className="flex items-center space-x-1 whitespace-nowrap">
              <Shield className="h-4 w-4" />
              <span className="font-semibold text-xs">No Deposit Required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

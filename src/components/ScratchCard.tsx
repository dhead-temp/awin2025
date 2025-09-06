import React, { useState, useRef, useEffect } from 'react';
import { Gift, Trophy, Sparkles } from 'lucide-react';

interface ScratchCardProps {
  value: number;
  onScratch: (value: number) => void;
  isScratched: boolean;
}

const ScratchCard: React.FC<ScratchCardProps> = ({ value, onScratch, isScratched }) => {
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [mouseDown, setMouseDown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isScratched) return;
    setMouseDown(true);
    setIsScratching(true);
    handleScratch(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseDown || isScratched) return;
    handleScratch(e);
  };

  const handleMouseUp = () => {
    setMouseDown(false);
  };

  const handleScratch = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Simulate scratching by increasing percentage
    setScratchPercentage(prev => {
      const newPercentage = Math.min(prev + 8, 100);
      if (newPercentage >= 70 && prev < 70) {
        // Reveal the prize when 70% scratched
        setTimeout(() => onScratch(value), 500);
      }
      return newPercentage;
    });
  };

  // Auto-complete scratching animation
  useEffect(() => {
    if (scratchPercentage >= 70 && scratchPercentage < 100 && !isScratched) {
      const interval = setInterval(() => {
        setScratchPercentage(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [scratchPercentage, isScratched]);

  if (isScratched) {
    return (
      <div className="relative group w-full max-w-sm mx-auto">
        {/* Google Pay style revealed card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 border border-gray-100">
          {/* Celebration sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-6 text-blue-400 animate-bounce">
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
              <div className="w-0.5 h-4 bg-blue-400 absolute top-0 left-0.25 transform rotate-45"></div>
              <div className="w-0.5 h-4 bg-blue-400 absolute top-0 left-0.25 transform -rotate-45"></div>
            </div>
            <div className="absolute top-8 right-8 text-green-400 animate-bounce delay-100">
              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
              <div className="w-0.5 h-3 bg-green-400 absolute top-0 left-0.25 transform rotate-45"></div>
              <div className="w-0.5 h-3 bg-green-400 absolute top-0 left-0.25 transform -rotate-45"></div>
            </div>
            <div className="absolute bottom-6 left-8 text-yellow-400 animate-bounce delay-200">
              <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              <div className="w-0.5 h-3 bg-yellow-400 absolute top-0 left-0.25 transform rotate-45"></div>
              <div className="w-0.5 h-3 bg-yellow-400 absolute top-0 left-0.25 transform -rotate-45"></div>
            </div>
            <div className="absolute bottom-8 right-6 text-purple-400 animate-bounce delay-300">
              <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
              <div className="w-0.5 h-3 bg-purple-400 absolute top-0 left-0.25 transform rotate-45"></div>
              <div className="w-0.5 h-3 bg-purple-400 absolute top-0 left-0.25 transform -rotate-45"></div>
            </div>
          </div>
          
          <div className="p-8 text-center relative">
            {/* Trophy icon with blue circle background */}
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto flex items-center justify-center relative">
                {/* Trophy icon */}
                <div className="relative">
                  <div className="w-8 h-6 bg-yellow-400 rounded-t-lg relative">
                    {/* Trophy cup */}
                    <div className="absolute -left-1 top-1 w-2 h-3 bg-yellow-400 rounded-l-full"></div>
                    <div className="absolute -right-1 top-1 w-2 h-3 bg-yellow-400 rounded-r-full"></div>
                  </div>
                  {/* Trophy base */}
                  <div className="w-6 h-2 bg-yellow-500 mx-auto"></div>
                  <div className="w-8 h-1 bg-yellow-600 mx-auto"></div>
                </div>
              </div>
              {/* Celebration sparkles around trophy */}
              <Sparkles className="h-4 w-4 text-blue-400 absolute top-0 right-6 animate-pulse" />
              <Sparkles className="h-3 w-3 text-green-400 absolute bottom-2 left-4 animate-pulse delay-100" />
            </div>
            
            {/* Win text */}
            <h3 className="text-gray-800 text-lg font-medium mb-2">You've won</h3>
            
            {/* Amount */}
            <div className="text-4xl font-bold text-gray-900 mb-6">₹ {value}</div>
            
            {/* Success message */}
            <div className="bg-gray-50 rounded-2xl py-3 px-6 inline-block">
              <p className="text-gray-600 text-sm font-medium">Excellent!</p>
              <p className="text-gray-500 text-xs">Added to your wallet</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative cursor-pointer select-none w-full max-w-sm mx-auto"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Base card with prize (hidden underneath) */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
        <div className="p-8 text-center">
          {/* Trophy icon with blue circle background */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto flex items-center justify-center">
              {/* Trophy icon */}
              <div className="relative">
                <div className="w-8 h-6 bg-yellow-400 rounded-t-lg relative">
                  {/* Trophy cup */}
                  <div className="absolute -left-1 top-1 w-2 h-3 bg-yellow-400 rounded-l-full"></div>
                  <div className="absolute -right-1 top-1 w-2 h-3 bg-yellow-400 rounded-r-full"></div>
                </div>
                {/* Trophy base */}
                <div className="w-6 h-2 bg-yellow-500 mx-auto"></div>
                <div className="w-8 h-1 bg-yellow-600 mx-auto"></div>
              </div>
            </div>
          </div>
          
          {/* Win text */}
          <h3 className="text-gray-800 text-lg font-medium mb-2">You've won</h3>
          
          {/* Amount */}
          <div className="text-4xl font-bold text-gray-900">₹ {value}</div>
        </div>
      </div>

      {/* Scratch overlay - Google Pay blue style */}
      <div 
        className="absolute inset-0 rounded-3xl overflow-hidden"
        style={{
          background: '#1a73e8', // Google Pay blue
          clipPath: scratchPercentage > 0 
            ? `polygon(0% 0%, ${100 - scratchPercentage}% 0%, ${100 - scratchPercentage * 0.8}% 100%, 0% 100%)`
            : 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          transition: 'clip-path 0.1s ease-out'
        }}
      >
        {/* Google Pay style scratch surface */}
        <div className="h-full w-full flex items-center justify-center relative">
          {/* Trophy icon in center - darker blue */}
          <div className="w-16 h-16 bg-blue-600 bg-opacity-50 rounded-full flex items-center justify-center">
            <Trophy className="h-8 w-8 text-blue-200" />
          </div>
          
          {/* Corner indicators */}
          <div className="absolute top-4 left-4">
            <div className="w-6 h-0.5 bg-blue-300 rounded-full transform rotate-45"></div>
            <div className="w-6 h-0.5 bg-blue-300 rounded-full transform -rotate-45 -mt-0.5"></div>
          </div>
          <div className="absolute top-4 right-4">
            <div className="w-6 h-0.5 bg-blue-300 rounded-full transform -rotate-45"></div>
            <div className="w-6 h-0.5 bg-blue-300 rounded-full transform rotate-45 -mt-0.5"></div>
          </div>
          <div className="absolute bottom-4 left-4">
            <div className="w-6 h-0.5 bg-blue-300 rounded-full transform -rotate-45"></div>
            <div className="w-6 h-0.5 bg-blue-300 rounded-full transform rotate-45 -mt-0.5"></div>
          </div>
          <div className="absolute bottom-4 right-4">
            <div className="w-6 h-0.5 bg-blue-300 rounded-full transform rotate-45"></div>
            <div className="w-6 h-0.5 bg-blue-300 rounded-full transform -rotate-45 -mt-0.5"></div>
          </div>
        </div>

        {/* Scratch instruction overlay */}
        {!isScratching && scratchPercentage === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Gift className="h-6 w-6 mx-auto mb-2 opacity-80" />
              <div className="text-sm font-medium opacity-90">Scratch to reveal</div>
            </div>
          </div>
        )}
      </div>

      {/* Scratch progress indicator */}
      {isScratching && scratchPercentage < 70 && (
        <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white rounded-full px-2 py-1 text-xs font-bold">
          {Math.round(scratchPercentage)}%
        </div>
      )}

      {/* Glowing effect when nearly complete */}
      {scratchPercentage >= 50 && scratchPercentage < 100 && (
        <div className="absolute inset-0 rounded-3xl bg-blue-400 bg-opacity-20 animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
};

export default ScratchCard;
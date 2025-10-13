import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  subtitleValue?: number | string;
  description?: string;
  actionButton?: React.ReactNode;
  icon?: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  subtitleValue,
  description,
  actionButton,
  icon: Icon,
  color = 'blue',
  className = ''
}) => {
  const colorClasses = {
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      icon: 'text-blue-600'
    },
    green: {
      border: 'border-green-500',
      bg: 'bg-green-50',
      text: 'text-green-700',
      icon: 'text-green-600'
    },
    purple: {
      border: 'border-purple-500',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      icon: 'text-purple-600'
    },
    orange: {
      border: 'border-orange-500',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      icon: 'text-orange-600'
    },
    red: {
      border: 'border-red-500',
      bg: 'bg-red-50',
      text: 'text-red-700',
      icon: 'text-red-600'
    }
  };

  const currentColor = colorClasses[color];

  return (
    <div className={`bg-white rounded-xl border-2 ${currentColor.border} ${className}`}>
      {/* Header section with subtitle */}
      {subtitle && (
        <div className={`${currentColor.bg} px-4 py-2 rounded-t-xl border-b-2 ${currentColor.border}`}>
          <div className="flex justify-between items-center">
            <span className={`text-xs font-medium ${currentColor.text}`}>
              {subtitle}
            </span>
            {subtitleValue !== undefined && (
              <span className={`text-xs font-medium ${currentColor.text}`}>
                {subtitleValue}
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Main content section */}
      <div className="px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className={`h-5 w-5 ${currentColor.icon}`} />}
            <span className={`text-sm font-semibold ${currentColor.text}`}>
              {title}
            </span>
          </div>
          <span className={`text-xl font-bold ${currentColor.text} font-mono`}>
            {value}
          </span>
        </div>
        
        {/* Description section */}
        {description && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className={`text-xs ${currentColor.text} opacity-80 leading-relaxed`}>
              {description}
            </p>
          </div>
        )}
        
        {/* Action button section */}
        {actionButton && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;

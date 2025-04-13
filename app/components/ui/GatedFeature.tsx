import React from 'react';
import { LockClosedIcon } from '@heroicons/react/24/solid'; // Using Heroicons for the lock icon

type GatedFeatureProps = {
  children: React.ReactNode;
  isLocked: boolean;
  lockMessage?: string; // Optional message to display when locked
};

export function GatedFeature({ children, isLocked, lockMessage = "Feature Locked" }: GatedFeatureProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-400 dark:bg-gray-700 opacity-50 rounded-lg z-10 group-hover:opacity-60 transition-opacity"></div>
      
      {/* Lock Icon and Message */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white pointer-events-none">
        <LockClosedIcon className="h-12 w-12 text-gray-800 dark:text-gray-200 opacity-75" />
        <span className="mt-2 text-lg font-semibold text-gray-800 dark:text-gray-200 opacity-90">{lockMessage}</span>
      </div>

      {/* Content (visually disabled) */}
      <div className="opacity-50 pointer-events-none blur-sm select-none">
        {children}
      </div>
    </div>
  );
} 
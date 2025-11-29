import React from 'react';

export const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => {
  return (
    <div className="w-full bg-slate-lighter rounded-full h-4 relative overflow-hidden">
      <div 
        className="bg-navy h-4 rounded-full transition-all duration-500 ease-out relative"
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </div>
  );
};

import React from 'react';

const DefconBanner: React.FC = () => {
  return (
    <div className="bg-red-700 text-white py-3 px-6 text-center font-mono font-bold border-b-4 border-red-900 shadow-lg uppercase tracking-wider text-xs flex items-center justify-center gap-3">
      <span className="animate-pulse text-lg">⚠️</span>
      <span>
        <strong>DEFCON PIZZA LEVEL 2:</strong> High Intelligence Activity Detected. Order Volume Surging.
      </span>
      <span className="animate-pulse text-lg">⚠️</span>
    </div>
  );
};

export default DefconBanner;

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const RouteLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px] animate-in fade-in duration-200">
    <LoadingSpinner size="lg" />
  </div>
);

export default RouteLoadingFallback;

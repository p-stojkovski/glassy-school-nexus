
import React from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

interface SchedulingHeaderProps {
  onScheduleClass: () => void;
}

const SchedulingHeader: React.FC<SchedulingHeaderProps> = ({ onScheduleClass }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Scheduling & Planning</h1>
        <p className="text-white/70 mt-2">
          Plan, schedule, and manage classes efficiently
        </p>
      </div>
      <Button 
        onClick={onScheduleClass}
        className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium"
      >
        <Plus className="w-4 h-4 mr-2" />
        Schedule Class
      </Button>
    </div>
  );
};

export default SchedulingHeader;

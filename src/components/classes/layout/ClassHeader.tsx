
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../ui/button';

interface ClassHeaderProps {
  onAddClass: () => void;
}

const ClassHeader: React.FC<ClassHeaderProps> = ({ onAddClass }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Class Management</h1>
        <p className="text-white/70">Manage classes, schedules, and assignments</p>
      </div>
      <Button 
        onClick={onAddClass}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Class
      </Button>
    </div>
  );
};

export default ClassHeader;

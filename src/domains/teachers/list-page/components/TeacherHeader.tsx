import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TeacherHeaderProps {
  onAddTeacher: () => void;
}

const TeacherHeader: React.FC<TeacherHeaderProps> = ({ onAddTeacher }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Teachers</h3>
        <p className="text-md text-white/70">Manage teacher profiles and assignments</p>
      </div>
      <Button
        onClick={onAddTeacher}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Teacher
      </Button>
    </div>
  );
};

export default TeacherHeader;

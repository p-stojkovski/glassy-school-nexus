import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TeacherHeaderProps {
  onAddTeacher: () => void;
}

const TeacherHeader: React.FC<TeacherHeaderProps> = ({ onAddTeacher }) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-white">Teachers</h1>
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

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudentProfileHeaderProps {
  onBack: () => void;
}

const StudentProfileHeader: React.FC<StudentProfileHeaderProps> = ({ onBack }) => {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-white hover:bg-white/5"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Students
      </Button>
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Student Profile</h1>
        <p className="text-white/70">View comprehensive student information</p>
      </div>
    </div>
  );
};

export default StudentProfileHeader;

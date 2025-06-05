
import React from 'react';
import { Eye } from 'lucide-react';
import { Button } from '../ui/button';
import GlassCard from '../common/GlassCard';
import { Class } from '../../store/slices/classesSlice';

interface ClassCardProps {
  classItem: Class;
  onView: (classItem: Class) => void;
  onEdit: (classItem: Class) => void;
  onDelete: (classItem: Class) => void;
}

const ClassCard: React.FC<ClassCardProps> = ({
  classItem,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <GlassCard className="p-6 hover:bg-white/5 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: classItem.color }}></div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView(classItem)}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(classItem)}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(classItem)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            Delete
          </Button>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">{classItem.name}</h3>
      <p className="text-white/70 mb-4">Teacher: {classItem.teacher.name}</p>
      <p className="text-white/70 mb-4">Room: {classItem.room}</p>
      <p className="text-white/70 mb-4">Students: {classItem.students}/{classItem.maxStudents}</p>
      
      <div className="space-y-2">
        <p className="text-sm font-medium text-white">Schedule:</p>
        {classItem.schedule.map((schedule, index) => (
          <p key={index} className="text-sm text-white/70">
            {schedule.day}: {schedule.startTime} - {schedule.endTime}
          </p>
        ))}
      </div>
      
      <div className="mt-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          classItem.status === 'active' 
            ? 'bg-green-500/20 text-green-300' 
            : classItem.status === 'inactive'
            ? 'bg-red-500/20 text-red-300'
            : 'bg-yellow-500/20 text-yellow-300'
        }`}>
          {classItem.status}
        </span>
      </div>
    </GlassCard>
  );
};

export default ClassCard;

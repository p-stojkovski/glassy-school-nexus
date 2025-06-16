import GlassCard from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Class } from '@/domains/classes/classesSlice';
import React from 'react';

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
    <GlassCard className="p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">{classItem.name}</h3>
        <div className="flex space-x-2">
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
      <p className="text-white/70 mb-1">
        <span className="text-sm font-medium text-white">Teacher:</span>{' '}
        {classItem.teacher.name}
      </p>
      <p className="text-white/70 mb-1">
        <span className="text-sm font-medium text-white">Room: </span>{' '}
        {classItem.room}
      </p>
      <p className="text-white/70 mb-2">
        <span className="text-sm font-medium text-white">Students: </span>{' '}
        {classItem.students}/{classItem.maxStudents}
      </p>

      <div className="space-y-2">
        <p className="text-sm font-medium text-white">Schedule:</p>
        {classItem.schedule.map((schedule, index) => (
          <p key={index} className="text-sm text-white/70">
            {schedule.day}: {schedule.startTime} - {schedule.endTime}
          </p>
        ))}
      </div>
      <div className="mt-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            classItem.status === 'active'
              ? 'bg-green-500/20 text-green-300'
              : classItem.status === 'inactive'
                ? 'bg-red-500/20 text-red-300'
                : 'bg-yellow-500/20 text-yellow-300'
          }`}
        >
          {classItem.status}
        </span>
      </div>

      <div className="text-xs text-white/50 border-t border-white/10 pt-3 mt-4">
        Last updated: {new Date(classItem.updatedAt).toLocaleDateString()}
      </div>
    </GlassCard>
  );
};

export default ClassCard;

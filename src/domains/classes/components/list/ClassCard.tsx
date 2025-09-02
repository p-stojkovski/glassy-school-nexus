import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Class } from '@/domains/classes/classesSlice';

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
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="p-6 hover:bg-white/5 transition-all duration-300">
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
        {classItem.students}
      </p>

      <div className="space-y-2">
        <p className="text-sm font-medium text-white">Schedule:</p>
        {classItem.schedule.map((schedule, index) => (
          <p key={index} className="text-sm text-white/70">
            {schedule.day}: {schedule.startTime} - {schedule.endTime}
          </p>
        ))}
      </div>

      <div className="text-xs text-white/50 border-t border-white/10 pt-3 mt-4">
        Last updated: {new Date(classItem.updatedAt).toLocaleDateString()}
      </div>
      </GlassCard>
    </motion.div>
  );
};

export default ClassCard;

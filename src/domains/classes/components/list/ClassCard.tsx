import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Class } from '@/domains/classes/classesSlice';
import { formatSchedule } from '@/utils/scheduleFormatter';
import { LessonStatusSummary } from '@/domains/lessons/components/LessonStatusBadge';
import { useAppSelector } from '@/store/hooks';
import { selectLessonSummaryForClass } from '@/domains/lessons/lessonsSlice';

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
  const lessonSummary = useAppSelector(selectLessonSummaryForClass(classItem.id));
  
  // Calculate lesson counts for display
  const lessonCounts = lessonSummary ? {
    scheduled: lessonSummary.scheduledLessons,
    conducted: lessonSummary.completedLessons,
    cancelled: lessonSummary.cancelledLessons,
    makeUp: lessonSummary.makeupLessons,
    noShow: lessonSummary.noShowLessons,
  } : {
    scheduled: 0,
    conducted: 0,
    cancelled: 0,
    makeUp: 0,
    noShow: 0,
  };

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
        <p className="text-sm text-white/70">
          {formatSchedule(classItem.schedule)}
        </p>
      </div>

      {/* Lesson Status Summary */}
      <div className="border-t border-white/10 pt-3 mt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Lessons
          </p>
          {(lessonSummary?.totalLessons ?? 0) > 0 ? (
            <span className="text-sm font-medium text-white">
              {lessonSummary?.totalLessons} total
            </span>
          ) : null}
        </div>
        
        {lessonSummary?.totalLessons > 0 ? (
          <LessonStatusSummary 
            counts={lessonCounts}
            size="sm"
            showZeroCounts={false}
            className="justify-start"
          />
        ) : (
          <p className="text-xs text-white/50">
            No lessons yet
          </p>
        )}
      </div>

      <div className="text-xs text-white/50 border-t border-white/10 pt-3 mt-4">
        Last updated: {new Date(classItem.updatedAt).toLocaleDateString()}
      </div>
      </GlassCard>
    </motion.div>
  );
};

export default ClassCard;


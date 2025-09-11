import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  User, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  Target, 
  FileText,
  Package
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import { ClassResponse } from '@/types/api/class';
import { LessonSummaryDto } from '@/types/api/class';
import { LessonStatusSummary } from '@/domains/lessons/components/LessonStatusBadge';
import { formatSchedule } from '@/utils/scheduleFormatter';

interface ClassOverviewTabProps {
  classData: ClassResponse;
  onViewLessons?: () => void;
}

const ClassOverviewTab: React.FC<ClassOverviewTabProps> = ({
  classData,
  onViewLessons,
}) => {
  const lessonSummary = classData.lessonSummary;
  // Calculate lesson status counts for the summary component
  const lessonCounts = {
    scheduled: lessonSummary.scheduledLessons,
    conducted: lessonSummary.conductedLessons,
    cancelled: lessonSummary.cancelledLessons,
    makeUp: lessonSummary.makeupLessons,
    noShow: lessonSummary.noShowLessons,
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {classData.enrolledCount}
                </div>
                <div className="text-sm text-white/60">
                  {classData.availableSlots > 0 
                    ? `${classData.availableSlots} slots available`
                    : 'Class full'
                  }
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {lessonSummary.totalLessons}
                </div>
                <div className="text-sm text-white/60">Total Lessons</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {lessonSummary.scheduledLessons}
                </div>
                <div className="text-sm text-white/60">Upcoming</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {lessonSummary.conductedLessons}
                </div>
                <div className="text-sm text-white/60">Completed</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Class Information
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-white/60 mb-1">Subject</div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium">{classData.subjectName}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">Teacher</div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-green-400" />
                    <span className="text-white font-medium">{classData.teacherName}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-white/60 mb-1">Classroom</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span className="text-white font-medium">{classData.classroomName}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-white/60 mb-1">Capacity</div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-400" />
                    <span className="text-white font-medium">
                      {classData.enrolledCount}/{classData.classroomCapacity}
                    </span>
                  </div>
                </div>
              </div>

              {classData.description && (
                <div>
                  <div className="text-sm text-white/60 mb-1">Description</div>
                  <p className="text-white/80 text-sm">{classData.description}</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Schedule and Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Schedule & Progress
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-white/60 mb-2">Weekly Schedule</div>
                <div className="text-white font-medium">
                  {classData.schedule?.length > 0 
                    ? formatSchedule(classData.schedule.map(slot => ({
                        day: slot.dayOfWeek,
                        startTime: slot.startTime,
                        endTime: slot.endTime
                      })))
                    : 'No schedule set'
                  }
                </div>
              </div>

              {/* Next lesson info would need to be calculated separately if needed */}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white/60">Lesson Progress</div>
                  {onViewLessons && lessonSummary.totalLessons > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onViewLessons}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-xs"
                    >
                      View All
                    </Button>
                  )}
                </div>
                <LessonStatusSummary 
                  counts={lessonCounts}
                  size="sm"
                  showZeroCounts={false}
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Objectives */}
        {classData.objectives && classData.objectives.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Target className="w-5 h-5" />
                Learning Objectives
              </h3>
              <div className="space-y-2">
                {classData.objectives.map((objective, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-white/80 text-sm">{objective}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Requirements */}
        {classData.requirements && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5" />
                Requirements
              </h3>
              <p className="text-white/80 text-sm">{classData.requirements}</p>
            </GlassCard>
          </motion.div>
        )}

        {/* Materials */}
        {classData.materials && classData.materials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Package className="w-5 h-5" />
                Materials
              </h3>
              <div className="flex flex-wrap gap-2">
                {classData.materials.map((material, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-white/10 text-white border-white/20"
                  >
                    {material}
                  </Badge>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>

    </div>
  );
};

export default ClassOverviewTab;

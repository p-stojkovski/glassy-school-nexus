import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  User,
  MapPin,
  Clock,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import GlassCard from '@/components/common/GlassCard';
import { ClassResponse, ScheduleSlotDto } from '@/types/api/class';
import { formatSchedule } from '@/utils/scheduleFormatter';

interface Props {
  classes: ClassResponse[];
  onView: (c: ClassResponse) => void;
}

// Component to display lesson summary for a single class
const ClassLessonSummary: React.FC<{ lessonSummary: ClassResponse['lessonSummary'] }> = ({ lessonSummary }) => {
  if (!lessonSummary || lessonSummary.totalLessons === 0) {
    return (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-white/40" />
        <span className="text-white/40 text-sm">No lessons</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-white/60" />
      <div className="flex flex-col">
        <div className="font-medium text-white text-sm">
          {lessonSummary.totalLessons}
        </div>
        <div className="text-white/50 text-xs">
          {lessonSummary.scheduledLessons} scheduled
        </div>
      </div>
    </div>
  );
};



const ClassTable: React.FC<Props> = React.memo(({ classes, onView }) => {
  
  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <GlassCard className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/20 hover:bg-white/5">
              <TableHead className="text-white/90 font-semibold">
                Class Details
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Teacher
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Classroom
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Schedule
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Enrollment
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Lessons
              </TableHead>
              <TableHead className="text-white/90 font-semibold w-12">
                {/* Navigation indicator column */}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((classItem) => (
              <TableRow
                key={classItem.id}
                onClick={() => onView(classItem)}
                className="border-white/10 hover:bg-white/10 cursor-pointer transition-colors group"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-white">
                          {classItem.name}
                        </div>
                        {/* Disabled Badge */}
                        {!classItem.isActive && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded">
                            Disabled
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                        <BookOpen className="w-3 h-3" />
                        <span>{classItem.subjectName}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <User className="w-3 h-3 text-white/60" />
                    <span>{classItem.teacherName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <MapPin className="w-3 h-3 text-white/60" />
                    <span>{classItem.classroomName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Clock className="w-3 h-3 text-white/60" />
                    <span className="text-white/90">
                      {classItem.schedule?.length > 0 
                        ? formatSchedule(classItem.schedule.map(slot => ({
                            day: slot.dayOfWeek,
                            startTime: slot.startTime,
                            endTime: slot.endTime
                          })))
                        : 'Not scheduled'
                      }
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/60" />
                    <div className="text-sm">
                      <div className="font-medium text-white">
                        {classItem.enrolledCount}
                      </div>
                      <div className="text-white/50 text-xs">
                        enrolled
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <ClassLessonSummary lessonSummary={classItem.lessonSummary} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white/70 transition-colors" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassCard>
    </motion.div>
  );
});

ClassTable.displayName = 'ClassTable';

export default ClassTable;


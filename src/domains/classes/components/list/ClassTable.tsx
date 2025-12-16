import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
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
    return <span className="text-sm text-white/40">No lessons</span>;
  }

  return (
    <div className="text-sm">
      <span className="font-medium text-white">{lessonSummary.totalLessons}</span>
      <span className="text-white/50 text-xs ml-1">
        ({lessonSummary.scheduledLessons} scheduled)
      </span>
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
                Class
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Teacher
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                When & Where
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Enrollment
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Lessons
              </TableHead>
              <TableHead className="w-12">
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
                {/* Column 1: Class (Name + Subject + Disabled Badge) */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {/* Class name with inline disabled badge */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{classItem.name}</span>
                      {!classItem.isActive && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded">
                          Disabled
                        </span>
                      )}
                    </div>
                    {/* Subject - plain text below class name */}
                    <span className="text-sm text-white/60">{classItem.subjectName}</span>
                  </div>
                </TableCell>

                {/* Column 2: Teacher (Text only, no icon) */}
                <TableCell>
                  <span className="text-sm text-white/80">{classItem.teacherName}</span>
                </TableCell>

                {/* Column 3: When & Where (Schedule + Classroom merged) */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {/* Schedule */}
                    <span className="text-sm text-white/90">
                      {classItem.schedule?.length > 0
                        ? formatSchedule(classItem.schedule.map(slot => ({
                            day: slot.dayOfWeek,
                            startTime: slot.startTime,
                            endTime: slot.endTime
                          })))
                        : 'Not scheduled'
                      }
                    </span>
                    {/* Classroom with minimal MapPin icon */}
                    <div className="flex items-center gap-1.5 text-white/60">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs">{classItem.classroomName}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Column 4: Enrollment (Simplified) */}
                <TableCell>
                  <div className="text-sm">
                    <span className="font-medium text-white">{classItem.enrolledCount}</span>
                    <span className="text-white/50 text-xs ml-1">enrolled</span>
                  </div>
                </TableCell>

                {/* Column 5: Lessons (Simplified) */}
                <TableCell>
                  <ClassLessonSummary lessonSummary={classItem.lessonSummary} />
                </TableCell>

                {/* Column 6: Navigation */}
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

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  User,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { ClassResponse } from '@/types/api/class';

interface Props {
  classes: ClassResponse[];
  onView: (c: ClassResponse) => void;
}

const ClassGrid: React.FC<Props> = React.memo(({ classes, onView }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((classItem) => (
        <motion.div
          key={classItem.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard
            className="p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
            onClick={() => onView(classItem)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-white">
                    {classItem.name}
                  </h3>
                  {/* Disabled Badge */}
                  {!classItem.isActive && (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded">
                      Disabled
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <BookOpen className="w-4 h-4" />
                  <span>{classItem.subjectName}</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white/70 transition-colors shrink-0" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <User className="w-4 h-4 text-white/60" />
                <span className="text-white/60">Teacher:</span>
                <span>{classItem.teacherName}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-white/80">
                <MapPin className="w-4 h-4 text-white/60" />
                <span className="text-white/60">Classroom:</span>
                <span>{classItem.classroomName}</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Clock className="w-4 h-4 text-white/60" />
                  <span>Schedule:</span>
                </div>
                <div className="ml-6 space-y-1">
                  {classItem.schedule?.length > 0 ? (
                    classItem.schedule.map((slot, index) => (
                      <div key={index} className="text-sm">
                        <div className="text-white/90">{slot.dayOfWeek}</div>
                        <div className="text-white/60 text-xs">{slot.startTime} - {slot.endTime}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-white/60">Not scheduled</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-white/80">
                <Users className="w-4 h-4 text-white/60" />
                <span className="text-white/60">Enrollment:</span>
                <span className="font-medium text-white">{classItem.enrolledCount}</span>
                <span className="text-white/50 text-xs">students</span>
              </div>
            </div>

            <div className="text-xs text-white/50 border-t border-white/10 pt-3 mt-4">
              Created: {new Date(classItem.createdAt).toLocaleDateString()}
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
});

ClassGrid.displayName = 'ClassGrid';

export default ClassGrid;

import React from 'react';
import { motion } from 'framer-motion';
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  BookOpen,
  User,
  MapPin,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import GlassCard from '@/components/common/GlassCard';
import { ClassResponse } from '@/types/api/class';

interface Props {
  classes: ClassResponse[];
  onEdit: (c: ClassResponse) => void;
  onDelete: (c: ClassResponse) => void;
  onView: (c: ClassResponse) => void;
}

const ClassGrid: React.FC<Props> = React.memo(({ classes, onEdit, onDelete, onView }) => {
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
          <GlassCard className="p-6 hover:bg-white/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {classItem.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <BookOpen className="w-4 h-4" />
                  <span>{classItem.subjectName}</span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-gray-900/95 border-white/20 text-white"
                >
                  <DropdownMenuItem
                    onClick={() => onView(classItem)}
                    className="text-blue-400 focus:text-blue-300 focus:bg-blue-500/10 cursor-pointer"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onEdit(classItem)}
                    className="text-white/70 focus:text-white focus:bg-white/10 cursor-pointer"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Class
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem
                    onClick={() => onDelete(classItem)}
                    className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Class
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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


import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, Users, Calendar } from 'lucide-react';
import { Class } from '@/domains/classes/classesSlice';
import { formatSchedule } from '@/utils/scheduleFormatter';

interface ClassDetailsProps {
  classItem: Class | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (classItem: Class) => void;
  onDelete: (classItem: Class) => void;
}

const ClassDetails: React.FC<ClassDetailsProps> = ({
  classItem,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}) => {
  if (!classItem) return null;

  const isUpcoming = () => {
    // For now, all classes are considered upcoming
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {classItem.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Class Info */}
          <div className="flex items-center gap-4">
            <Badge
              className={`${
                isUpcoming()
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-gray-500/20 text-gray-300'
              }`}
            >
              {isUpcoming() ? 'Upcoming' : 'Past'}
            </Badge>
          </div>

          {/* Teacher Information */}
          <div className="bg-white/5 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Teacher
            </h3>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-white font-medium">
                  {classItem.teacher.name}
                </p>
                <p className="text-white/70 text-sm">Subject Specialist</p>
              </div>
            </div>
          </div>

          {/* Classroom Information */}
          <div className="bg-white/5 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Classroom
            </h3>
            <p className="text-white">{classItem.room}</p>
          </div>

          {/* Schedule Information */}
          <div className="bg-white/5 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Schedule
            </h3>
            <div className="text-white">
              {formatSchedule(classItem.schedule)}
            </div>
          </div>

          {/* Students Information */}
          <div className="bg-white/5 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Students ({classItem.studentIds.length})
            </h3>
            <p className="text-white/70">
              {classItem.studentIds.length} students enrolled in this class
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/10"
            >
              Close
            </Button>
            <Button
              onClick={() => onEdit(classItem)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Edit Class
            </Button>
            <Button
              onClick={() => onDelete(classItem)}
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Delete Class
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClassDetails;

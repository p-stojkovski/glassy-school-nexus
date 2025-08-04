import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users } from 'lucide-react';
import { Classroom } from '@/domains/classrooms/classroomsSlice';
import GlassCard from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';

interface ClassroomCardProps {
  classroom: Classroom;
  onEdit: (classroom: Classroom) => void;
  onDelete: (classroom: Classroom) => void;
  onView: (classroom: Classroom) => void;
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({
  classroom,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {' '}
      <GlassCard className="p-6 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div onClick={() => onView(classroom)} className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2">
              {classroom.name}
            </h3>

            <div className="flex items-center text-white/70 mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{classroom.location || 'No location specified'}</span>
            </div>

            <div className="flex items-center text-white/70 mb-3">
              <Users className="w-4 h-4 mr-2" />
              <span>{classroom.capacity} seats</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(classroom);
              }}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(classroom);
              }}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="text-xs text-white/50 border-t border-white/10 pt-3">
          Last updated: {new Date(classroom.lastUpdated).toLocaleDateString()}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default ClassroomCard;

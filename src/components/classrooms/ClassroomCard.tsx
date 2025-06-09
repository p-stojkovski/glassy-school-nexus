
import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, MapPin, Users } from 'lucide-react';
import { Button } from '../ui/button';
import GlassCard from '../common/GlassCard';
import { Classroom } from '../../store/slices/classroomsSlice';

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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'maintenance':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >      <GlassCard className="p-6 transition-all duration-300">
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
            
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(classroom.status)}`}>
              {classroom.status.charAt(0).toUpperCase() + classroom.status.slice(1)}
            </div>
          </div>
          
          <div className="flex gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(classroom);
              }}
              className="text-white/70"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(classroom);
              }}
              className="text-red-400"
            >
              <Trash2 className="w-4 h-4" />
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

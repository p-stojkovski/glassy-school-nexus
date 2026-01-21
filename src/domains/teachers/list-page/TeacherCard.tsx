import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, BookOpen } from 'lucide-react';
import { Teacher } from '../teachersSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/common/GlassCard';

interface TeacherCardProps {
  teacher: Teacher;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const TeacherCard: React.FC<TeacherCardProps> = React.memo(({ teacher, onEdit, onDelete, isDeleting = false }) => {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <GlassCard className="p-6 hover:bg-white/5 transition-all duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {teacher.name}
                </h3>
              </div>
            </div>{' '}
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={onEdit}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                Edit
              </Button>{' '}
              <Button
                size="sm"
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={onDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>

          {/* Teacher Details */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center space-x-2 text-sm text-white/70">
              <Mail className="w-4 h-4" />
              <span className="truncate">{teacher.email}</span>
            </div>

            {teacher.phone && (
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <Phone className="w-4 h-4" />
                <span>{teacher.phone}</span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-sm text-white/70">
              <BookOpen className="w-4 h-4" />
              <span className="truncate">{teacher.subjectName}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-white/70">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDate(teacher.joinDate)}</span>
            </div>
          </div>

          {/* Footer with Class Count */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Active Classes</span>
              <Badge variant="outline" className="text-white/70 border-white/20">
                {teacher.classCount}
              </Badge>
            </div>
          </div>
        </div>

      </GlassCard>
    </motion.div>
  );
});

TeacherCard.displayName = 'TeacherCard';

export default TeacherCard;


import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, Phone, Mail, User } from 'lucide-react';
import { Button } from '../../ui/button';
import GlassCard from '../../common/GlassCard';
import { Student } from '../../../store/slices/studentsSlice';

interface StudentCardProps {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onEdit, onDelete, onView }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'inactive':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard className="p-6 h-full">
        <div className="flex flex-col h-full">
          {/* Header with Avatar and Basic Info */}
          <div className="flex items-start gap-4 mb-4">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-16 h-16 rounded-full border-2 border-white/20"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">
                {student.name}
              </h3>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2 mb-4 flex-1">
            {student.email && (
              <div className="flex items-center gap-2 text-white/70">
                <Mail className="w-4 h-4" />
                <span className="text-sm truncate">{student.email}</span>
              </div>
            )}
            {student.phone && (
              <div className="flex items-center gap-2 text-white/70">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{student.phone}</span>
              </div>
            )}
            {student.parentContact && (
              <div className="flex items-center gap-2 text-white/70">
                <User className="w-4 h-4" />
                <span className="text-sm truncate">{student.parentContact}</span>
              </div>
            )}
          </div>

          {/* Join Date */}
          <div className="text-xs text-white/50 mb-4">
            Joined: {new Date(student.joinDate).toLocaleDateString()}
          </div>          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onView}
              className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default StudentCard;

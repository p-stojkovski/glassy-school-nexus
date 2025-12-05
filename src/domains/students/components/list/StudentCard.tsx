import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, Phone, Mail, User, Percent, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import { Student } from '@/domains/students/studentsSlice';
import { getStudentStatusColor } from '@/utils/statusColors';
import { formatDate } from '@/utils/dateFormatters';

interface StudentCardProps {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({
  student,
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
      whileHover={{ y: -2 }} 
      transition={{ duration: 0.2 }}
    >
      <GlassCard 
        className="p-6 h-full hover:bg-white/10 transition-all duration-300 cursor-pointer group"
        onClick={onView}
      >
        <div className="flex flex-col h-full">
          {/* Header with Basic Info */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-white truncate">
                  {student.fullName}
                </h3>
                <div
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStudentStatusColor(student.isActive ? 'active' : 'inactive')}`}
                >
                  {student.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white/70 transition-colors shrink-0" />
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
                <span className="text-sm truncate">
                  {student.parentContact}
                </span>
              </div>
            )}
            {student.hasDiscount && student.discountTypeName && (
              <div className="flex items-center gap-2 text-yellow-400">
                <Percent className="w-4 h-4" />
                <span className="text-sm">
                  {student.discountTypeName}{student.discountAmount > 0 ? ` (${student.discountAmount} MKD)` : ''}
                </span>
              </div>
            )}
          </div>
          {/* Enrollment Date */}
          <div className="text-xs text-white/50 mb-4">
            Enrolled: {formatDate(student.enrollmentDate)}
          </div>
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
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


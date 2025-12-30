import React from 'react';
import GlassCard from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Student } from '@/domains/students/studentsSlice';
import { Mail, Phone, User } from 'lucide-react';
import { StudentDetailSection } from '../details/StudentDetailsTab';

interface ProfileContactsCardProps {
  student: Student;
  canEdit: boolean;
  onEditSection?: (section: StudentDetailSection) => void;
}

const ProfileContactsCard: React.FC<ProfileContactsCardProps> = ({
  student,
  canEdit,
  onEditSection
}) => {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Profile & Contacts</h3>
        {canEdit && onEditSection && (
          <Button
            onClick={() => onEditSection('student-info')}
            size="sm"
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10 h-7 px-2 text-xs"
          >
            Edit
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Student column */}
        <div className="space-y-2">
          <p className="text-xs text-white/40 uppercase font-medium">Student</p>
          <div className="flex items-center gap-2 text-white">
            <User className="w-4 h-4 text-white/40" />
            <span className="font-medium">{student.fullName}</span>
          </div>
          {student.email && (
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Mail className="w-3 h-3 text-white/40" />
              <span className="truncate">{student.email}</span>
            </div>
          )}
          {student.phone && (
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Phone className="w-3 h-3 text-white/40" />
              <span>{student.phone}</span>
            </div>
          )}
        </div>

        {/* Guardian column */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/40 uppercase font-medium">Guardian</p>
            {canEdit && onEditSection && (
              <Button
                onClick={() => onEditSection('guardian-info')}
                size="sm"
                variant="ghost"
                className="text-white/60 hover:text-white hover:bg-white/10 h-6 px-2 text-xs"
              >
                Edit
              </Button>
            )}
          </div>
          {student.parentContact ? (
            <>
              <div className="text-white text-sm">{student.parentContact}</div>
              {student.parentEmail && (
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Mail className="w-3 h-3 text-white/40" />
                  <span className="truncate">{student.parentEmail}</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-white/50">No guardian info on file</p>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default ProfileContactsCard;

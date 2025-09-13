import React from 'react';
import { Mail, Phone, User, Calendar, Users, AlertCircle, MapPin, Cake, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/common/GlassCard';
import { Student } from '@/domains/students/studentsSlice';
import { Class } from '@/domains/classes/classesSlice';

interface StudentBasicInfoProps {
  student: Student;
  studentClass?: Class;
  outstandingBalance: number;
  getStatusColor: (status: string) => string;
}

const StudentBasicInfo: React.FC<StudentBasicInfoProps> = ({
  student,
  studentClass,
  outstandingBalance,
  getStatusColor,
}) => {
  const statusText = student.isActive ? 'Active' : 'Inactive';
  const statusKey = student.isActive ? 'active' : 'inactive';

  // Build discount label from API fields
  const discountLabel = student.hasDiscount
    ? `${student.discountTypeName ?? 'Discount'}${
        student.discountAmount && student.discountAmount > 0
          ? ` (${student.discountAmount} MKD)`
          : ''
      }`
    : null;

  return (
    <GlassCard className="p-6">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white">{student.fullName}</h2>
            <Badge className={`${getStatusColor(statusKey)} border`}>
              {statusText}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-white/70">
              <Mail className="w-4 h-4" />
              <span>{student.email}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Phone className="w-4 h-4" />
              <span>{student.phone || '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <User className="w-4 h-4" />
              <span>{student.parentContact || '-'}</span>
            </div>
            {student.parentEmail && (
              <div className="flex items-center gap-2 text-white/70">
                <Mail className="w-4 h-4" />
                <span>Parent: {student.parentEmail}</span>
              </div>
            )}
            {student.dateOfBirth && (
              <div className="flex items-center gap-2 text-white/70">
                <Cake className="w-4 h-4" />
                <span>Born: {new Date(student.dateOfBirth).toLocaleDateString()}</span>
              </div>
            )}
            {student.placeOfBirth && (
              <div className="flex items-center gap-2 text-white/70">
                <MapPin className="w-4 h-4" />
                <span>Place of Birth: {student.placeOfBirth}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-white/70">
              <Calendar className="w-4 h-4" />
              <span>
                Joined: {new Date(student.enrollmentDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Users className="w-4 h-4" />
              <span>
                Class: {studentClass ? studentClass.name : 'Unassigned'}
              </span>
            </div>
            {discountLabel && (
              <div className="flex items-center gap-2 text-yellow-400">
                <Percent className="w-4 h-4" />
                <span>Discount: {discountLabel}</span>
              </div>
            )}
            {outstandingBalance > 0 && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>Balance Due: ${outstandingBalance.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default StudentBasicInfo;


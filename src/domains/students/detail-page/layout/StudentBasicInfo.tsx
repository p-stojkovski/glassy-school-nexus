import React from 'react';
import { Mail, Phone, User, Calendar, Users, AlertCircle, MapPin, Cake, Percent, MoreVertical, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/common/GlassCard';
import { Student } from '@/domains/students/studentsSlice';
import { Class } from '@/domains/classes/classesSlice';

interface StudentBasicInfoProps {
  student: Student;
  studentClass?: Class;
  outstandingBalance: number;
  getStatusColor: (status: string) => string;
  onEdit: () => void;
}

const StudentBasicInfo: React.FC<StudentBasicInfoProps> = ({
  student,
  studentClass,
  outstandingBalance,
  getStatusColor,
  onEdit,
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
      <div className="flex items-start justify-between gap-6">
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

        {/* Kebab Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-white/20">
            <DropdownMenuItem
              onClick={onEdit}
              className="text-white hover:bg-white/10 cursor-pointer"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Student
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </GlassCard>
  );
};

export default StudentBasicInfo;

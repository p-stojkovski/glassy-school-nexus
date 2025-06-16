import React from 'react';
import { Mail, Phone, User, Calendar, Users, AlertCircle } from 'lucide-react';
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
  return (
    <GlassCard className="p-6">
      <div className="flex items-start gap-6">
        <img
          src={student.avatar}
          alt={student.name}
          className="w-24 h-24 rounded-full border-2 border-white/20"
        />
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white">{student.name}</h2>
            <Badge className={`${getStatusColor(student.status)} border`}>
              {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-white/70">
              <Mail className="w-4 h-4" />
              <span>{student.email}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Phone className="w-4 h-4" />
              <span>{student.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <User className="w-4 h-4" />
              <span>{student.parentContact}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Calendar className="w-4 h-4" />
              <span>
                Joined: {new Date(student.joinDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Users className="w-4 h-4" />
              <span>
                Class: {studentClass ? studentClass.name : 'Unassigned'}
              </span>
            </div>
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

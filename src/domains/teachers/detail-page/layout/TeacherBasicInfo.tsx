import React from 'react';
import { Mail, Phone, BookOpen, Calendar, Users, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/common/GlassCard';
import { Teacher } from '@/domains/teachers/teachersSlice';

interface TeacherBasicInfoProps {
  teacher: Teacher;
}

const TeacherBasicInfo: React.FC<TeacherBasicInfoProps> = ({ teacher }) => {
  return (
    <GlassCard className="p-6">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-white">{teacher.name}</h2>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 border">
              {teacher.subjectName}
            </Badge>
            {teacher.classCount > 0 && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 border">
                {teacher.classCount} {teacher.classCount === 1 ? 'Class' : 'Classes'}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-white/70">
              <Mail className="w-4 h-4" />
              <span>{teacher.email}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Phone className="w-4 h-4" />
              <span>{teacher.phone || '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <BookOpen className="w-4 h-4" />
              <span>Subject: {teacher.subjectName}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Calendar className="w-4 h-4" />
              <span>
                Joined: {new Date(teacher.joinDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Users className="w-4 h-4" />
              <span>
                Classes: {teacher.classCount}
              </span>
            </div>
            {teacher.notes && (
              <div className="flex items-start gap-2 text-white/70 col-span-full">
                <FileText className="w-4 h-4 mt-0.5" />
                <span>{teacher.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default TeacherBasicInfo;

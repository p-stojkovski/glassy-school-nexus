import { Mail, Phone, Briefcase } from 'lucide-react';
import { Teacher } from '@/domains/teachers/teachersSlice';

interface TeacherMetadataStripProps {
  teacher: Teacher;
  studentsCount?: number;
  studentsLoading?: boolean;
}

// Format join date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export function TeacherMetadataStrip({
  teacher,
  studentsCount,
  studentsLoading = false,
}: TeacherMetadataStripProps) {
  return (
    <>
      {/* Left: Status indicator (if inactive) */}
      {!teacher.isActive && (
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded">
            Inactive
          </span>
          <span className="text-white/20">|</span>
        </div>
      )}

      {/* Primary metadata */}
      <div className="flex flex-wrap items-center gap-3 flex-1 text-sm text-white/70">
        {/* Employment Type */}
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-white/50" />
          <span>{teacher.employmentType === 'full_time' ? 'Full Time' : 'Contract'}</span>
        </div>

        <span className="text-white/20">|</span>

        {/* Email */}
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-white/50" />
          <span className="truncate max-w-[200px]">{teacher.email}</span>
        </div>

        <span className="text-white/20">|</span>

        {/* Phone */}
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-white/50" />
          <span>{teacher.phone || 'No phone'}</span>
        </div>

        <span className="text-white/20">|</span>

        {/* Subject */}
        <div className="flex items-center gap-1.5">
          <span className="text-white/40">Subject:</span>
          <span>{teacher.subjectName}</span>
        </div>

        <span className="text-white/20">|</span>

        {/* Join Date */}
        <div className="flex items-center gap-1.5">
          <span className="text-white/40">Joined:</span>
          <span>{formatDate(teacher.joinDate)}</span>
        </div>

        <span className="text-white/20">|</span>

        {/* Classes */}
        <div className="flex items-center gap-1.5">
          <span className="text-white/40">Classes:</span>
          <span>{teacher.classCount}</span>
        </div>

        <span className="text-white/20">|</span>

        {/* Students */}
        <div className="flex items-center gap-1.5">
          <span className="text-white/40">Students:</span>
          <span>{studentsLoading ? '--' : (studentsCount ?? '--')}</span>
        </div>
      </div>
    </>
  );
}

export default TeacherMetadataStrip;

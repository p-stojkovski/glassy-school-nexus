import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, BookOpen, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TeacherStudentDto } from '@/types/api/teacher';

interface TeacherStudentsTableProps {
  students: TeacherStudentDto[];
}

/**
 * Format date to a readable string
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Get enrollment status badge styling
 */
function getEnrollmentBadgeStyles(status: string): string {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'active':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'completed':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'dropped':
    case 'withdrawn':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'suspended':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

/**
 * Table component displaying students taught by a teacher
 */
const TeacherStudentsTable: React.FC<TeacherStudentsTableProps> = ({ students }) => {
  const navigate = useNavigate();

  const handleNavigateToStudent = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };

  const handleNavigateToClass = (classId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/classes/${classId}`);
  };

  if (students.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-white/70">Student</TableHead>
            <TableHead className="text-white/70">Email</TableHead>
            <TableHead className="text-white/70">Class</TableHead>
            <TableHead className="text-white/70">Enrollment Status</TableHead>
            <TableHead className="text-white/70">Enrolled Date</TableHead>
            <TableHead className="text-white/70">Student Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow
              key={`${student.studentId}-${student.classId}-${index}`}
              className="border-white/10 hover:bg-white/5 cursor-pointer"
              onClick={() => handleNavigateToStudent(student.studentId)}
            >
              {/* Student Name */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-white/60" />
                  </div>
                  <span className="text-white font-medium hover:text-blue-400 transition-colors">
                    {student.studentName}
                  </span>
                </div>
              </TableCell>

              {/* Email */}
              <TableCell>
                {student.email ? (
                  <div className="flex items-center gap-1 text-white/70">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="text-sm">{student.email}</span>
                  </div>
                ) : (
                  <span className="text-white/40 text-sm">—</span>
                )}
              </TableCell>

              {/* Class */}
              <TableCell>
                <button
                  onClick={(e) => handleNavigateToClass(student.classId, e)}
                  className="flex items-center gap-1 text-white/70 hover:text-blue-400 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="text-sm">{student.className}</span>
                </button>
              </TableCell>

              {/* Enrollment Status */}
              <TableCell>
                <Badge
                  variant="outline"
                  className={getEnrollmentBadgeStyles(student.enrollmentStatus)}
                >
                  {student.enrollmentStatus}
                </Badge>
              </TableCell>

              {/* Enrolled Date */}
              <TableCell>
                <div className="flex items-center gap-1 text-white/70 text-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(student.enrollmentDate)}</span>
                </div>
              </TableCell>

              {/* Student Active Status */}
              <TableCell>
                {student.isStudentActive ? (
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-400">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">Inactive</span>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeacherStudentsTable;

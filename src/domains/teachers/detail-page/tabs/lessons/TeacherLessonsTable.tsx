import React from 'react';
import { format, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import LessonStatusBadge from '@/domains/lessons/components/LessonStatusBadge';
import type { TeacherLessonResponse } from '@/types/api/teacherLesson';

interface TeacherLessonsTableProps {
  lessons: TeacherLessonResponse[];
}

export const TeacherLessonsTable: React.FC<TeacherLessonsTableProps> = ({ lessons }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      // Time comes as HH:mm:ss format from backend
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return null;
    try {
      return format(parseISO(dateTimeString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateTimeString;
    }
  };

  const getDetailsContent = (lesson: TeacherLessonResponse) => {
    switch (lesson.statusName) {
      case 'Conducted':
        return lesson.conductedAt ? (
          <span className="text-sm text-white/60">
            Conducted at {formatDateTime(lesson.conductedAt)}
          </span>
        ) : (
          <span className="text-sm text-white/60">Completed</span>
        );

      case 'Cancelled':
        return lesson.cancellationReason ? (
          <span className="text-sm text-white/60">{lesson.cancellationReason}</span>
        ) : (
          <span className="text-sm text-white/60">Cancelled</span>
        );

      case 'Make Up':
        return lesson.originalLessonDate ? (
          <span className="text-sm text-white/60">
            Makeup for {formatDate(lesson.originalLessonDate)}
          </span>
        ) : (
          <span className="text-sm text-white/60">Makeup lesson</span>
        );

      case 'No Show':
        return <span className="text-sm text-white/60">Student did not attend</span>;

      case 'Scheduled':
        return <span className="text-sm text-white/60">Upcoming</span>;

      default:
        return lesson.notes ? (
          <span className="text-sm text-white/60">{lesson.notes}</span>
        ) : null;
    }
  };

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">No lessons found matching the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-white/60">Date</TableHead>
            <TableHead className="text-white/60">Time</TableHead>
            <TableHead className="text-white/60">Class</TableHead>
            <TableHead className="text-white/60">Status</TableHead>
            <TableHead className="text-white/60">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons.map((lesson) => (
            <TableRow
              key={lesson.id}
              className="border-white/10 hover:bg-white/5 transition-all duration-150 bg-white/[0.02]"
            >
              <TableCell className="font-medium text-white">
                {formatDate(lesson.scheduledDate)}
              </TableCell>
              <TableCell className="text-white/80">
                {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
              </TableCell>
              <TableCell className="text-white/80">{lesson.className}</TableCell>
              <TableCell>
                <LessonStatusBadge status={lesson.statusName} size="sm" />
              </TableCell>
              <TableCell>{getDetailsContent(lesson)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

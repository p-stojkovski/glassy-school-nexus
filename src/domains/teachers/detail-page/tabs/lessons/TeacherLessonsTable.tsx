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
import { LessonStatusBadge } from './LessonStatusBadge';
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
          <span className="text-sm text-muted-foreground">
            Conducted at {formatDateTime(lesson.conductedAt)}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Completed</span>
        );

      case 'Cancelled':
        return lesson.cancellationReason ? (
          <span className="text-sm text-muted-foreground">{lesson.cancellationReason}</span>
        ) : (
          <span className="text-sm text-muted-foreground">Cancelled</span>
        );

      case 'Make Up':
        return lesson.originalLessonDate ? (
          <span className="text-sm text-muted-foreground">
            Makeup for {formatDate(lesson.originalLessonDate)}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Makeup lesson</span>
        );

      case 'No Show':
        return <span className="text-sm text-muted-foreground">Student did not attend</span>;

      case 'Scheduled':
        return <span className="text-sm text-muted-foreground">Upcoming</span>;

      default:
        return lesson.notes ? (
          <span className="text-sm text-muted-foreground">{lesson.notes}</span>
        ) : null;
    }
  };

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No lessons found matching the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons.map((lesson) => (
            <TableRow key={lesson.id}>
              <TableCell className="font-medium">{formatDate(lesson.scheduledDate)}</TableCell>
              <TableCell>
                {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
              </TableCell>
              <TableCell>{lesson.className}</TableCell>
              <TableCell>
                <LessonStatusBadge status={lesson.statusName} />
              </TableCell>
              <TableCell>{getDetailsContent(lesson)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

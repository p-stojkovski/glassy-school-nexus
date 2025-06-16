import React from 'react';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import GlassCard from '@/components/common/GlassCard';
import { AttendanceStatus } from '@/types/enums';

interface AttendanceRecord {
  id: string;
  sessionDate: string;
  className: string;
  studentRecords: Array<{
    studentId: string;
    status: AttendanceStatus;
    notes?: string;
  }>;
}

interface StudentAttendanceTabProps {
  attendanceRecords: AttendanceRecord[];
  studentId: string;
  getAttendanceStatusColor: (status: string) => string;
}

const StudentAttendanceTab: React.FC<StudentAttendanceTabProps> = ({
  attendanceRecords,
  studentId,
  getAttendanceStatusColor,
}) => {
  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Attendance Records
      </h3>
      {attendanceRecords.length === 0 ? (
        <div className="text-center py-8 text-white/60">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-white/40" />
          <p>No attendance records found</p>
          <p className="text-sm">
            Attendance records will appear here once classes begin
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="text-white">
            <TableHeader>
              <TableRow className="border-white/20 hover:bg-white/5">
                <TableHead className="text-white/90">Date</TableHead>
                <TableHead className="text-white/90">Class</TableHead>
                <TableHead className="text-white/90">Status</TableHead>
                <TableHead className="text-white/90">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.map((record) => {
                const studentRecord = record.studentRecords.find(
                  (sr) => sr.studentId === studentId
                );
                if (!studentRecord) return null;

                return (
                  <TableRow
                    key={record.id}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <TableCell>
                      {new Date(record.sessionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{record.className}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${getAttendanceStatusColor(studentRecord.status)} border`}
                      >
                        {studentRecord.status.charAt(0).toUpperCase() +
                          studentRecord.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{studentRecord.notes || '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </GlassCard>
  );
};

export default StudentAttendanceTab;

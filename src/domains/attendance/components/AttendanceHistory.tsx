import React, { useState, useEffect } from 'react';
import { RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  AttendanceRecord,
  selectAllAttendanceRecords,
} from '@/domains/attendance/attendanceSlice';
import GlassCard from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { Search } from 'lucide-react';
import { getAttendanceStatusColor } from '@/utils/statusColors';
import { formatHomeworkStatus } from '@/utils/homeworkStatusUtils';

interface AttendanceHistoryProps {
  classId: string;
  date: string;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  classId,
  date,
}) => {
  const dispatch = useAppDispatch();
  const allRecords = useAppSelector(selectAllAttendanceRecords);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const { classes } = useAppSelector((state: RootState) => state.classes);
  // Filter records based on classId and/or date
  useEffect(() => {
    let filtered = [...allRecords];

    if (classId && classId !== 'all-classes') {
      filtered = filtered.filter((record) => record.classId === classId);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.studentRecords.some((student) =>
            student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Sort by date descending
    filtered.sort(
      (a, b) =>
        new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
    );

    setRecords(filtered);
  }, [allRecords, classId, searchTerm]);

  const handleRecordSelect = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setViewMode('details');
  };
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedRecord(null);
  };

  if (records.length === 0) {
    return (
      <GlassCard className="p-6 text-white text-center py-12">
        <h3 className="text-xl">No attendance records found</h3>
        {classId ? (
          <p className="text-white/70 mt-2">
            Try selecting a different class or date
          </p>
        ) : (
          <p className="text-white/70 mt-2">
            Start marking attendance to create records
          </p>
        )}
      </GlassCard>
    );
  }

  if (viewMode === 'details' && selectedRecord) {
    const selectedClass = classes.find((c) => c.id === selectedRecord.classId);
    return (
      <GlassCard className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-medium text-white">
                {selectedRecord.className} - Attendance Details
              </h3>
              <p className="text-white/70">
                {format(
                  parseISO(selectedRecord.sessionDate),
                  'EEEE, MMMM d, yyyy'
                )}
              </p>
            </div>{' '}
            <Button
              variant="ghost"
              onClick={handleBackToList}
              className="text-white hover:bg-white/5"
            >
              Back to List
            </Button>
          </div>

          <Table className="text-white">
            <TableHeader>
              <TableRow className="hover:bg-white/5 border-white/20">
                <TableHead className="text-white/70">Student</TableHead>
                <TableHead className="text-white/70 w-[150px]">
                  Status
                </TableHead>
                <TableHead className="text-white/70 w-[120px]">
                  Homework
                </TableHead>
                <TableHead className="text-white/70">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedRecord.studentRecords.map((student) => (
                <TableRow
                  key={student.studentId}
                  className="hover:bg-white/5 border-white/10"
                >
                  <TableCell>{student.studentName}</TableCell>{' '}
                  <TableCell>
                    <span
                      className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${getAttendanceStatusColor(student.status)}`}
                    >
                      {student.status.charAt(0).toUpperCase() +
                        student.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === 'absent'
                          ? 'bg-gray-500/20 text-gray-400'
                          : student.homeworkCompleted
                          ? 'bg-green-500/20 text-green-300'
                          : student.homeworkCompleted === false
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {formatHomeworkStatus(student.homeworkCompleted, student.status)}
                    </span>
                  </TableCell>
                  <TableCell>{student.notes || (student.homeworkNotes ? `HW: ${student.homeworkNotes}` : '-')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Homework Completion Summary */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">Session Summary</h4>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-white/80">
                  Attendance: {selectedRecord.studentRecords.filter(s => s.status === 'present').length}/{selectedRecord.studentRecords.length} present
                </div>
                <div className="text-white/80">
                  Homework: {(() => {
                    const presentStudents = selectedRecord.studentRecords.filter(s => s.status !== 'absent');
                    const completedHomework = presentStudents.filter(s => s.homeworkCompleted === true);
                    return `${completedHomework.length}/${presentStudents.length} completed`;
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-white/70 text-sm">
            <div>
              Created:{' '}
              {format(parseISO(selectedRecord.createdAt), 'MM/dd/yyyy HH:mm')}
            </div>
            <div>
              Last Updated:{' '}
              {format(parseISO(selectedRecord.updatedAt), 'MM/dd/yyyy HH:mm')}
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">Attendance History</h3>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />{' '}
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60"
            />
          </div>
        </div>

        <Table className="text-white">
          <TableHeader>
            <TableRow className="hover:bg-white/5 border-white/20">
              <TableHead className="text-white/70">Class</TableHead>
              <TableHead className="text-white/70">Date</TableHead>
              <TableHead className="text-white/70">Teacher</TableHead>
              <TableHead className="text-white/70 text-right">
                Attendance
              </TableHead>
              <TableHead className="text-white/70 text-right">
                Homework
              </TableHead>
              <TableHead className="text-white/70 text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const presentCount = record.studentRecords.filter(
                (s) => s.status === 'present'
              ).length;
              const absentCount = record.studentRecords.filter(
                (s) => s.status === 'absent'
              ).length;
              const lateCount = record.studentRecords.filter(
                (s) => s.status === 'late'
              ).length;
              const totalCount = record.studentRecords.length;
              
              // Calculate homework completion stats
              const presentStudents = record.studentRecords.filter(s => s.status !== 'absent');
              const homeworkCompleted = presentStudents.filter(s => s.homeworkCompleted === true).length;
              const homeworkNotCompleted = presentStudents.filter(s => s.homeworkCompleted === false).length;

              return (
                <TableRow
                  key={record.id}
                  className="hover:bg-white/5 border-white/10 cursor-pointer"
                  onClick={() => handleRecordSelect(record)}
                >
                  <TableCell>{record.className}</TableCell>
                  <TableCell>
                    {format(parseISO(record.sessionDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{record.teacherName}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded text-xs">
                        {presentCount} present
                      </span>
                      <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-xs">
                        {absentCount} absent
                      </span>
                      <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded text-xs">
                        {lateCount} late
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded text-xs">
                        {homeworkCompleted} completed
                      </span>
                      {homeworkNotCompleted > 0 && (
                        <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-xs">
                          {homeworkNotCompleted} not done
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {' '}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/70 hover:text-white hover:bg-white/5"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </GlassCard>
  );
};

export default AttendanceHistory;


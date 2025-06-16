import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, User, Filter, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Student } from '@/domains/students/studentsSlice';
import { Class } from '@/domains/classes/classesSlice';
import { PaymentObligation, Payment } from '@/domains/finance/financeSlice';
import { cn } from '@/lib/utils';

interface SingleStudentSelectionPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentSelect: (student: Student) => void;
  filterOngoingObligationsOnly?: boolean;
  students: Student[];
  classes: Class[];
  obligations: PaymentObligation[];
  payments: Payment[];
}

const SingleStudentSelectionPanel: React.FC<
  SingleStudentSelectionPanelProps
> = ({
  open,
  onOpenChange,
  onStudentSelect,
  filterOngoingObligationsOnly = false,
  students,
  classes,
  obligations,
  payments,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const UNASSIGNED_FILTER = 'unassigned';
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );

  // Provided data
  // Reset selection when panel opens
  useEffect(() => {
    if (open) {
      setSelectedStudentId(null);
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [open, onOpenChange]);

  // Get available classes for filter
  const availableClasses = useMemo(() => {
    const uniqueClassIds = students
      .map((student) => student.classId)
      .filter(Boolean)
      .filter((classId, index, array) => array.indexOf(classId) === index);

    const validClasses = uniqueClassIds
      .filter((classId) => classes.some((cls) => cls.id === classId))
      .map((classId) => {
        const classData = classes.find((cls) => cls.id === classId);
        return {
          id: classId,
          name: classData ? classData.name : classId,
        };
      });

    return validClasses;
  }, [students, classes]);

  // Helper function to check if student has ongoing obligations
  const hasOngoingObligations = (studentId: string): boolean => {
    const studentObligations = obligations.filter(
      (obl) => obl.studentId === studentId
    );
    return studentObligations.some((obligation) => {
      if (obligation.status === 'paid') return false;

      // Check if there are ongoing obligations (pending, partial, overdue)
      return ['pending', 'partial', 'overdue'].includes(obligation.status);
    });
  };

  // Get obligation summary for a student
  const getObligationSummary = (studentId: string) => {
    const studentObligations = obligations.filter(
      (obl) => obl.studentId === studentId
    );
    const totalObligations = studentObligations.reduce(
      (sum, obl) => sum + obl.amount,
      0
    );

    const studentPayments = payments.filter((payment) =>
      studentObligations.some((obl) => obl.id === payment.obligationId)
    );
    const totalPaid = studentPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const remaining = totalObligations - totalPaid;

    const statusCounts = {
      pending: studentObligations.filter((obl) => obl.status === 'pending')
        .length,
      partial: studentObligations.filter((obl) => obl.status === 'partial')
        .length,
      overdue: studentObligations.filter((obl) => obl.status === 'overdue')
        .length,
      paid: studentObligations.filter((obl) => obl.status === 'paid').length,
    };

    return { totalObligations, totalPaid, remaining, statusCounts };
  };

  // Filter students based on search query, status, grade, and obligations
  const filteredStudents = useMemo(() => {
    let filtered = students; // Filter by obligations if required
    if (filterOngoingObligationsOnly) {
      filtered = filtered.filter((student) =>
        hasOngoingObligations(student.id)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((student) => student.status === statusFilter);
    }

    // Apply grade filter
    if (gradeFilter !== 'all') {
      if (gradeFilter === UNASSIGNED_FILTER) {
        filtered = filtered.filter((student) => !student.classId);
      } else {
        filtered = filtered.filter(
          (student) => student.classId === gradeFilter
        );
      }
    } // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.id.toLowerCase().includes(query) ||
          student.email?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [
    students,
    searchQuery,
    statusFilter,
    gradeFilter,
    filterOngoingObligationsOnly,
    hasOngoingObligations,
  ]);
  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  const handleConfirm = () => {
    if (selectedStudentId) {
      const student = students.find((s) => s.id === selectedStudentId);
      if (student) {
        onStudentSelect(student);
        onOpenChange(false);
      }
    }
  };

  const handleCancel = () => {
    setSelectedStudentId(null);
    onOpenChange(false);
  };

  const clearSelection = () => {
    setSelectedStudentId(null);
  };

  const selectedStudent = selectedStudentId
    ? students.find((s) => s.id === selectedStudentId)
    : null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20"
      >
        <SheetHeader className="border-b border-white/20 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Select Student
              {filterOngoingObligationsOnly && (
                <span className="text-sm text-blue-400 font-normal">
                  (with ongoing obligations)
                </span>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/30">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>

              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/30">
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value={UNASSIGNED_FILTER}>Unassigned</SelectItem>
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Selection */}
          {selectedStudent && (
            <div className="bg-white/10 rounded-lg p-3 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  {' '}
                  <p className="text-white font-medium">
                    {selectedStudent.name}
                  </p>
                  <p className="text-white/70 text-sm">
                    ID: {selectedStudent.id}
                  </p>{' '}
                  {filterOngoingObligationsOnly && (
                    <div className="mt-2">
                      {(() => {
                        const summary = getObligationSummary(
                          selectedStudent.id
                        );
                        return (
                          <div className="text-xs text-white/80">
                            <p>Outstanding: ${summary.remaining.toFixed(2)}</p>
                            <p>
                              {summary.statusCounts.pending > 0 &&
                                `${summary.statusCounts.pending} pending, `}
                              {summary.statusCounts.partial > 0 &&
                                `${summary.statusCounts.partial} partial, `}
                              {summary.statusCounts.overdue > 0 &&
                                `${summary.statusCounts.overdue} overdue`}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="text-white/70 hover:text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Student List */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-white/40 mx-auto mb-2" />{' '}
                  <p className="text-white/60">
                    {filterOngoingObligationsOnly
                      ? 'No students with ongoing obligations found'
                      : 'No students found'}
                  </p>
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = selectedStudentId === student.id;
                  const classData = student.classId
                    ? classes.find((c) => c.id === student.classId)
                    : null;
                  const obligationSummary = filterOngoingObligationsOnly
                    ? getObligationSummary(student.id)
                    : null;

                  return (
                    <div
                      key={student.id}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer transition-all',
                        isSelected
                          ? 'bg-blue-600/30 border-blue-400/50'
                          : 'bg-white/10 border-white/20 hover:bg-white/20'
                      )}
                      onClick={() => handleStudentSelect(student.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {' '}
                            <h3 className="text-white font-medium">
                              {student.name}
                            </h3>
                            <span
                              className={cn(
                                'px-2 py-1 rounded-full text-xs',
                                student.status === 'active'
                                  ? 'bg-green-600/30 text-green-300'
                                  : student.status === 'inactive'
                                    ? 'bg-red-600/30 text-red-300'
                                    : 'bg-gray-600/30 text-gray-300'
                              )}
                            >
                              {student.status}
                            </span>
                          </div>
                          <p className="text-white/70 text-sm">
                            ID: {student.id}
                          </p>
                          {classData && (
                            <div className="flex items-center gap-1 mt-1">
                              <BookOpen className="w-3 h-3 text-white/60" />
                              <span className="text-xs text-white/60">
                                {classData.name}
                              </span>
                            </div>
                          )}
                          {obligationSummary &&
                            obligationSummary.remaining > 0 && (
                              <div className="mt-2 text-xs">
                                <p className="text-orange-300">
                                  Outstanding: $
                                  {obligationSummary.remaining.toFixed(2)}
                                </p>
                                <div className="flex gap-2 mt-1">
                                  {obligationSummary.statusCounts.pending >
                                    0 && (
                                    <span className="bg-yellow-600/30 text-yellow-300 px-1 py-0.5 rounded">
                                      {obligationSummary.statusCounts.pending}{' '}
                                      pending
                                    </span>
                                  )}
                                  {obligationSummary.statusCounts.partial >
                                    0 && (
                                    <span className="bg-blue-600/30 text-blue-300 px-1 py-0.5 rounded">
                                      {obligationSummary.statusCounts.partial}{' '}
                                      partial
                                    </span>
                                  )}
                                  {obligationSummary.statusCounts.overdue >
                                    0 && (
                                    <span className="bg-red-600/30 text-red-300 px-1 py-0.5 rounded">
                                      {obligationSummary.statusCounts.overdue}{' '}
                                      overdue
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/20">
            <Button
              onClick={handleConfirm}
              disabled={!selectedStudentId}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirm Selection
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 border-white/30 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SingleStudentSelectionPanel;

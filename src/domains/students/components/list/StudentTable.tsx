import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Student } from '@/domains/students/studentsSlice';
import GlassCard from '@/components/common/GlassCard';
import {
  Phone,
  User,
  ChevronRight,
  Mail,
  Calendar,
  MapPin,
  GraduationCap,
  Clock,
} from 'lucide-react';
import { formatDate } from '@/utils/dateFormatters';
import { formatSchedule } from '@/utils/scheduleFormatter';
import { DiscountIndicator, PaymentObligationIndicator } from '@/domains/classes/components/sections/PrivacyIndicator';
import {
  selectObligationsByStudentId,
  selectStudentOutstandingBalance,
} from '@/domains/finance/financeSlice';
import { RootState } from '@/store';
import { StudentDiscountInfo, StudentPaymentObligationInfo } from '@/types/api/class';
import { ObligationStatus } from '@/types/enums';
import { useCanViewFinance } from '@/hooks/usePermissions';

interface StudentTableProps {
  students: Student[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onView: (student: Student) => void;
  onPageChange: (page: number) => void;
  /** Override for canViewFinance permission (optional - uses hook if not provided) */
  canViewFinance?: boolean;
}

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  totalCount,
  currentPage,
  pageSize,
  onView,
  onPageChange,
  canViewFinance: canViewFinanceProp,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Use prop if provided, otherwise use hook
  const canViewFinanceFromHook = useCanViewFinance();
  const canViewFinance = canViewFinanceProp ?? canViewFinanceFromHook;

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => onPageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => onPageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis className="text-white/60" />
          </PaginationItem>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => onPageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis className="text-white/60" />
          </PaginationItem>
        );
      }

      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => onPageChange(totalPages)}
              isActive={currentPage === totalPages}
              className="cursor-pointer bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  // Get all obligations and balances from finance slice
  const allObligations = useSelector((state: RootState) => state.finance.obligations);
  const allPayments = useSelector((state: RootState) => state.finance.payments);

  // Helper to build discount info from student data
  const buildDiscountInfo = (student: Student): StudentDiscountInfo | null => {
    if (!student.hasDiscount) return null;
    
    return {
      hasDiscount: true,
      discountTypeName: student.discountTypeName || null,
      discountAmount: student.discountAmount || null,
    };
  };

  // Helper to build payment obligation info from finance slice
  const buildPaymentObligationInfo = (studentId: string): StudentPaymentObligationInfo | null => {
    const obligations = allObligations.filter(o => o.studentId === studentId);
    const payments = allPayments.filter(p => p.studentId === studentId);

    const totalObligations = obligations.reduce((sum, o) => sum + o.amount, 0);
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const outstandingBalance = totalObligations - totalPayments;

    const hasPending = outstandingBalance > 0;
    if (!hasPending) return null;

    const pendingCount = obligations.filter(
      (o) => o.status !== ObligationStatus.Paid
    ).length;

    return {
      hasPendingObligations: true,
      pendingCount,
      totalPendingAmount: outstandingBalance,
    };
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <GlassCard className="overflow-visible">
        <Table>
          <TableHeader>
            <TableRow className="border-white/20 hover:bg-white/5">
              <TableHead className="text-white/90 font-semibold">
                Student
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Personal
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Parent/Guardian
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Class
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Schedule
              </TableHead>
              {canViewFinance && (
                <TableHead className="text-white/90 font-semibold text-center">
                  Billing
                </TableHead>
              )}
              <TableHead className="w-12">
                {/* Navigation indicator column */}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const discountInfo = buildDiscountInfo(student);
              const paymentInfo = buildPaymentObligationInfo(student.id);

              return (
                <TableRow
                  key={student.id}
                  onClick={() => onView(student)}
                  className="border-white/10 hover:bg-white/10 cursor-pointer transition-colors group"
                >
                  {/* Student name + status + phone + join date */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {student.fullName}
                        </span>
                        {!student.isActive && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      {student.phone && (
                        <span className="text-xs text-white/70">
                          {student.phone}
                        </span>
                      )}
                      <span className="text-xs text-white/50">
                        Joined {formatDate(student.enrollmentDate)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Personal details: DOB and Place of Birth */}
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {student.dateOfBirth ? (
                        <span className="text-white/80">
                          {formatDate(student.dateOfBirth)}
                        </span>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                      {student.placeOfBirth ? (
                        <span className="text-white/80 truncate max-w-[120px] block">
                          {student.placeOfBirth}
                        </span>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Parent/Guardian: parent contact, parent email */}
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {student.parentContact ? (
                        <span className="text-white/70 truncate max-w-[150px] block">
                          {student.parentContact}
                        </span>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                      {student.parentEmail ? (
                        <span className="text-white/70 truncate max-w-[150px] block">
                          {student.parentEmail}
                        </span>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Class: class name and teacher name */}
                  <TableCell>
                    {student.currentClassId ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-white">
                          {student.currentClassName}
                        </span>
                        {student.currentTeacherName && (
                          <span className="text-xs text-white/60">
                            {student.currentTeacherName}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-white/40">Not enrolled</span>
                    )}
                  </TableCell>

                  {/* Schedule: formatted schedule or "Not scheduled" */}
                  <TableCell>
                    {student.currentClassSchedule &&
                    student.currentClassSchedule.length > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        {(() => {
                          // Group schedule by time slots
                          const timeSlots = new Map<string, string[]>();
                          student.currentClassSchedule.forEach((slot) => {
                            // Format time without seconds
                            const startTime = slot.startTime.substring(0, 5);
                            const endTime = slot.endTime.substring(0, 5);
                            const timeSlot = `${startTime}-${endTime}`;
                            
                            // Abbreviate day
                            const dayAbbr = slot.dayOfWeek.substring(0, 3);
                            
                            if (!timeSlots.has(timeSlot)) {
                              timeSlots.set(timeSlot, []);
                            }
                            timeSlots.get(timeSlot)!.push(dayAbbr);
                          });

                          return Array.from(timeSlots.entries()).map(
                            ([timeSlot, days], index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1.5 text-xs"
                              >
                                <span className="text-white/90 font-medium">
                                  {days.join(', ')}
                                </span>
                                <span className="text-white/50">•</span>
                                <span className="text-white/70">
                                  {timeSlot}
                                </span>
                              </div>
                            )
                          );
                        })()}
                      </div>
                    ) : (
                      <span className="text-sm text-white/40">
                        {student.currentClassId
                          ? 'No schedule'
                          : 'Not enrolled'}
                      </span>
                    )}
                  </TableCell>

                  {/* Billing: Discount and Payment icons side by side - Only visible if user can view finance */}
                  {canViewFinance && (
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <DiscountIndicator discount={discountInfo} />
                        <PaymentObligationIndicator
                          paymentObligation={paymentInfo}
                        />
                      </div>
                    </TableCell>
                  )}

                  {/* Navigation chevron */}
                  <TableCell>
                    <div className="flex justify-end">
                      <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white/70 transition-colors" />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </GlassCard>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {' '}
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    currentPage > 1 && onPageChange(currentPage - 1)
                  }
                  className={`cursor-pointer bg-white/5 border-white/10 text-white hover:bg-white/10 ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    currentPage < totalPages &&
                    onPageChange(currentPage + 1)
                  }
                  className={`cursor-pointer bg-white/5 border-white/10 text-white hover:bg-white/10 ${
                    currentPage === totalPages
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <div className="text-center text-white/60 text-sm">
        {totalCount} {totalCount === 1 ? 'student' : 'students'}
      </div>
    </motion.div>
  );
};

export default StudentTable;

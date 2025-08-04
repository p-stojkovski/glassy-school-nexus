import React, { useState } from 'react';
import {
  AlertCircle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import GlassCard from '@/components/common/GlassCard';
import { Student } from '@/domains/students/studentsSlice';
import {
  getStudentStatusColor,
  getPaymentStatusColor,
} from '@/utils/statusColors';
import ClassScheduleCell from './ClassScheduleCell';
import ClassNameCell from './ClassNameCell';

interface StudentTableProps {
  students: Student[];
  classes: any[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onView: (student: Student) => void;
  onClassNavigate?: (classId: string) => void;
  getPaymentStatus?: (
    studentId: string
  ) => 'pending' | 'partial' | 'paid' | 'overdue';
  loading?: boolean;
}

const ITEMS_PER_PAGE = 10;

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  classes,
  onEdit,
  onDelete,
  onView,
  onClassNavigate,
  getPaymentStatus,
  loading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = students.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if needed
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis className="text-white/60" />
          </PaginationItem>
        );
      }

      // Show current page and surrounding pages
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if needed
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis className="text-white/60" />
          </PaginationItem>
        );
      }

      // Show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => handlePageChange(totalPages)}
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

  return (
    <div className="space-y-4">
      <GlassCard className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/20 hover:bg-white/5">
              <TableHead className="text-white/90 font-semibold">
                Student
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Contact
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Class Schedule
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Class
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Payment
              </TableHead>
              <TableHead className="text-white/90 font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStudents.map((student) => (
              <TableRow
                key={student.id}
                className="border-white/10 hover:bg-white/5"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-white">
                        {student.name}
                      </div>
                      <div className="text-sm text-white/60">
                        {student.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="text-white/80">{student.phone}</div>
                    <div className="text-white/60 truncate max-w-[200px]">
                      {student.parentContact}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <ClassScheduleCell
                    studentId={student.id}
                    classes={classes}
                    students={students}
                    loading={loading}
                  />
                </TableCell>
                <TableCell>
                  <ClassNameCell
                    studentId={student.id}
                    classes={classes}
                    students={students}
                    onNavigate={onClassNavigate}
                    loading={loading}
                  />
                </TableCell>
                <TableCell>
                  {getPaymentStatus ? (
                    <Badge
                      className={`${getPaymentStatusColor(getPaymentStatus(student.id))} border`}
                    >
                      {getPaymentStatus(student.id).charAt(0).toUpperCase() +
                        getPaymentStatus(student.id).slice(1)}
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-2">
                      {student.paymentDue ? (
                        <div className="flex items-center gap-1 text-red-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Due</span>
                        </div>
                      ) : (
                        <div className="text-green-400 text-sm font-medium">
                          Paid
                        </div>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-gray-900/95 border-white/20 text-white"
                      >
                        <DropdownMenuItem
                          onClick={() => onView(student)}
                          className="text-blue-400 focus:text-blue-300 focus:bg-blue-500/10 cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onEdit(student)}
                          className="text-white/70 focus:text-white focus:bg-white/10 cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Student
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-white/20" />

                        <DropdownMenuItem
                          onClick={() => onDelete(student)}
                          className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
                    currentPage > 1 && handlePageChange(currentPage - 1)
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
                    handlePageChange(currentPage + 1)
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
        Showing {startIndex + 1} to{' '}
        {Math.min(startIndex + ITEMS_PER_PAGE, students.length)} of{' '}
        {students.length} students
      </div>
    </div>
  );
};

export default StudentTable;

import React from 'react';
import { motion } from 'framer-motion';
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
import { Teacher } from '../teachersSlice';
import { ChevronRight } from 'lucide-react';
import { formatDate } from '@/utils/dateFormatters';

interface TeacherTableProps {
  teachers: Teacher[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onView: (teacher: Teacher) => void;
  onPageChange: (page: number) => void;
}

const TeacherTable: React.FC<TeacherTableProps> = ({
  teachers,
  totalCount,
  currentPage,
  pageSize,
  onView,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);

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

  // Calculate years of experience from joinDate
  const calculateExperience = (joinDate: string): number => {
    const join = new Date(joinDate);
    const now = new Date();
    const years = now.getFullYear() - join.getFullYear();
    const monthDiff = now.getMonth() - join.getMonth();
    return monthDiff < 0 || (monthDiff === 0 && now.getDate() < join.getDate()) ? years - 1 : years;
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
                Teacher
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Professional
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Contact
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Classes
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Notes
              </TableHead>
              <TableHead className="w-12">
                {/* Navigation indicator column */}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => {
              const yearsExperience = calculateExperience(teacher.joinDate);
              return (
                <TableRow
                  key={teacher.id}
                  onClick={() => onView(teacher)}
                  className="border-white/10 hover:bg-white/10 cursor-pointer transition-colors group"
                >
                  {/* Teacher name + email + join date */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {teacher.name}
                        </span>
                        {!teacher.isActive && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-white/70">
                        {teacher.email}
                      </span>
                      <span className="text-xs text-white/50">
                        Joined {formatDate(teacher.joinDate)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Professional: Subject and class count */}
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <span className="text-white/80">{teacher.subjectName}</span>
                      <span className="text-white/60 text-xs block">
                        {teacher.classCount} {teacher.classCount === 1 ? 'class' : 'classes'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Contact: Phone */}
                  <TableCell>
                    <div className="text-sm">
                      {teacher.phone ? (
                        <span className="text-white/70">{teacher.phone}</span>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Classes: Display count */}
                  <TableCell>
                    <div className="text-sm text-white/80">
                      {teacher.classCount} {teacher.classCount === 1 ? 'class' : 'classes'}
                    </div>
                  </TableCell>

                  {/* Notes: Truncated or empty */}
                  <TableCell>
                    <div className="text-sm">
                      {teacher.notes ? (
                        <span className="text-white/70 truncate max-w-[150px] block">
                          {teacher.notes}
                        </span>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </div>
                  </TableCell>

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
        {totalCount} {totalCount === 1 ? 'teacher' : 'teachers'}
      </div>
    </motion.div>
  );
};

export default TeacherTable;

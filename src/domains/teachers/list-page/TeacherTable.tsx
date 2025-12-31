import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import GlassCard from '@/components/common/GlassCard';
import { Teacher } from '../teachersSlice';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';

interface TeacherTableProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  isDeleting?: boolean;
}

const ITEMS_PER_PAGE = 10;

const TeacherTable: React.FC<TeacherTableProps> = ({ teachers, onEdit, onDelete, isDeleting = false }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(teachers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTeachers = teachers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderPaginationItems = () => {
    const items = [] as JSX.Element[];
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
                Teacher
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Contact
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Subject
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Classes
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Join Date
              </TableHead>
              <TableHead className="text-white/90 font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTeachers.map((teacher) => (
              <TableRow
                key={teacher.id}
                className="border-white/10 hover:bg-white/5"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div>
                      <button
                        onClick={() => navigate(`/teachers/${teacher.id}`)}
                        className="font-medium text-white hover:text-blue-400 transition-colors text-left"
                      >
                        {teacher.name}
                      </button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="text-white/80">{teacher.email}</div>
                    {teacher.phone && (
                      <div className="text-white/60">{teacher.phone}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-white/80">{teacher.subjectName}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-white/80">
                    {teacher.classCount} class
                    {teacher.classCount !== 1 ? 'es' : ''}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-white/80">
                    {formatDate(teacher.joinDate)}
                  </div>
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
                          onClick={() => navigate(`/teachers/${teacher.id}`)}
                          className="text-white/70 focus:text-white focus:bg-white/10 cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEdit(teacher)}
                          className="text-white/70 focus:text-white focus:bg-white/10 cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Teacher
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-white/20" />

                        <DropdownMenuItem
                          onClick={() => onDelete(teacher)}
                          className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isDeleting ? 'Deleting...' : 'Delete Teacher'}
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
        {Math.min(startIndex + ITEMS_PER_PAGE, teachers.length)} of{' '}
        {teachers.length} teachers
      </div>
    </div>
  );
};

export default TeacherTable;

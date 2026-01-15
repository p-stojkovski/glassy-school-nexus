/**
 * BaseSalaryHistoryDialog - Shows historical base salary changes
 */
import { useEffect, useState } from 'react';
import { History, Calendar, FileText, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { teacherBaseSalaryService } from '@/services/teacherBaseSalaryService';
import { setBaseSalaryHistory } from '@/domains/teachers/teachersSlice';
import { formatCurrency } from '@/utils/formatters';
import type { TeacherBaseSalaryResponse } from '@/types/api/teacherBaseSalary';

interface BaseSalaryHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  academicYearId: string;
}

export function BaseSalaryHistoryDialog({
  open,
  onOpenChange,
  teacherId,
  academicYearId,
}: BaseSalaryHistoryDialogProps) {
  const dispatch = useAppDispatch();
  const history = useAppSelector((state) => state.teachers.baseSalaryHistory);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && teacherId && academicYearId) {
      const loadHistory = async () => {
        setLoading(true);
        try {
          const data = await teacherBaseSalaryService.getBaseSalaryHistory(
            teacherId,
            academicYearId
          );
          dispatch(setBaseSalaryHistory(data.history));
        } catch (err) {
          console.error('Failed to load base salary history:', err);
        } finally {
          setLoading(false);
        }
      };
      loadHistory();
    }
  }, [open, teacherId, academicYearId, dispatch]);

  const formatDateRange = (from: string, to: string | null) => {
    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };
    const fromDate = formatDate(from);
    const toDate = to ? formatDate(to) : 'Present';
    return `${fromDate} - ${toDate}`;
  };

  const formatCreatedDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-gray-900/95 backdrop-blur-md border border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <History className="h-5 w-5 text-yellow-400" />
            Base Salary History
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Historical record of all base salary changes for this academic year.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-white/60" />
              <span className="ml-3 text-white/60">Loading history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">No salary history found for this academic year.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/70">Amount</TableHead>
                  <TableHead className="text-white/70">Effective Period</TableHead>
                  <TableHead className="text-white/70">Reason</TableHead>
                  <TableHead className="text-white/70">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record: TeacherBaseSalaryResponse) => (
                  <TableRow key={record.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-medium text-white">
                      {formatCurrency(record.baseNetSalary)}
                    </TableCell>
                    <TableCell className="text-white/80">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-white/40" />
                        {formatDateRange(record.effectiveFrom, record.effectiveTo)}
                      </div>
                    </TableCell>
                    <TableCell className="text-white/80 max-w-[200px] truncate">
                      {record.changeReason || (
                        <span className="text-white/40 italic">No reason provided</span>
                      )}
                    </TableCell>
                    <TableCell className="text-white/60 text-sm">
                      {formatCreatedDate(record.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

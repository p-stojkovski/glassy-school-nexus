import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectAllObligations,
  selectSelectedPeriod,
  selectSelectedStudentId,
  setSelectedPeriod,
  setSelectedStudent,
  deleteObligation,
  PaymentObligation,
} from '@/domains/finance/financeSlice';
import { ObligationStatus } from '@/types/enums';
import { useToast } from '@/hooks/use-toast';
import { getPaymentStatusColor } from '@/utils/statusColors';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ObligationTableProps {
  onEdit?: (id: string) => void;
}

const ObligationTable: React.FC<ObligationTableProps> = ({ onEdit }) => {
  const dispatch = useAppDispatch();
  const obligations = useAppSelector(selectAllObligations);
  const selectedPeriod = useAppSelector(selectSelectedPeriod);
  const selectedStudentId = useAppSelector(selectSelectedStudentId);
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  // Generate unique list of periods from obligations
  const periods = [...new Set(obligations.map((o) => o.period))];

  // Generate unique list of students from obligations with proper deduplication
  const studentsMap = new Map();
  obligations.forEach((o) => {
    if (!studentsMap.has(o.studentId)) {
      studentsMap.set(o.studentId, { id: o.studentId, name: o.studentName });
    }
  });
  const students = Array.from(studentsMap.values());

  const handlePeriodChange = (period: string) => {
    dispatch(setSelectedPeriod(period === 'all_periods' ? null : period));
  };

  const handleStudentChange = (studentId: string) => {
    dispatch(
      setSelectedStudent(studentId === 'all_students' ? null : studentId)
    );
  };

  const handleDeleteObligation = (id: string) => {
    // Find obligation details before deleting for use in notification
    const obligation = obligations.find((obl) => obl.id === id);
    dispatch(deleteObligation(id));
    if (obligation) {
      toast({
        title: 'Obligation deleted',
        description: `${obligation.type} obligation for ${obligation.studentName} has been deleted.`,
        variant: 'destructive',
        icon: (
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        ),
      });
    }
  };

  const handleClearFilters = () => {
    dispatch(setSelectedPeriod(null));
    dispatch(setSelectedStudent(null));
    setSearch('');
  };

  // Filter obligations based on selected filters and search
  const filteredObligations = obligations.filter((obligation) => {
    const matchesSearch =
      search === '' ||
      obligation.studentName.toLowerCase().includes(search.toLowerCase()) ||
      obligation.type.toLowerCase().includes(search.toLowerCase());

    const matchesPeriod =
      !selectedPeriod || obligation.period === selectedPeriod;
    const matchesStudent =
      !selectedStudentId || obligation.studentId === selectedStudentId;

    return matchesSearch && matchesPeriod && matchesStudent;
  });

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: ObligationStatus) => {
    return (
      <Badge
        variant="outline"
        className={`${getPaymentStatusColor(status)} border`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1">
          <Input
            placeholder="Search by student or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Select
            value={selectedPeriod || 'all_periods'}
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="w-full md:w-[180px] bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="All Periods" />
            </SelectTrigger>{' '}
            <SelectContent className="bg-gray-800 text-white border border-white/30 backdrop-blur-sm">
              <SelectItem
                value="all_periods"
                className="text-white hover:bg-gray-700 focus:bg-gray-700"
              >
                All Students
              </SelectItem>
              {periods.map((period) => (
                <SelectItem
                  key={period}
                  value={period}
                  className="text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedStudentId || 'all_students'}
            onValueChange={handleStudentChange}
          >
            <SelectTrigger className="w-full md:w-[180px] bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="All Students" />
            </SelectTrigger>{' '}
            <SelectContent className="bg-gray-800 text-white border border-white/30 backdrop-blur-sm">
              <SelectItem
                value="all_students"
                className="text-white hover:bg-gray-700 focus:bg-gray-700"
              >
                All Students
              </SelectItem>
              {students.map((student) => (
                <SelectItem
                  key={student.id}
                  value={student.id}
                  className="text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="bg-blue-500/30 backdrop-blur-sm border-blue-400 text-white font-medium hover:bg-blue-500/50 shadow-sm"
          >
            <svg
              className="mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3l18 18"></path>
              <path d="M10.9 4a7.03 7.03 0 0 1 2.2 2.2"></path>
              <path d="M17.7 7.7a7.03 7.03 0 0 1 .8 3.3c0 1-.2 1.9-.6 2.8"></path>
              <path d="M4.6 11a7 7 0 0 1 7.1-7"></path>
              <path d="M4 17a7 7 0 0 0 11 0"></path>
            </svg>
            Clear Filters
          </Button>
        </div>
      </div>

      <Table className="text-white">
        <TableCaption className="text-white">
          Payment obligations for students.
        </TableCaption>
        <TableHeader className="border-white/20">
          <TableRow className="border-white/20 hover:bg-white/10">
            <TableHead className="text-white">Student</TableHead>
            <TableHead className="text-white">Type</TableHead>
            <TableHead className="text-white text-right">Amount</TableHead>
            <TableHead className="text-white">Due Date</TableHead>
            <TableHead className="text-white">Period</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredObligations.length === 0 ? (
            <TableRow className="border-white/20 hover:bg-white/10">
              <TableCell colSpan={7} className="text-center py-8 text-white">
                No payment obligations found.
              </TableCell>
            </TableRow>
          ) : (
            filteredObligations.map((obligation) => (
              <TableRow
                key={obligation.id}
                className="border-white/20 hover:bg-white/10"
              >
                <TableCell className="font-medium text-white">
                  {obligation.studentName}
                </TableCell>
                <TableCell className="text-white">{obligation.type}</TableCell>
                <TableCell className="text-right text-white">
                  ${obligation.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-white">
                  {format(parseISO(obligation.dueDate), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-white">
                  {obligation.period}
                </TableCell>
                <TableCell>{renderStatusBadge(obligation.status)}</TableCell>{' '}
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(obligation.id)}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        Edit
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">
                            Delete Obligation
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-white/70">
                            Are you sure you want to delete this payment
                            obligation? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDeleteObligation(obligation.id)
                            }
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ObligationTable;

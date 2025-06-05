import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { 
  selectAllObligations, 
  selectSelectedPeriod,
  selectSelectedStudentId,
  setSelectedPeriod, 
  setSelectedStudent, 
  deleteObligation,
  PaymentObligation
} from '@/store/slices/financeSlice';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ObligationTableProps {
  onEdit: (id: string) => void;
}

const ObligationTable: React.FC<ObligationTableProps> = ({ onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const obligations = useSelector(selectAllObligations);
  const selectedPeriod = useSelector(selectSelectedPeriod);
  const selectedStudentId = useSelector(selectSelectedStudentId);
  const [search, setSearch] = useState('');

  // Generate unique list of periods from obligations
  const periods = [...new Set(obligations.map(o => o.period))];
  
  // Generate unique list of students from obligations
  const students = [...new Set(obligations.map(o => ({ id: o.studentId, name: o.studentName })))];

  const handlePeriodChange = (period: string) => {
    dispatch(setSelectedPeriod(period));
  };

  const handleStudentChange = (studentId: string) => {
    dispatch(setSelectedStudent(studentId));
  };

  const handleDeleteObligation = (id: string) => {
    dispatch(deleteObligation(id));
  };

  const handleClearFilters = () => {
    dispatch(setSelectedPeriod(null));
    dispatch(setSelectedStudent(null));
    setSearch('');
  };

  // Filter obligations based on selected filters and search
  const filteredObligations = obligations.filter(obligation => {
    const matchesSearch = search === '' || 
      obligation.studentName.toLowerCase().includes(search.toLowerCase()) ||
      obligation.type.toLowerCase().includes(search.toLowerCase());
    
    const matchesPeriod = !selectedPeriod || obligation.period === selectedPeriod;
    const matchesStudent = !selectedStudentId || obligation.studentId === selectedStudentId;
    
    return matchesSearch && matchesPeriod && matchesStudent;
  });
  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50">Paid</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50">Partial</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/50">Overdue</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">Pending</Badge>;
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1">
          <Input 
            placeholder="Search by student or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/20 border-white/30 text-white placeholder:text-white/70"
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <Select
            value={selectedPeriod || ''}
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="w-full md:w-[180px] bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="All Periods" />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-sm">
              <SelectItem value="">All Periods</SelectItem>
              {periods.map(period => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedStudentId || ''}
            onValueChange={handleStudentChange}
          >
            <SelectTrigger className="w-full md:w-[180px] bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="All Students" />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-sm">
              <SelectItem value="">All Students</SelectItem>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>          <Button variant="outline" onClick={handleClearFilters} className="border-white/30 text-white hover:bg-white/20">
            Clear Filters
          </Button>
        </div>
      </div>      <Table className="text-white">
        <TableCaption className="text-white">Payment obligations for students.</TableCaption>
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
              <TableRow key={obligation.id} className="border-white/20 hover:bg-white/10">
                <TableCell className="font-medium text-white">{obligation.studentName}</TableCell>
                <TableCell className="text-white">{obligation.type}</TableCell>
                <TableCell className="text-right text-white">${obligation.amount.toFixed(2)}</TableCell>
                <TableCell className="text-white">{format(parseISO(obligation.dueDate), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-white">{obligation.period}</TableCell>
                <TableCell>{renderStatusBadge(obligation.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>                      <Button variant="ghost" size="icon" className="hover:bg-white/20">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-sm">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(obligation.id)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white/90 backdrop-blur-sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this payment obligation? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteObligation(obligation.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

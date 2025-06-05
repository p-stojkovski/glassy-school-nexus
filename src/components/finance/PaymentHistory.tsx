import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { 
  selectAllPayments,
  selectSelectedPeriod,
  selectSelectedStudentId,
  setSelectedPeriod,
  setSelectedStudent,
  deletePayment,
  selectAllObligations,
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
import { MoreHorizontal, Pencil, Trash2, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PaymentHistoryProps {
  onEdit: (id: string) => void;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ onEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const payments = useSelector(selectAllPayments);
  const obligations = useSelector(selectAllObligations);
  const selectedPeriod = useSelector(selectSelectedPeriod);
  const selectedStudentId = useSelector(selectSelectedStudentId);
  const [search, setSearch] = useState('');

  // Generate unique list of periods from obligations
  const periods = [...new Set(obligations.map(o => o.period))];
  
  // Generate unique list of students from payments
  const students = [...new Set(payments.map(p => ({ id: p.studentId, name: p.studentName })))];

  const handlePeriodChange = (period: string) => {
    dispatch(setSelectedPeriod(period));
  };

  const handleStudentChange = (studentId: string) => {
    dispatch(setSelectedStudent(studentId));
  };

  const handleDeletePayment = (id: string) => {
    dispatch(deletePayment(id));
  };

  const handleClearFilters = () => {
    dispatch(setSelectedPeriod(null));
    dispatch(setSelectedStudent(null));
    setSearch('');
  };

  // Find obligation details for a payment
  const getObligationDetails = (obligationId: string) => {
    const obligation = obligations.find(o => o.id === obligationId);
    return obligation ? `${obligation.type} (${obligation.period})` : 'Unknown';
  };

  // Format payment method for display
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'card':
        return 'Card';
      case 'transfer':
        return 'Bank Transfer';
      default:
        return 'Other';
    }
  };

  // Filter payments based on selected filters and search
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = search === '' || 
      payment.studentName.toLowerCase().includes(search.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(search.toLowerCase());
    
    let matchesPeriod = true;
    if (selectedPeriod) {
      const obligation = obligations.find(o => o.id === payment.obligationId);
      matchesPeriod = obligation?.period === selectedPeriod;
    }
    
    const matchesStudent = !selectedStudentId || payment.studentId === selectedStudentId;
    
    return matchesSearch && matchesPeriod && matchesStudent;
  });

  // Sort payments by date (newest first)
  const sortedPayments = [...filteredPayments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1">
          <Input 
            placeholder="Search by student or reference..."
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
          </Select>

          <Button variant="outline" className="border-white/30 text-white hover:bg-white/20" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      <Table className="text-white">
        <TableCaption className="text-white/70">Payment history.</TableCaption>
        <TableHeader className="border-white/20">
          <TableRow className="border-white/20 hover:bg-transparent">
            <TableHead className="text-white">Date</TableHead>
            <TableHead className="text-white">Student</TableHead>
            <TableHead className="text-white">For</TableHead>
            <TableHead className="text-white">Method</TableHead>
            <TableHead className="text-right text-white">Amount</TableHead>
            <TableHead className="text-white">Reference</TableHead>
            <TableHead className="text-white">Recorded By</TableHead>
            <TableHead className="text-right text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPayments.length === 0 ? (
            <TableRow className="border-white/20 hover:bg-white/10">
              <TableCell colSpan={8} className="text-center py-8 text-white/70">
                No payment records found.
              </TableCell>
            </TableRow>
          ) : (
            sortedPayments.map((payment) => (
              <TableRow key={payment.id} className="border-white/20 hover:bg-white/10">
                <TableCell>{format(parseISO(payment.date), 'MMM d, yyyy')}</TableCell>
                <TableCell className="font-medium">{payment.studentName}</TableCell>
                <TableCell>{getObligationDetails(payment.obligationId)}</TableCell>
                <TableCell>{formatPaymentMethod(payment.method)}</TableCell>
                <TableCell className="text-right">${payment.amount.toFixed(2)}</TableCell>
                <TableCell>{payment.reference || '-'}</TableCell>
                <TableCell>{payment.createdBy}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-white/20">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-sm">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(payment.id)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Receipt className="mr-2 h-4 w-4" /> View Receipt
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
                              Are you sure you want to delete this payment record? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePayment(payment.id)}>
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

export default PaymentHistory;

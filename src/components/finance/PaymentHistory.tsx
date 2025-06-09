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
import { useToast } from '@/hooks/use-toast';
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
import { Receipt } from 'lucide-react';
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
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  // Generate unique list of periods from obligations
  const periods = [...new Set(obligations.map(o => o.period))];
  
  // Generate unique list of students from payments with proper deduplication
  const studentsMap = new Map();
  payments.forEach(p => {
    if (!studentsMap.has(p.studentId)) {
      studentsMap.set(p.studentId, { id: p.studentId, name: p.studentName });
    }
  });
  const students = Array.from(studentsMap.values());

  const handlePeriodChange = (period: string) => {
    dispatch(setSelectedPeriod(period === 'all_periods' ? null : period));
  };

  const handleStudentChange = (studentId: string) => {
    dispatch(setSelectedStudent(studentId === 'all_students' ? null : studentId));
  };

  const handleDeletePayment = (id: string) => {
    // Find payment details before deleting for use in notification
    const payment = payments.find(pay => pay.id === id);
    dispatch(deletePayment(id));
    
    if (payment) {
      const obligationDetails = getObligationDetails(payment.obligationId);
      toast({
        title: "Payment deleted",
        description: `Payment of $${payment.amount.toFixed(2)} for ${payment.studentName}'s ${obligationDetails} has been deleted.`,
        variant: "destructive",
        icon: <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>,
      });
    }
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
            value={selectedPeriod || 'all_periods'}
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger className="w-full md:w-[180px] bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="All Periods" />
            </SelectTrigger>            <SelectContent className="bg-gray-800 text-white border border-white/30 backdrop-blur-sm">
              <SelectItem value="all_periods" className="text-white hover:bg-gray-700 focus:bg-gray-700">All Periods</SelectItem>
              {periods.map(period => (
                <SelectItem key={period} value={period} className="text-white hover:bg-gray-700 focus:bg-gray-700">
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
            </SelectTrigger>            <SelectContent className="bg-gray-800 text-white border border-white/30 backdrop-blur-sm">
              <SelectItem value="all_students" className="text-white hover:bg-gray-700 focus:bg-gray-700">All Students</SelectItem>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id} className="text-white hover:bg-gray-700 focus:bg-gray-700">
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
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <TableCell colSpan={8} className="text-center py-8 text-white">
                No payment records found.
              </TableCell>
            </TableRow>
          ) : (
            sortedPayments.map((payment) => (
              <TableRow key={payment.id} className="border-white/20 hover:bg-white/10">
                <TableCell className="text-white">{format(parseISO(payment.date), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-white">{payment.studentName}</TableCell>
                <TableCell className="text-white">{getObligationDetails(payment.obligationId)}</TableCell>
                <TableCell className="text-white">{formatPaymentMethod(payment.method)}</TableCell>
                <TableCell className="text-right text-white">${payment.amount.toFixed(2)}</TableCell>
                <TableCell className="text-white">{payment.reference || '-'}</TableCell>
                <TableCell className="text-white">{payment.createdBy}</TableCell>                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(payment.id)}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      Edit
                    </Button>
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
                          <AlertDialogTitle className="text-white">Delete Payment</AlertDialogTitle>
                          <AlertDialogDescription className="text-white/70">
                            Are you sure you want to delete this payment record? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeletePayment(payment.id)}
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

export default PaymentHistory;
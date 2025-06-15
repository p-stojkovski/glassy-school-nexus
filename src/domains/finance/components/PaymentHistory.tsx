import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectAllPayments,
  selectSelectedPeriod,
  selectSelectedStudentId,
  setSelectedPeriod,
  setSelectedStudent,
  deletePayment,
  selectAllObligations,
  Payment,
} from '@/domains/finance/financeSlice';
import { useToast } from '@/hooks/use-toast';
import PaymentFilters from './PaymentFilters';
import PaymentList from './PaymentList';

interface PaymentHistoryProps {
  onEdit: (id: string) => void;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ onEdit }) => {
  const dispatch = useAppDispatch();
  const payments = useAppSelector(selectAllPayments);
  const obligations = useAppSelector(selectAllObligations);
  const selectedPeriod = useAppSelector(selectSelectedPeriod);
  const selectedStudentId = useAppSelector(selectSelectedStudentId);
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  // Generate unique list of periods from obligations
  const periods = [...new Set(obligations.map(o => o.period))];

  // Generate unique list of students from payments with proper deduplication
  const studentsMap = new Map<string, { id: string; name: string }>();
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
      const obligation = obligations.find(o => o.id === payment.obligationId);
      const obligationDetails = obligation ? `${obligation.type} (${obligation.period})` : 'Unknown';
      toast({
        title: 'Payment deleted',
        description: `Payment of $${payment.amount.toFixed(2)} for ${payment.studentName}'s ${obligationDetails} has been deleted.`,
        variant: 'destructive',
        icon: (
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

  // Filter payments based on selected filters and search
  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      search === '' ||
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
      <PaymentFilters
        search={search}
        onSearchChange={setSearch}
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
        periods={periods}
        selectedStudentId={selectedStudentId}
        onStudentChange={handleStudentChange}
        students={students}
        onClear={handleClearFilters}
      />
      <PaymentList
        payments={sortedPayments as Payment[]}
        obligations={obligations}
        onEdit={onEdit}
        onDelete={handleDeletePayment}
      />
    </div>
  );
};

export default PaymentHistory;

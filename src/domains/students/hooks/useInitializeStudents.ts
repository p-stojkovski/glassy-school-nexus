import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import {
  setStudents,
  setLoading,
  Student,
} from '../studentsSlice';
import {
  createObligation,
  PaymentObligation,
} from '@/store/slices/financeSlice';

// Hook responsible for populating the store with mock students and obligations
export const useInitializeStudents = () => {
  const dispatch = useAppDispatch();
  const students = useAppSelector((state: RootState) => state.students.students);
  const paymentObligations = useAppSelector(
    (state: RootState) => state.finance.obligations
  );

  useEffect(() => {
    if (students.length === 0) {
      dispatch(setLoading(true));
      setTimeout(() => {
        const mockStudents: Student[] = Array.from({ length: 35 }, (_, index) => ({
          id: `student-${index + 1}`,
          name: `Student ${index + 1}`,
          email: `student${index + 1}@email.com`,
          phone: `+1-555-${String(index + 100).padStart(4, '0')}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Student${index + 1}`,
          classId: `class-${(index % 3) + 1}`,
          status: Math.random() > 0.2 ? 'active' : 'inactive',
          joinDate: new Date(
            2024,
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          ).toISOString(),
          parentContact: `Parent ${index + 1} - +1-555-${String(index + 200).padStart(4, '0')}`,
          paymentDue: Math.random() > 0.7,
          lastPayment: new Date(
            2024,
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          ).toISOString(),
        }));
        dispatch(setStudents(mockStudents));

        if (paymentObligations.length === 0) {
          const obligationTypes = [
            'Tuition Fee',
            'Registration Fee',
            'Book Fee',
            'Activity Fee',
            'Laboratory Fee',
          ];
          const periods = ['Fall 2024', 'Spring 2025'];
          const statuses: Array<'pending' | 'partial' | 'paid' | 'overdue'> = [
            'pending',
            'partial',
            'paid',
            'overdue',
          ];

          const studentsWithObligations = mockStudents.slice(
            0,
            Math.floor(mockStudents.length * 0.7)
          );

          studentsWithObligations.forEach((student) => {
            const numObligations = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < numObligations; i++) {
              const now = new Date().toISOString();
              const dueDate = new Date(
                2024,
                Math.floor(Math.random() * 12),
                Math.floor(Math.random() * 28) + 1
              );

              const mockObligation: PaymentObligation = {
                id: `obligation-${student.id}-${i}`,
                studentId: student.id,
                studentName: student.name,
                type: obligationTypes[Math.floor(Math.random() * obligationTypes.length)],
                amount: Math.floor(Math.random() * 1000) + 100,
                dueDate: dueDate.toISOString().split('T')[0],
                period: periods[Math.floor(Math.random() * periods.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                notes: Math.random() > 0.7 ? 'Auto-generated test obligation' : undefined,
                createdAt: now,
                updatedAt: now,
              };

              dispatch(createObligation(mockObligation));
            }
          });
        }

        dispatch(setLoading(false));
      }, 1000);
    }
  }, [dispatch, students.length, paymentObligations.length]);
};


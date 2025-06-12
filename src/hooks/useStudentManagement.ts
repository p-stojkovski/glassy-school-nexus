
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import {
  addStudent,
  updateStudent,
  deleteStudent,
  setError,
  selectStudents,
  selectLoading,
  selectError,
  Student,
} from '../store/slices/studentsSlice';
import { useInitializeStudents } from './useInitializeStudents';
import {
  useStudentFilters,
  getStudentPaymentStatus,
} from './useStudentFilters';
import { toast } from '../components/ui/use-toast';

export const useStudentManagement = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const students = useAppSelector(selectStudents);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const classes = useAppSelector((state: RootState) => state.classes.classes);
  const paymentObligations = useAppSelector((state: RootState) => state.finance.obligations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'pending' | 'partial' | 'paid' | 'overdue'>('all');
  const [classFilter, setClassFilter] = useState<'all' | 'unassigned' | string>('all');const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Populate store with mock data when needed
  useInitializeStudents();

  const filteredStudents = useStudentFilters({
    students,
    obligations: paymentObligations,
    searchTerm,
    statusFilter,
    paymentStatusFilter,
    classFilter,
  });


  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsFormOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
  };

  const confirmDeleteStudent = () => {
    if (studentToDelete) {
      dispatch(deleteStudent(studentToDelete.id));
      toast({
        title: "Student Deleted",
        description: `${studentToDelete.name} has been successfully deleted.`,
      });
      setStudentToDelete(null);
    }
  };
  const handleViewStudent = (student: Student) => {
    navigate(`/students/${student.id}`);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedStudent(null);
  };  // Type for student form data
  type StudentFormData = {
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
    parentContact: string;
  };

  const handleSubmit = async (data: StudentFormData) => {
    try {
      if (selectedStudent) {
        const updatedStudent: Student = {
          ...selectedStudent,
          ...data,
        };
        dispatch(updateStudent(updatedStudent));
        toast({
          title: "Student Updated",
          description: `${data.name} has been successfully updated.`,
        });
      } else {
        const newStudent: Student = {
          id: Date.now().toString(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
          classId: 'unassigned',
          joinDate: new Date().toISOString(),
          paymentDue: false,
          lastPayment: new Date().toISOString(),
          ...data,
        };
        dispatch(addStudent(newStudent));
        toast({
          title: "Student Added",
          description: `${data.name} has been successfully added.`,
        });
      }
      handleCloseForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };  // Show error toast if there's an error in the students state
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      dispatch(setError(null)); // Clear error after showing toast
    }
  }, [error, dispatch]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentStatusFilter('all');
    setClassFilter('all');
  };

  return {
    students: filteredStudents,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    classFilter,    setClassFilter,
    clearFilters,
    classes,
    getStudentPaymentStatus,
    isFormOpen,
    selectedStudent,
    studentToDelete,
    setStudentToDelete,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    confirmDeleteStudent,
    handleViewStudent,
    handleCloseForm,
    handleSubmit,
  };
};

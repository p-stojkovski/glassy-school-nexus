
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { 
  setStudents, 
  addStudent, 
  updateStudent, 
  deleteStudent, 
  setLoading, 
  setError,
  selectStudents,
  selectLoading,
  selectError,
  Student 
} from '../store/slices/studentsSlice';
import { 
  createObligation, 
  PaymentObligation 
} from '../store/slices/financeSlice';
import { toast } from '../components/ui/use-toast';

export const useStudentManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const students = useSelector(selectStudents);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const classes = useSelector((state: RootState) => state.classes.classes);
  const paymentObligations = useSelector((state: RootState) => state.finance.obligations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'pending' | 'partial' | 'paid' | 'overdue'>('all');
  const [classFilter, setClassFilter] = useState<'all' | 'unassigned' | string>('all');const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Initialize with mock data only if no students exist in localStorage
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
          joinDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
          parentContact: `Parent ${index + 1} - +1-555-${String(index + 200).padStart(4, '0')}`,
          paymentDue: Math.random() > 0.7,
          lastPayment: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),        }));
        dispatch(setStudents(mockStudents));

        // Create mock payment obligations if none exist
        if (paymentObligations.length === 0) {
          const obligationTypes = ['Tuition Fee', 'Registration Fee', 'Book Fee', 'Activity Fee', 'Laboratory Fee'];
          const periods = ['Fall 2024', 'Spring 2025'];
          const statuses: ('pending' | 'partial' | 'paid' | 'overdue')[] = ['pending', 'partial', 'paid', 'overdue'];
          
          // Create obligations for about 70% of students to have a mix
          const studentsWithObligations = mockStudents.slice(0, Math.floor(mockStudents.length * 0.7));
          
          studentsWithObligations.forEach((student, index) => {
            const numObligations = Math.floor(Math.random() * 3) + 1; // 1-3 obligations per student
            
            for (let i = 0; i < numObligations; i++) {
              const now = new Date().toISOString();
              const dueDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
              
              const mockObligation: PaymentObligation = {
                id: `obligation-${student.id}-${i}`,
                studentId: student.id,
                studentName: student.name,
                type: obligationTypes[Math.floor(Math.random() * obligationTypes.length)],
                amount: Math.floor(Math.random() * 1000) + 100, // $100-$1099
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
  }, [dispatch, students.length, paymentObligations.length]);  // Helper function to get student payment status
  const getStudentPaymentStatus = (studentId: string): 'pending' | 'partial' | 'paid' | 'overdue' => {
    const studentObligations = paymentObligations.filter(obligation => obligation.studentId === studentId);
    
    if (studentObligations.length === 0) {
      return 'paid'; // No obligations means all paid
    }
    
    const hasOverdue = studentObligations.some(obligation => obligation.status === 'overdue');
    const hasPending = studentObligations.some(obligation => obligation.status === 'pending');
    const hasPartial = studentObligations.some(obligation => obligation.status === 'partial');
    const allPaid = studentObligations.every(obligation => obligation.status === 'paid');
    
    if (hasOverdue) return 'overdue';
    if (allPaid) return 'paid';
    if (hasPartial) return 'partial';
    if (hasPending) return 'pending';
    return 'pending';
  };  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    // Payment status filter
    const studentPaymentStatus = getStudentPaymentStatus(student.id);
    const matchesPaymentStatus = paymentStatusFilter === 'all' || studentPaymentStatus === paymentStatusFilter;
    
    // Class filter
    let matchesClass = true;
    if (classFilter !== 'all') {
      if (classFilter === 'unassigned') {
        matchesClass = !student.classId || student.classId === 'unassigned';
      } else {
        matchesClass = student.classId === classFilter;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPaymentStatus && matchesClass;
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

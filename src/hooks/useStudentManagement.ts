
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setStudents, addStudent, updateStudent, deleteStudent, setLoading, Student } from '../store/slices/studentsSlice';
import { toast } from '../components/ui/use-toast';

export const useStudentManagement = () => {
  const dispatch = useDispatch();
  const { students, loading } = useSelector((state: RootState) => state.students);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Mock data initialization
  useEffect(() => {
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
        lastPayment: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      }));
      dispatch(setStudents(mockStudents));
      dispatch(setLoading(false));
    }, 1000);
  }, [dispatch]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
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
    console.log('Viewing student:', student);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedStudent(null);
  };

  const handleSubmit = async (data: any) => {
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
  };

  return {
    students: filteredStudents,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
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

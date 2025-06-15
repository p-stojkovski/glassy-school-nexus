import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addStudent,
  updateStudent,
  deleteStudent,
  setError,
  selectError,
  Student,
} from '../studentsSlice';
import { toast } from '../../../hooks/use-toast';

export const useStudentForm = () => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectError);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

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
        title: 'Student Deleted',
        description: `${studentToDelete.name} has been successfully deleted.`,
      });
      setStudentToDelete(null);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedStudent(null);
  };

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
          title: 'Student Updated',
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
          title: 'Student Added',
          description: `${data.name} has been successfully added.`,
        });
      }
      handleCloseForm();
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
      dispatch(setError(null));
    }
  }, [error, dispatch]);

  return {
    isFormOpen,
    selectedStudent,
    studentToDelete,
    setStudentToDelete,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    confirmDeleteStudent,
    handleCloseForm,
    handleSubmit,
  };
};

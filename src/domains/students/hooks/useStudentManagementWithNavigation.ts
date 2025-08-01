import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { deleteStudent, Student } from '../studentsSlice';
import { toast } from 'sonner';
import { useStudentManagement } from './useStudentManagement';

export const useStudentManagementWithNavigation = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Use the existing student management hook for filtering and data
  const studentManagement = useStudentManagement();

  const handleAddStudent = () => {
    navigate('/students/new');
  };

  const handleEditStudent = (student: Student) => {
    navigate(`/students/edit/${student.id}`);
  };

  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
  };

  const confirmDeleteStudent = () => {
    if (studentToDelete) {
      dispatch(deleteStudent(studentToDelete.id));
      toast.success('Student Deleted', {
        description: `${studentToDelete.name} has been successfully deleted.`,
      });
      setStudentToDelete(null);
    }
  };

  return {
    ...studentManagement,
    studentToDelete,
    setStudentToDelete,
    handleAddStudent,
    handleEditStudent,
    handleDeleteStudent,
    confirmDeleteStudent,
  };
};
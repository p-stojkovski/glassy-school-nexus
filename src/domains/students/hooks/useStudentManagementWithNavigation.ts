import { useNavigate } from 'react-router-dom';
import { Student } from '../studentsSlice';
import { useStudentManagement } from './useStudentManagement';

export const useStudentManagementWithNavigation = () => {
  const navigate = useNavigate();
  
  // Use the API-integrated student management hook
  const studentManagement = useStudentManagement();

  const handleAddStudent = () => {
    navigate('/students/new');
  };

  const handleEditStudent = (student: Student) => {
    navigate(`/students/edit/${student.id}`);
  };

  const handleViewStudent = (student: Student) => {
    navigate(`/students/${student.id}`);
  };

  return {
    ...studentManagement,
    // Override with navigation versions
    handleAddStudent,
    handleEditStudent,
    handleViewStudent,
  };
};

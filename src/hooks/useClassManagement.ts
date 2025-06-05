
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Class, setClasses, addClass, updateClass, deleteClass } from '../store/slices/classesSlice';
import { toast } from '../components/ui/use-toast';

interface UseClassManagementProps {
  searchTerm: string;
  subjectFilter: 'all' | 'English' | 'Mathematics' | 'Physics';
  levelFilter: 'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  statusFilter: 'all' | 'active' | 'inactive';
  showOnlyWithAvailableSlots: boolean;
}

export const useClassManagement = ({
  searchTerm,
  subjectFilter,
  levelFilter,
  statusFilter,
  showOnlyWithAvailableSlots
}: UseClassManagementProps) => {
  const dispatch = useDispatch();
  const { classes, loading } = useSelector((state: RootState) => state.classes);
  const { teachers } = useSelector((state: RootState) => state.teachers);
  const { classrooms } = useSelector((state: RootState) => state.classrooms);

  // Load mock data on component mount
  useEffect(() => {
    const mockClasses: Class[] = [
      {
        id: 'class-1',
        name: 'English Basics A1',
        teacher: { id: 'teacher-1', name: 'Sarah Johnson', subject: 'English', avatar: '/placeholder.svg' },
        students: 15,
        maxStudents: 20,
        room: 'Room 101',
        schedule: [
          { day: 'Monday', startTime: '09:00', endTime: '10:30' },
          { day: 'Wednesday', startTime: '09:00', endTime: '10:30' }
        ],
        status: 'active',
        subject: 'English',
        level: 'A1',
        price: 75,
        duration: 90,
        description: 'Basic English course for beginners',
        requirements: 'No previous English knowledge required',
        objectives: ['Learn basic vocabulary', 'Simple conversations', 'Basic grammar'],
        materials: ['Course book', 'Workbook', 'Audio materials'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'class-2',
        name: 'English Intermediate B1',
        teacher: { id: 'teacher-2', name: 'Michael Brown', subject: 'English', avatar: '/placeholder.svg' },
        students: 12,
        maxStudents: 18,
        room: 'Room 102',
        schedule: [
          { day: 'Tuesday', startTime: '11:00', endTime: '12:30' },
          { day: 'Thursday', startTime: '11:00', endTime: '12:30' }
        ],
        status: 'active',
        subject: 'English',
        level: 'B1',
        price: 85,
        duration: 90,
        description: 'Intermediate English course',
        requirements: 'A2 level English knowledge',
        objectives: ['Improve speaking skills', 'Advanced grammar', 'Reading comprehension'],
        materials: ['Course book', 'Workbook', 'Online resources'],
        createdAt: '2024-01-16T10:00:00Z',
        updatedAt: '2024-01-16T10:00:00Z'
      }
    ];
    dispatch(setClasses(mockClasses));
  }, [dispatch]);

  // Filter classes based on criteria
  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.teacher.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || classItem.subject === subjectFilter;
    const matchesLevel = levelFilter === 'all' || classItem.level === levelFilter;
    const matchesStatus = statusFilter === 'all' || classItem.status === statusFilter;
    const matchesAvailableSlots = !showOnlyWithAvailableSlots || classItem.students < classItem.maxStudents;

    return matchesSearch && matchesSubject && matchesLevel && matchesStatus && matchesAvailableSlots;
  });

  const handleCreateClass = async (data: any) => {
    try {
      const selectedTeacher = teachers.find(t => t.id === data.teacherId);
      const selectedClassroom = classrooms.find(c => c.id === data.classroomId);
      
      const newClass: Class = {
        id: `class-${Date.now()}`,
        name: data.name,
        teacher: selectedTeacher ? { 
          id: selectedTeacher.id, 
          name: selectedTeacher.name, 
          subject: selectedTeacher.subject,
          avatar: selectedTeacher.avatar
        } : { id: '', name: '', subject: '', avatar: '/placeholder.svg' },
        students: 0,
        maxStudents: 20,
        room: selectedClassroom?.name || '',
        schedule: data.schedule,
        status: data.status,
        subject: data.subject,
        level: 'A1',
        price: 75,
        duration: 90,
        description: '',
        requirements: '',
        objectives: [],
        materials: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dispatch(addClass(newClass));
      toast({
        title: "Class Created",
        description: `${newClass.name} has been created successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create class. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateClass = async (id: string, data: any) => {
    try {
      const selectedTeacher = teachers.find(t => t.id === data.teacherId);
      const selectedClassroom = classrooms.find(c => c.id === data.classroomId);
      
      const updatedClass: Partial<Class> = {
        name: data.name,
        teacher: selectedTeacher ? { 
          id: selectedTeacher.id, 
          name: selectedTeacher.name, 
          subject: selectedTeacher.subject,
          avatar: selectedTeacher.avatar
        } : undefined,
        room: selectedClassroom?.name || '',
        schedule: data.schedule,
        status: data.status,
        subject: data.subject,
        updatedAt: new Date().toISOString()
      };

      dispatch(updateClass({ id, updates: updatedClass }));
      toast({
        title: "Class Updated",
        description: "Class has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update class. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      dispatch(deleteClass(id));
      toast({
        title: "Class Deleted",
        description: "Class has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    classes,
    loading,
    filteredClasses,
    handleCreateClass,
    handleUpdateClass,
    handleDeleteClass
  };
};

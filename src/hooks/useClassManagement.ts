
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setClasses, addClass, updateClass, deleteClass, setLoading } from '../store/slices/classesSlice';
import { setTeachers } from '../store/slices/teachersSlice';
import { setStudents } from '../store/slices/studentsSlice';
import { setClassrooms } from '../store/slices/classroomsSlice';
import { Class } from '../store/slices/classesSlice';
import { ClassFormData } from '../components/classes/ClassForm';
import { toast } from '../components/ui/use-toast';

export const useClassManagement = () => {
  const dispatch = useDispatch();
  const { classes, loading } = useSelector((state: RootState) => state.classes);
  const { teachers } = useSelector((state: RootState) => state.teachers);
  const { students } = useSelector((state: RootState) => state.students);
  const { classrooms } = useSelector((state: RootState) => state.classrooms);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'English' | 'Mathematics' | 'Physics'>('all');
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [showClassForm, setShowClassForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showClassDetails, setShowClassDetails] = useState(false);

  // Mock data loading
  useEffect(() => {
    dispatch(setLoading(true));
    setTimeout(() => {
      // Load mock teachers
      const mockTeachers = [
        {
          id: 'teacher-1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@school.edu',
          phone: '+1-555-0101',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          subject: 'English',
          status: 'active' as const,
          joinDate: '2023-01-15',
          classIds: ['class-1'],
        },
        {
          id: 'teacher-2',
          name: 'Michael Brown',
          email: 'michael.brown@school.edu',
          phone: '+1-555-0102',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
          subject: 'Mathematics',
          status: 'active' as const,
          joinDate: '2023-02-20',
          classIds: ['class-2'],
        },
      ];
      dispatch(setTeachers(mockTeachers));

      // Load mock students
      const mockStudents = Array.from({ length: 30 }, (_, i) => ({
        id: `student-${i + 1}`,
        name: `Student ${i + 1}`,
        email: `student${i + 1}@school.edu`,
        phone: `+1-555-${(1000 + i).toString()}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Student${i + 1}`,
        classId: i < 12 ? 'class-1' : 'class-2',
        status: 'active' as const,
        joinDate: '2024-01-10',
        parentContact: `parent${i + 1}@email.com`,
        paymentDue: i % 5 === 0,
        lastPayment: '2024-01-01',
      }));
      dispatch(setStudents(mockStudents));

      // Load mock classrooms
      const mockClassrooms = [
        {
          id: '101',
          name: 'Room 101',
          location: 'Building A, First Floor',
          capacity: 30,
          status: 'active' as const,
          createdDate: '2024-01-01',
          lastUpdated: '2024-01-01',
        },
        {
          id: '102',
          name: 'Room 102',
          location: 'Building A, First Floor',
          capacity: 25,
          status: 'active' as const,
          createdDate: '2024-01-01',
          lastUpdated: '2024-01-01',
        },
      ];
      dispatch(setClassrooms(mockClassrooms));

      // Load mock classes
      const mockClasses: Class[] = [
        {
          id: 'class-1',
          name: 'English Basics A1',
          teacher: { ...mockTeachers[0], subject: 'English' },
          room: 'Room 101',
          schedule: [
            { day: 'Monday', startTime: '09:00', endTime: '10:30' },
            { day: 'Wednesday', startTime: '09:00', endTime: '10:30' },
          ],
          status: 'active',
          studentCount: 12,
          color: 'bg-blue-500',
        },
        {
          id: 'class-2',
          name: 'English Intermediate B1',
          teacher: { ...mockTeachers[1], subject: 'Mathematics' },
          room: 'Room 102',
          schedule: [
            { day: 'Tuesday', startTime: '14:00', endTime: '15:30' },
            { day: 'Thursday', startTime: '14:00', endTime: '15:30' },
          ],
          status: 'active',
          studentCount: 8,
          color: 'bg-green-500',
        },
      ];
      dispatch(setClasses(mockClasses));
      dispatch(setLoading(false));
    }, 1000);
  }, [dispatch]);

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.teacher.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || classItem.status === statusFilter;
    const matchesSubject = subjectFilter === 'all' || classItem.teacher.subject === subjectFilter;
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const handleCreateClass = (data: ClassFormData) => {
    const selectedTeacher = teachers.find(t => t.id === data.teacherId);
    const selectedClassroom = classrooms.find(c => c.id === data.classroomId);
    
    if (!selectedTeacher || !selectedClassroom) {
      toast({
        title: "Error",
        description: "Selected teacher or classroom not found.",
        variant: "destructive",
      });
      return;
    }

    const hasConflict = classes.some(existingClass => 
      data.schedule.some(newSlot =>
        existingClass.schedule.some(existingSlot =>
          existingSlot.day === newSlot.day &&
          ((newSlot.startTime >= existingSlot.startTime && newSlot.startTime < existingSlot.endTime) ||
           (newSlot.endTime > existingSlot.startTime && newSlot.endTime <= existingSlot.endTime)) &&
          (existingClass.teacher.id === data.teacherId || existingClass.room === selectedClassroom.name)
        )
      )
    );

    if (hasConflict) {
      toast({
        title: "Scheduling Conflict",
        description: "The selected teacher or classroom is already booked at this time.",
        variant: "destructive",
      });
      return;
    }

    const newClass: Class = {
      id: `class-${Date.now()}`,
      name: data.name,
      teacher: {
        id: selectedTeacher.id,
        name: selectedTeacher.name,
        avatar: selectedTeacher.avatar,
        subject: selectedTeacher.subject,
      },
      room: selectedClassroom.name,
      schedule: data.schedule,
      status: data.status,
      studentCount: data.studentIds.length,
      color: 'bg-purple-500',
    };

    dispatch(addClass(newClass));
    toast({
      title: "Class Created",
      description: `${data.name} has been successfully created.`,
    });
  };

  const handleEditClass = (data: ClassFormData) => {
    if (!editingClass) return;

    const selectedTeacher = teachers.find(t => t.id === data.teacherId);
    const selectedClassroom = classrooms.find(c => c.id === data.classroomId);
    
    if (!selectedTeacher || !selectedClassroom) {
      toast({
        title: "Error",
        description: "Selected teacher or classroom not found.",
        variant: "destructive",
      });
      return;
    }

    const updatedClass: Class = {
      ...editingClass,
      name: data.name,
      teacher: {
        id: selectedTeacher.id,
        name: selectedTeacher.name,
        avatar: selectedTeacher.avatar,
        subject: selectedTeacher.subject,
      },
      room: selectedClassroom.name,
      schedule: data.schedule,
      status: data.status,
      studentCount: data.studentIds.length,
    };

    dispatch(updateClass(updatedClass));
    setEditingClass(null);
    toast({
      title: "Class Updated",
      description: `${data.name} has been successfully updated.`,
    });
  };

  const handleDeleteClass = (classItem: Class) => {
    setClassToDelete(classItem);
  };

  const confirmDeleteClass = () => {
    if (classToDelete) {
      dispatch(deleteClass(classToDelete.id));
      toast({
        title: "Class Deleted",
        description: `${classToDelete.name} has been successfully deleted.`,
      });
      setClassToDelete(null);
    }
  };

  const handleViewDetails = (classItem: Class) => {
    setSelectedClass(classItem);
    setShowClassDetails(true);
  };

  const handleEditFromDetails = (classItem: Class) => {
    setSelectedClass(null);
    setShowClassDetails(false);
    setEditingClass(classItem);
    setShowClassForm(true);
  };

  const handleDeleteFromDetails = (classItem: Class) => {
    setSelectedClass(null);
    setShowClassDetails(false);
    handleDeleteClass(classItem);
  };

  return {
    // State
    classes,
    loading,
    filteredClasses,
    searchTerm,
    statusFilter,
    subjectFilter,
    classToDelete,
    showClassForm,
    editingClass,
    selectedClass,
    showClassDetails,
    teachers,
    students,
    classrooms,
    
    // Setters
    setSearchTerm,
    setStatusFilter,
    setSubjectFilter,
    setClassToDelete,
    setShowClassForm,
    setEditingClass,
    setSelectedClass,
    setShowClassDetails,
    
    // Handlers
    handleCreateClass,
    handleEditClass,
    handleDeleteClass,
    confirmDeleteClass,
    handleViewDetails,
    handleEditFromDetails,
    handleDeleteFromDetails,
  };
};

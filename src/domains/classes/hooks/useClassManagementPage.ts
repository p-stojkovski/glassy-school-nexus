import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import { Class, setClasses, deleteClass } from '../classesSlice';
import { ClassStatus } from '@/types/enums';
import { toast } from '@/hooks/use-toast';

export type SubjectFilter = 'all' | 'English' | 'Mathematics' | 'Physics';
export type LevelFilter = 'all' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type StatusFilter = 'all' | 'active' | 'inactive';

export const useClassManagementPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { classes, loading } = useAppSelector(
    (state: RootState) => state.classes
  );
  const { teachers } = useAppSelector((state: RootState) => state.teachers);
  const { classrooms } = useAppSelector((state: RootState) => state.classrooms);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showOnlyWithAvailableSlots, setShowOnlyWithAvailableSlots] =
    useState(false);
  // UI state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  // Mock data for demo mode - memoized to prevent useEffect dependency issues
  const mockClasses = useMemo<Class[]>(
    () => [
      {
        id: 'class-1',
        name: 'English Basics A1',
        teacher: {
          id: 'teacher-1',
          name: 'Sarah Johnson',
          subject: 'English',
          avatar: '/placeholder.svg',
        },
        room: 'Room A-101',
        roomId: 'room-1',
        schedule: [
          { day: 'Monday', startTime: '09:00', endTime: '10:30' },
          { day: 'Wednesday', startTime: '09:00', endTime: '10:30' },
          { day: 'Friday', startTime: '09:00', endTime: '10:30' },
        ],
        status: ClassStatus.Active,
        students: 15,
        maxStudents: 20,
        studentIds: [
          'student-1',
          'student-2',
          'student-3',
          'student-4',
          'student-5',
          'student-6',
          'student-7',
          'student-8',
          'student-9',
          'student-10',
          'student-11',
          'student-12',
          'student-13',
          'student-14',
          'student-15',
        ],
        subject: 'English',
        level: 'A1',
        price: 150,
        duration: 90,
        description: 'Basic English course for beginners',
        requirements: 'No prior experience required',
        objectives: [
          'Learn basic vocabulary',
          'Understand simple sentences',
          'Basic conversation skills',
        ],
        materials: ['Textbook', 'Workbook', 'Audio files'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: '#3B82F6',
      },
      {
        id: 'class-2',
        name: 'Mathematics Intermediate B1',
        teacher: {
          id: 'teacher-2',
          name: 'John Smith',
          subject: 'Mathematics',
          avatar: '/placeholder.svg',
        },
        room: 'Room B-205',
        roomId: 'room-2',
        schedule: [
          { day: 'Tuesday', startTime: '14:00', endTime: '15:30' },
          { day: 'Thursday', startTime: '14:00', endTime: '15:30' },
        ],
        status: ClassStatus.Active,
        students: 18,
        maxStudents: 25,
        studentIds: [
          'student-16',
          'student-17',
          'student-18',
          'student-19',
          'student-20',
          'student-21',
          'student-22',
          'student-23',
          'student-24',
          'student-25',
          'student-26',
          'student-27',
          'student-28',
          'student-29',
          'student-30',
          'student-31',
          'student-32',
          'student-33',
        ],
        subject: 'Mathematics',
        level: 'B1',
        price: 180,
        duration: 90,
        description: 'Intermediate mathematics covering algebra and geometry',
        requirements: 'Basic math knowledge required',
        objectives: [
          'Algebra fundamentals',
          'Geometric principles',
          'Problem-solving skills',
        ],
        materials: ['Mathematics textbook', 'Calculator', 'Graph paper'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: '#10B981',
      },
      {
        id: 'class-3',
        name: 'Physics Advanced C1',
        teacher: {
          id: 'teacher-3',
          name: 'Dr. Emily Davis',
          subject: 'Physics',
          avatar: '/placeholder.svg',
        },
        room: 'Room C-301',
        roomId: 'room-3',
        schedule: [
          { day: 'Monday', startTime: '16:00', endTime: '17:30' },
          { day: 'Wednesday', startTime: '16:00', endTime: '17:30' },
        ],
        status: ClassStatus.Active,
        students: 12,
        maxStudents: 15,
        studentIds: [
          'student-34',
          'student-35',
          'student-36',
          'student-37',
          'student-38',
          'student-39',
          'student-40',
          'student-41',
          'student-42',
          'student-43',
          'student-44',
          'student-45',
        ],
        subject: 'Physics',
        level: 'C1',
        price: 200,
        duration: 90,
        description: 'Advanced physics covering mechanics and thermodynamics',
        requirements: 'Strong mathematics background required',
        objectives: [
          'Classical mechanics',
          'Thermodynamics',
          'Laboratory skills',
        ],
        materials: ['Physics textbook', 'Lab manual', 'Safety equipment'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: '#8B5CF6',
      },
    ],
    []
  ); // Empty dependency array since this is static mock data

  // Mock data initialization
  useEffect(() => {
    if (classes.length === 0) {
      dispatch(setClasses(mockClasses));
    }
  }, [dispatch, classes.length, mockClasses]);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classes.filter((classItem) => {
      const matchesSearch =
        classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.teacher.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        classItem.subject.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubject =
        subjectFilter === 'all' || classItem.subject === subjectFilter;

      const matchesLevel =
        levelFilter === 'all' || classItem.level === levelFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' &&
          classItem.status === ClassStatus.Active) ||
        (statusFilter === 'inactive' &&
          classItem.status === ClassStatus.Inactive);

      const matchesAvailableSlots =
        !showOnlyWithAvailableSlots ||
        classItem.students < classItem.maxStudents;

      return (
        matchesSearch &&
        matchesSubject &&
        matchesLevel &&
        matchesStatus &&
        matchesAvailableSlots
      );
    });
  }, [
    classes,
    searchTerm,
    subjectFilter,
    levelFilter,
    statusFilter,
    showOnlyWithAvailableSlots,
  ]);

  // Handlers
  const handleAddClass = () => {
    navigate('/classes/new');
  };

  const handleEdit = (classItem: Class) => {
    navigate(`/classes/edit/${classItem.id}`);
  };

  const handleDelete = (classItem: Class) => {
    setClassToDelete(classItem);
    setShowDeleteDialog(true);
  };

  const handleView = (classItem: Class) => {
    // Handle view functionality - could navigate to class detail page
    console.log('Viewing class:', classItem);
  };

  const confirmDelete = async () => {
    if (classToDelete) {
      try {
        dispatch(deleteClass(classToDelete.id));
        toast({
          title: 'Class Deleted',
          description: `${classToDelete.name} has been successfully deleted.`,
          variant: 'default',
        });
        setShowDeleteDialog(false);
        setClassToDelete(null);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete class. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFilterChange = (type: string, value: string) => {
    switch (type) {
      case 'subject':
        if (
          value === 'all' ||
          value === 'English' ||
          value === 'Mathematics' ||
          value === 'Physics'
        ) {
          setSubjectFilter(value as SubjectFilter);
        }
        break;
      case 'level':
        if (
          value === 'all' ||
          value === 'A1' ||
          value === 'A2' ||
          value === 'B1' ||
          value === 'B2' ||
          value === 'C1' ||
          value === 'C2'
        ) {
          setLevelFilter(value as LevelFilter);
        }
        break;
      case 'status':
        if (value === 'all' || value === 'active' || value === 'inactive') {
          setStatusFilter(value as StatusFilter);
        }
        break;
      case 'availableSlots':
        setShowOnlyWithAvailableSlots(value === 'true');
        break;
    }
  };

  const handleResetDemo = () => {
    dispatch(setClasses(mockClasses));
    toast({
      title: 'Demo Data Reset',
      description: 'Class data has been reset to default values.',
      variant: 'default',
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSubjectFilter('all');
    setLevelFilter('all');
    setStatusFilter('all');
    setShowOnlyWithAvailableSlots(false);
  };

  const hasFilters =
    searchTerm !== '' ||
    subjectFilter !== 'all' ||
    levelFilter !== 'all' ||
    statusFilter !== 'all' ||
    showOnlyWithAvailableSlots;

  return {
    // Data
    classes,
    filteredClasses,
    loading,
    teachers,
    classrooms,

    // Filter state
    searchTerm,
    setSearchTerm,
    subjectFilter,
    setSubjectFilter,
    levelFilter,
    setLevelFilter,
    statusFilter,
    setStatusFilter,
    showOnlyWithAvailableSlots,
    setShowOnlyWithAvailableSlots,
    hasFilters,
    clearFilters,

    // UI state
    showDeleteDialog,
    setShowDeleteDialog,
    classToDelete,

    // Handlers
    handleAddClass,
    handleEdit,
    handleDelete,
    handleView,
    confirmDelete,
    handleFilterChange,
    handleResetDemo,
  };
};

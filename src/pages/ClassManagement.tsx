
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Search, Filter, BookOpen, Eye } from 'lucide-react';
import { RootState } from '../store';
import { setClasses, addClass, updateClass, deleteClass, setLoading } from '../store/slices/classesSlice';
import { setTeachers } from '../store/slices/teachersSlice';
import { setStudents } from '../store/slices/studentsSlice';
import { setClassrooms } from '../store/slices/classroomsSlice';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import GlassCard from '../components/common/GlassCard';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ClassForm, { ClassFormData } from '../components/classes/ClassForm';
import ClassDetails from '../components/classes/ClassDetails';
import { Class } from '../store/slices/classesSlice';
import { toast } from '../components/ui/use-toast';

const ClassManagement: React.FC = () => {
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
          teacher: mockTeachers[0],
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
          teacher: mockTeachers[1],
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
    // Find selected teacher and classroom
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

    // Validate scheduling conflicts
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
      teacher: selectedTeacher,
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
      teacher: selectedTeacher,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Class Management</h1>
          <p className="text-white/70">Manage classes, schedules, and assignments</p>
        </div>
        <Button 
          onClick={() => setShowClassForm(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Class
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <Input
              placeholder="Search classes by name or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
          <div className="sm:w-48">
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive' | 'pending') => setStatusFilter(value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:w-48">
            <Select value={subjectFilter} onValueChange={(value: 'all' | 'English' | 'Mathematics' | 'Physics') => setSubjectFilter(value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Classes Found</h3>
          <p className="text-white/60 mb-6">
            {searchTerm || statusFilter !== 'all' || subjectFilter !== 'all'
              ? 'No classes match your current search criteria.' 
              : 'Start by creating your first class.'}
          </p>
          {(!searchTerm && statusFilter === 'all' && subjectFilter === 'all') && (
            <Button 
              onClick={() => setShowClassForm(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Class
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <GlassCard key={classItem.id} className="p-6 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-3 h-3 rounded-full ${classItem.color}`}></div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewDetails(classItem)}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingClass(classItem);
                      setShowClassForm(true);
                    }}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteClass(classItem)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    Delete
                  </Button>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">{classItem.name}</h3>
              <p className="text-white/70 mb-4">Teacher: {classItem.teacher.name}</p>
              <p className="text-white/70 mb-4">Room: {classItem.room}</p>
              <p className="text-white/70 mb-4">Students: {classItem.studentCount}</p>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-white">Schedule:</p>
                {classItem.schedule.map((schedule, index) => (
                  <p key={index} className="text-sm text-white/70">
                    {schedule.day}: {schedule.startTime} - {schedule.endTime}
                  </p>
                ))}
              </div>
              
              <div className="mt-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  classItem.status === 'active' 
                    ? 'bg-green-500/20 text-green-300' 
                    : classItem.status === 'inactive'
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {classItem.status}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Class Form Dialog */}
      <ClassForm
        open={showClassForm}
        onOpenChange={(open) => {
          setShowClassForm(open);
          if (!open) setEditingClass(null);
        }}
        onSubmit={editingClass ? handleEditClass : handleCreateClass}
        editingClass={editingClass}
      />

      {/* Class Details Dialog */}
      <ClassDetails
        classItem={selectedClass}
        open={showClassDetails}
        onOpenChange={setShowClassDetails}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteFromDetails}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!classToDelete}
        onOpenChange={() => setClassToDelete(null)}
        title="Delete Class"
        description={`Are you sure you want to delete ${classToDelete?.name}? This action cannot be undone.`}
        onConfirm={confirmDeleteClass}
      />
    </div>
  );
};

export default ClassManagement;


import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Search, Filter, Users } from 'lucide-react';
import { RootState } from '../store';
import { setStudents, addStudent, updateStudent, deleteStudent, setLoading } from '../store/slices/studentsSlice';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import GlassCard from '../components/common/GlassCard';
import StudentCard from '../components/students/StudentCard';
import StudentForm from '../components/students/StudentForm';
import { Student } from '../store/slices/studentsSlice';
import { toast } from '../components/ui/use-toast';

const StudentManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { students, loading } = useSelector((state: RootState) => state.students);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    dispatch(setLoading(true));
    setTimeout(() => {
      const mockStudents: Student[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice.johnson@email.com',
          phone: '+1-555-0123',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
          classId: 'class-1',
          status: 'active',
          joinDate: '2024-01-15',
          parentContact: 'Mary Johnson - +1-555-0124',
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob.smith@email.com',
          phone: '+1-555-0125',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
          classId: 'class-2',
          status: 'active',
          joinDate: '2024-02-01',
          parentContact: 'John Smith - +1-555-0126',
        },
        {
          id: '3',
          name: 'Carol Davis',
          email: 'carol.davis@email.com',
          phone: '+1-555-0127',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
          classId: 'class-1',
          status: 'inactive',
          joinDate: '2023-11-20',
          parentContact: 'Linda Davis - +1-555-0128',
        }
      ];
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
    // In a real app, you would check for dependencies first
    dispatch(deleteStudent(student.id));
    toast({
      title: "Student Deleted",
      description: `${student.name} has been successfully deleted.`,
    });
  };

  const handleViewStudent = (student: Student) => {
    // Handle viewing student details
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
          <h1 className="text-3xl font-bold text-white mb-2">Student Management</h1>
          <p className="text-white/70">Manage student profiles and information</p>
        </div>
        <Button 
          onClick={handleAddStudent}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <Input
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
          <div className="sm:w-48">
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Students Found</h3>
          <p className="text-white/60 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'No students match your current search criteria.' 
              : 'Start by adding your first student to the system.'}
          </p>
          {(!searchTerm && statusFilter === 'all') && (
            <Button 
              onClick={handleAddStudent}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Student
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onEdit={() => handleEditStudent(student)}
              onDelete={() => handleDeleteStudent(student)}
              onView={() => handleViewStudent(student)}
            />
          ))}
        </div>
      )}

      {/* Student Form Sidebar */}
      <Sheet open={isFormOpen} onOpenChange={handleCloseForm}>
        <SheetContent 
          side="right" 
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto"
        >
          <SheetHeader className="pb-6 border-b border-white/20">
            <SheetTitle className="text-2xl font-bold text-white">
              {selectedStudent ? 'Edit Student' : 'Add New Student'}
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6">
            <StudentForm
              student={selectedStudent}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default StudentManagement;

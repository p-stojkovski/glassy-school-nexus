
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Search, Filter, Users } from 'lucide-react';
import { RootState } from '../store';
import { setTeachers, setLoading } from '../store/slices/teachersSlice';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import GlassCard from '../components/common/GlassCard';
import TeacherCard from '../components/teachers/TeacherCard';
import TeacherForm from '../components/teachers/TeacherForm';
import { Teacher } from '../store/slices/teachersSlice';

const Teachers: React.FC = () => {
  const dispatch = useDispatch();
  const { teachers, loading } = useSelector((state: RootState) => state.teachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    dispatch(setLoading(true));
    setTimeout(() => {
      const mockTeachers: Teacher[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@thinkenglish.com',
          phone: '+1 (555) 123-4567',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          subject: 'Grammar & Writing',
          status: 'active',
          joinDate: '2023-01-15',
          classIds: ['class1', 'class2']
        },
        {
          id: '2',
          name: 'Michael Chen',
          email: 'michael.chen@thinkenglish.com',
          phone: '+1 (555) 234-5678',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          subject: 'Conversation & Speaking',
          status: 'active',
          joinDate: '2023-03-22',
          classIds: ['class3']
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          email: 'emily.rodriguez@thinkenglish.com',
          phone: '+1 (555) 345-6789',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          subject: 'Reading & Comprehension',
          status: 'inactive',
          joinDate: '2022-09-10',
          classIds: []
        }
      ];
      dispatch(setTeachers(mockTeachers));
      dispatch(setLoading(false));
    }, 1000);
  }, [dispatch]);

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setIsFormOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTeacher(null);
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
          <h1 className="text-3xl font-bold text-white mb-2">Teacher Management</h1>
          <p className="text-white/70">Manage teacher profiles and information</p>
        </div>        <Button 
          onClick={handleAddTeacher}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Teacher
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <Input
              placeholder="Search teachers by name, email, or subject..."
              value={searchTerm}              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60"
            />
          </div>
          <div className="sm:w-48">
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
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

      {/* Teachers Grid */}
      {filteredTeachers.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Teachers Found</h3>
          <p className="text-white/60 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'No teachers match your current search criteria.' 
              : 'Start by adding your first teacher to the system.'}
          </p>          {(!searchTerm && statusFilter === 'all') && (
            <Button 
              onClick={handleAddTeacher}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Teacher
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onEdit={() => handleEditTeacher(teacher)}
            />
          ))}
        </div>
      )}

      {/* Teacher Form Modal */}
      {isFormOpen && (
        <TeacherForm
          teacher={selectedTeacher}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Teachers;

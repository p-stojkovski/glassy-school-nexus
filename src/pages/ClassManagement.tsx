
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Search, Filter, BookOpen } from 'lucide-react';
import { RootState } from '../store';
import { setClasses, addClass, updateClass, deleteClass, setLoading } from '../store/slices/classesSlice';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import GlassCard from '../components/common/GlassCard';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Class } from '../store/slices/classesSlice';
import { toast } from '../components/ui/use-toast';

const ClassManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { classes, loading } = useSelector((state: RootState) => state.classes);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  // Mock data for classes
  useEffect(() => {
    dispatch(setLoading(true));
    setTimeout(() => {
      const mockClasses: Class[] = [
        {
          id: 'class-1',
          name: 'English Basics A1',
          teacher: {
            id: 'teacher-1',
            name: 'Sarah Johnson',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          },
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
          teacher: {
            id: 'teacher-2',
            name: 'Michael Brown',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
          },
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
    return matchesSearch && matchesStatus;
  });

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
        </div>
      </GlassCard>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Classes Found</h3>
          <p className="text-white/60 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'No classes match your current search criteria.' 
              : 'Start by creating your first class.'}
          </p>
          {(!searchTerm && statusFilter === 'all') && (
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
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

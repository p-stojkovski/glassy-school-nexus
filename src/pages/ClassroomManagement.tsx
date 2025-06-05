
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Search, Filter, Building } from 'lucide-react';
import { RootState } from '../store';
import { setClassrooms, addClassroom, updateClassroom, setLoading } from '../store/slices/classroomsSlice';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import GlassCard from '../components/common/GlassCard';
import ClassroomCard from '../components/classrooms/ClassroomCard';
import ClassroomForm from '../components/classrooms/ClassroomForm';
import { Classroom } from '../store/slices/classroomsSlice';
import { toast } from '../components/ui/use-toast';

const ClassroomManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { classrooms, loading } = useSelector((state: RootState) => state.classrooms);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    dispatch(setLoading(true));
    setTimeout(() => {
      const mockClassrooms: Classroom[] = [
        {
          id: '1',
          name: 'Room A-101',
          location: 'Building A, First Floor',
          capacity: 30,
          status: 'active',
          equipment: ['Projector', 'Whiteboard', 'Audio System'],
          schedule: []
        },
        {
          id: '2',
          name: 'Room B-205',
          location: 'Building B, Second Floor',
          capacity: 25,
          status: 'active',
          equipment: ['Smart Board', 'Computer', 'Audio System'],
          schedule: []
        },
        {
          id: '3',
          name: 'Room C-301',
          location: 'Building C, Third Floor',
          capacity: 35,
          status: 'maintenance',
          equipment: ['Projector', 'Whiteboard'],
          schedule: []
        }
      ];
      dispatch(setClassrooms(mockClassrooms));
      dispatch(setLoading(false));
    }, 1000);
  }, [dispatch]);

  const filteredClassrooms = classrooms.filter(classroom => {
    const matchesSearch = classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classroom.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || classroom.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddClassroom = () => {
    setSelectedClassroom(null);
    setIsFormOpen(true);
  };

  const handleEditClassroom = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedClassroom(null);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedClassroom) {
        dispatch(updateClassroom({ id: selectedClassroom.id, ...data }));
        toast({
          title: "Classroom Updated",
          description: `${data.name} has been successfully updated.`,
        });
      } else {
        const newClassroom: Classroom = {
          id: Date.now().toString(),
          ...data,
          equipment: [],
          schedule: [],
        };
        dispatch(addClassroom(newClassroom));
        toast({
          title: "Classroom Added",
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
          <h1 className="text-3xl font-bold text-white mb-2">Classroom Management</h1>
          <p className="text-white/70">Manage classroom information and availability</p>
        </div>
        <Button 
          onClick={handleAddClassroom}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Classroom
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <Input
              placeholder="Search classrooms by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
          <div className="sm:w-48">
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive' | 'maintenance') => setStatusFilter(value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>

      {/* Classrooms Grid */}
      {filteredClassrooms.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Building className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Classrooms Found</h3>
          <p className="text-white/60 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'No classrooms match your current search criteria.' 
              : 'Start by adding your first classroom to the system.'}
          </p>
          {(!searchTerm && statusFilter === 'all') && (
            <Button 
              onClick={handleAddClassroom}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add First Classroom
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map((classroom) => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              onEdit={() => handleEditClassroom(classroom)}
            />
          ))}
        </div>
      )}

      {/* Classroom Form Sidebar */}
      <Sheet open={isFormOpen} onOpenChange={handleCloseForm}>
        <SheetContent 
          side="right" 
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto"
        >
          <SheetHeader className="pb-6 border-b border-white/20">
            <SheetTitle className="text-2xl font-bold text-white">
              {selectedClassroom ? 'Edit Classroom' : 'Add New Classroom'}
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6">
            <ClassroomForm
              classroom={selectedClassroom}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ClassroomManagement;


import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { RootState } from '../store';
import { 
  setClassrooms, 
  addClassroom, 
  updateClassroom, 
  deleteClassroom, 
  setSelectedClassroom, 
  setLoading,
  setSearchQuery,
  setFilterBy
} from '../store/slices/classroomsSlice';
import { addNotification } from '../store/slices/uiSlice';
import classroomService from '../services/classroomService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import GlassCard from '../components/common/GlassCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ClassroomForm from '../components/classrooms/ClassroomForm';
import ClassroomCard from '../components/classrooms/ClassroomCard';
import { Classroom } from '../store/slices/classroomsSlice';

const ClassroomManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { classrooms, loading, searchQuery, filterBy } = useSelector((state: RootState) => state.classrooms);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [deletingClassroom, setDeletingClassroom] = useState<Classroom | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    try {
      dispatch(setLoading(true));
      const classroomsData = await classroomService.getClassrooms();
      dispatch(setClassrooms(classroomsData));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to load classrooms. Please try again.',
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const filteredClassrooms = useMemo(() => {
    let filtered = classrooms;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(classroom =>
        classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classroom.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(classroom => classroom.status === filterBy);
    }

    return filtered;
  }, [classrooms, searchQuery, filterBy]);

  const handleAddClassroom = () => {
    setEditingClassroom(null);
    setIsFormOpen(true);
  };

  const handleEditClassroom = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    setIsFormOpen(true);
  };

  const handleSubmitClassroom = async (formData: any) => {
    try {
      setIsSubmitting(true);
      
      if (editingClassroom) {
        // Update existing classroom
        const updatedClassroom = await classroomService.updateClassroom({
          ...editingClassroom,
          ...formData,
        });
        dispatch(updateClassroom(updatedClassroom));
        dispatch(addNotification({
          type: 'success',
          message: 'Classroom updated successfully!',
        }));
      } else {
        // Add new classroom
        const newClassroom = await classroomService.addClassroom(formData);
        dispatch(addClassroom(newClassroom));
        dispatch(addNotification({
          type: 'success',
          message: 'Classroom added successfully!',
        }));
      }
      
      setIsFormOpen(false);
      setEditingClassroom(null);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to save classroom. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClassroom = async (classroom: Classroom) => {
    setDeletingClassroom(classroom);
  };

  const confirmDeleteClassroom = async () => {
    if (!deletingClassroom) return;

    try {
      // Check if classroom has upcoming classes
      const usage = await classroomService.checkClassroomUsage(deletingClassroom.id);
      
      if (usage.hasUpcomingClasses) {
        dispatch(addNotification({
          type: 'warning',
          message: `Cannot delete classroom. It has ${usage.classCount} upcoming classes scheduled.`,
        }));
        setDeletingClassroom(null);
        return;
      }

      await classroomService.deleteClassroom(deletingClassroom.id);
      dispatch(deleteClassroom(deletingClassroom.id));
      dispatch(addNotification({
        type: 'success',
        message: 'Classroom deleted successfully!',
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to delete classroom. Please try again.',
      }));
    } finally {
      setDeletingClassroom(null);
    }
  };

  const handleViewClassroom = (classroom: Classroom) => {
    dispatch(setSelectedClassroom(classroom));
    // Navigate to classroom details view (implementation depends on routing)
    console.log('View classroom details:', classroom);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Classroom Management</h1>
          <p className="text-white/70">Manage school classrooms and their details</p>
        </div>
        <Button
          onClick={handleAddClassroom}
          className="bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Classroom
        </Button>
      </div>

      {/* Filters and Search */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <Input
              placeholder="Search by classroom name or location..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <Select
              value={filterBy}
              onValueChange={(value) => dispatch(setFilterBy(value as any))}
            >
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{classrooms.length}</div>
            <div className="text-white/70">Total Classrooms</div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-300">
              {classrooms.filter(c => c.status === 'active').length}
            </div>
            <div className="text-white/70">Active</div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-300">
              {classrooms.filter(c => c.status === 'maintenance').length}
            </div>
            <div className="text-white/70">Maintenance</div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {classrooms.reduce((sum, c) => sum + c.capacity, 0)}
            </div>
            <div className="text-white/70">Total Capacity</div>
          </div>
        </GlassCard>
      </div>

      {/* Classrooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredClassrooms.map((classroom) => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              onEdit={handleEditClassroom}
              onDelete={handleDeleteClassroom}
              onView={handleViewClassroom}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredClassrooms.length === 0 && (
        <GlassCard className="p-12 text-center">
          <div className="text-white/70">
            {searchQuery || filterBy !== 'all' 
              ? 'No classrooms match your search criteria.'
              : 'No classrooms found. Add your first classroom to get started.'}
          </div>
        </GlassCard>
      )}

      {/* Add/Edit Classroom Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-gray-900/95 border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingClassroom ? 'Edit Classroom' : 'Add New Classroom'}
            </DialogTitle>
          </DialogHeader>
          <ClassroomForm
            classroom={editingClassroom || undefined}
            onSubmit={handleSubmitClassroom}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingClassroom(null);
            }}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingClassroom} onOpenChange={() => setDeletingClassroom(null)}>
        <AlertDialogContent className="bg-gray-900/95 border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Classroom</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete "{deletingClassroom?.name}"? This action cannot be undone.
              We'll check if this classroom has any upcoming scheduled classes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteClassroom}
              className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassroomManagement;

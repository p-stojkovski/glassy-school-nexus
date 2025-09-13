import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import SettingsTable, { SettingsTableColumn } from '../shared/SettingsTable';
import SubjectForm from '../forms/SubjectForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import subjectApiService, { Subject } from '@/services/subjectApiService';
import { toast } from 'sonner';

const SubjectSettingsTab: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectApiService.getAll();
      setSubjects(data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error: any) {
      toast.error('Failed to load subjects: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const clearRelatedCache = () => {
    localStorage.removeItem('think-english-subjects');
  };

  const handleAddSubject = () => {
    setSelectedSubject(null);
    setIsFormOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsFormOpen(true);
  };

  const handleDeleteSubject = (subject: Subject) => {
    setSubjectToDelete(subject);
    setIsConfirmOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSubject(null);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedSubject) {
        await subjectApiService.update(selectedSubject.id, {
          key: data.key,
          name: data.name,
          sortOrder: data.sortOrder,
        });
        toast.success('Subject updated successfully');
      } else {
        await subjectApiService.create({
          key: data.key,
          name: data.name,
          sortOrder: data.sortOrder,
        });
        toast.success('Subject created successfully');
      }
      clearRelatedCache();
      handleCloseForm();
      loadSubjects();
    } catch (error: any) {
      if (error.status === 409) {
        toast.error('Subject with this key already exists');
      } else {
        toast.error('Failed to save subject: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return;
    
    try {
      await subjectApiService.delete(subjectToDelete.id);
      toast.success('Subject deleted successfully');
      clearRelatedCache();
      loadSubjects();
    } catch (error: any) {
      if (error.status === 409) {
        toast.error('Cannot delete subject: it is currently in use');
      } else {
        toast.error('Failed to delete subject: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setSubjectToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  // Define columns for the subject table
  const columns: SettingsTableColumn[] = [
    {
      key: 'name',
      label: 'Subject Name',
      width: '30%',
    },
    {
      key: 'key',
      label: 'Key',
      width: '20%',
      render: (key: string) => (
        <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          {key}
        </Badge>
      ),
    },
    {
      key: 'sortOrder',
      label: 'Order',
      width: '15%',
    },
    {
      key: 'isActive',
      label: 'Status',
      width: '20%',
      render: (isActive: boolean) => (
        <Badge 
          variant={isActive ? 'default' : 'secondary'} 
          className={isActive 
            ? 'bg-green-500/20 text-green-300 border-green-500/30' 
            : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
          }
        >
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <SettingsTable
        title="Subjects"
        description="Manage available subjects and their configuration"
        columns={columns}
        data={subjects}
        onAdd={handleAddSubject}
        onEdit={handleEditSubject}
        onDelete={handleDeleteSubject}
        addButtonText="Add Subject"
        emptyStateTitle="No Subjects Found"
        emptyStateDescription="Start by adding your first subject to the system."
        isLoading={loading}
      />

      {/* Subject Form Sidebar */}
      <Sheet open={isFormOpen} onOpenChange={handleCloseForm}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto glass-scrollbar"
        >
          <SheetHeader className="pb-6 border-b border-white/20">
            <SheetTitle className="text-2xl font-bold text-white">
              {selectedSubject ? 'Edit Subject' : 'Add New Subject'}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <SubjectForm
              subject={selectedSubject}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmDeleteSubject}
        title="Delete Subject"
        description={
          subjectToDelete
            ? `Are you sure you want to delete ${subjectToDelete.name}? This action cannot be undone and may affect existing classes and teachers.`
            : 'Are you sure you want to delete this subject?'
        }
      />
    </>
  );
};

export default SubjectSettingsTab;


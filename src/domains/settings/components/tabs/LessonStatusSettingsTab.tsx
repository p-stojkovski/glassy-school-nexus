import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import SettingsTable, { SettingsTableColumn } from '../shared/SettingsTable';
import LessonStatusForm, { LessonStatusFormData } from '../forms/LessonStatusForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import lessonStatusApiService, { LessonStatus } from '@/services/lessonStatusApiService';
import { LessonStatusColors } from '@/types/api/lesson';
import { toast } from 'sonner';

const LessonStatusSettingsTab: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLessonStatus, setSelectedLessonStatus] = useState<LessonStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonStatuses, setLessonStatuses] = useState<LessonStatus[]>([]);

  useEffect(() => {
    loadLessonStatuses();
  }, []);

  const loadLessonStatuses = async () => {
    try {
      setLoading(true);
      const data = await lessonStatusApiService.getAll();
      // Sort by predefined order: Scheduled, Conducted, Cancelled, Make Up, No Show
      const statusOrder = ['Scheduled', 'Conducted', 'Cancelled', 'Make Up', 'No Show'];
      setLessonStatuses(data.sort((a, b) => 
        statusOrder.indexOf(a.name) - statusOrder.indexOf(b.name)
      ));
    } catch (error: any) {
      toast.error('Failed to load lesson statuses: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditLessonStatus = (lessonStatus: LessonStatus) => {
    setSelectedLessonStatus(lessonStatus);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedLessonStatus(null);
  };

  const handleSubmit = async (data: LessonStatusFormData) => {
    if (!selectedLessonStatus) return;
    
    try {
      await lessonStatusApiService.update(selectedLessonStatus.id, {
        description: data.description || null,
      });
      toast.success('Lesson status description updated successfully');
      handleCloseForm();
      loadLessonStatuses();
    } catch (error: any) {
      toast.error('Failed to update lesson status: ' + (error.message || 'Unknown error'));
    }
  };


  // Get color class for status
  const getStatusColorClass = (statusName: string) => {
    const colorMap = {
      'Scheduled': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Conducted': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Cancelled': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Make Up': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'No Show': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    };
    return colorMap[statusName as keyof typeof colorMap] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  // Define columns for the lesson status table
  const columns: SettingsTableColumn[] = [
    {
      key: 'name',
      label: 'Status Name',
      width: '30%',
      render: (name: string) => (
        <Badge variant="outline" className={getStatusColorClass(name)}>
          {name}
        </Badge>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      width: '60%',
      render: (description: string | null) => (
        <span className="text-white/80">
          {description || <span className="text-white/50 italic">No description</span>}
        </span>
      ),
    }
  ];

  return (
    <>
      <SettingsTable
        title="Lesson Statuses"
        description="Predefined lesson statuses for tracking lesson progress. Only descriptions can be edited."
        columns={columns}
        data={lessonStatuses}
        onEdit={handleEditLessonStatus}
        emptyStateTitle="No Lesson Statuses Found"
        emptyStateDescription="Lesson statuses are predefined by the system."
        isLoading={loading}
        hideAddButton={true}
        hideDeleteButton={true}
      />

      {/* Lesson Status Form Sidebar */}
      <Sheet open={isFormOpen} onOpenChange={handleCloseForm}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto glass-scrollbar"
        >
          <SheetHeader className="pb-6 border-b border-white/20">
            <SheetTitle className="text-2xl font-bold text-white">
              Edit Lesson Status Description
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            {selectedLessonStatus && (
              <LessonStatusForm
                lessonStatus={selectedLessonStatus}
                onSubmit={handleSubmit}
                onCancel={handleCloseForm}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default LessonStatusSettingsTab;

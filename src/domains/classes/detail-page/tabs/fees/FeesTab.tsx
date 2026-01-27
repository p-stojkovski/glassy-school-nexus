import React from 'react';
import { Plus, CircleX, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { ClassBasicInfoResponse } from '@/types/api/class';
import { useFeeTemplates } from '../../hooks/useFeeTemplates';
import { FeeTemplatesTable } from './components/FeeTemplatesTable';
import { CreateFeeTemplateSheet } from './dialogs/CreateFeeTemplateSheet';
import { EditFeeTemplateDialog } from './dialogs/EditFeeTemplateDialog';
import { DeleteFeeTemplateDialog } from './dialogs/DeleteFeeTemplateDialog';

interface FeesTabProps {
  classData: ClassBasicInfoResponse;
  isActive: boolean;
}

const FeesTab: React.FC<FeesTabProps> = ({ classData, isActive }) => {
  const {
    feeTemplates,
    loading,
    error,
    hasFetched,
    refetch,
    // Dialog state
    showCreateSheet,
    showEditDialog,
    showDeleteDialog,
    selectedTemplate,
    openCreateSheet,
    openEditDialog,
    openDeleteDialog,
    closeDialogs,
    // CRUD handlers
    handleCreateTemplate,
    handleUpdateTemplate,
    handleDeleteTemplate,
    createLoading,
    updateLoading,
    deleteLoading,
  } = useFeeTemplates({
    classId: classData.id,
    isActive,
  });

  if (loading && !hasFetched) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Error Loading Fee Templates"
        message={error}
        onRetry={refetch}
        showRetry
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Fee Templates Section */}
      <div className="border border-white/10 rounded-lg bg-white/[0.02]">
        {/* Section Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-white/70" />
            <h3 className="text-lg font-semibold text-white">Fee Templates</h3>
          </div>
          <Button
            onClick={openCreateSheet}
            size="default"
            variant="outline"
            className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Template
          </Button>
        </div>

        {/* Content */}
        {feeTemplates.length === 0 ? (
          <div className="flex flex-col items-center text-center py-12 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
              <CircleX className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Fee Templates</h3>
            <p className="text-white/70 mb-6 max-w-md">
              Fee templates define the fees charged to students in this class.
              Add your first template to start tracking tuition, materials, and other fees.
            </p>
            <Button
              onClick={openCreateSheet}
              size="default"
              variant="outline"
              className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Template
            </Button>
          </div>
        ) : (
          <FeeTemplatesTable
            templates={feeTemplates}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
          />
        )}
      </div>

      {/* Future sections placeholder */}
      {/* Obligations section will be added in Story 02 */}
      {/* Summary card will be added in Story 04 */}

      {/* Dialogs */}
      <CreateFeeTemplateSheet
        open={showCreateSheet}
        onOpenChange={closeDialogs}
        onSubmit={handleCreateTemplate}
        isSubmitting={createLoading}
      />

      <EditFeeTemplateDialog
        open={showEditDialog}
        onOpenChange={closeDialogs}
        template={selectedTemplate}
        onSubmit={handleUpdateTemplate}
        isSubmitting={updateLoading}
      />

      <DeleteFeeTemplateDialog
        open={showDeleteDialog}
        onOpenChange={closeDialogs}
        template={selectedTemplate}
        onConfirm={handleDeleteTemplate}
        isDeleting={deleteLoading}
      />
    </div>
  );
};

export default FeesTab;

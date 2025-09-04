import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import SettingsTable, { SettingsTableColumn } from '../shared/SettingsTable';
import DiscountTypeForm from '../forms/DiscountTypeForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import discountTypeApiService, { DiscountType } from '@/services/discountTypeApiService';
import { toast } from 'sonner';

const DiscountTypeSettingsTab: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedDiscountType, setSelectedDiscountType] = useState<DiscountType | null>(null);
  const [discountTypeToDelete, setDiscountTypeToDelete] = useState<DiscountType | null>(null);
  const [discountTypes, setDiscountTypes] = useState<DiscountType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiscountTypes();
  }, []);

  const loadDiscountTypes = async () => {
    try {
      setLoading(true);
      const data = await discountTypeApiService.getAll();
      setDiscountTypes(data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error: any) {
      toast.error('Failed to load discount types: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const clearRelatedCache = () => {
    // Clear localStorage items that depend on discount types data
    localStorage.removeItem('think-english-discount-types');
    localStorage.removeItem('think-english-subjects');
  };

  const handleAddDiscountType = () => {
    setSelectedDiscountType(null);
    setIsFormOpen(true);
  };

  const handleEditDiscountType = (discountType: DiscountType) => {
    setSelectedDiscountType(discountType);
    setIsFormOpen(true);
  };

  const handleDeleteDiscountType = (discountType: DiscountType) => {
    setDiscountTypeToDelete(discountType);
    setIsConfirmOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedDiscountType(null);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedDiscountType) {
        await discountTypeApiService.update(selectedDiscountType.id, {
          key: data.key,
          name: data.name,
          description: data.description,
          requiresAmount: data.requiresAmount,
          sortOrder: data.sortOrder,
        });
        toast.success('Discount type updated successfully');
      } else {
        await discountTypeApiService.create({
          key: data.key,
          name: data.name,
          description: data.description,
          requiresAmount: data.requiresAmount,
          sortOrder: data.sortOrder,
        });
        toast.success('Discount type created successfully');
      }
      clearRelatedCache();
      handleCloseForm();
      loadDiscountTypes();
    } catch (error: any) {
      if (error.status === 409) {
        toast.error('Discount type with this key already exists');
      } else {
        toast.error('Failed to save discount type: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const confirmDeleteDiscountType = async () => {
    if (!discountTypeToDelete) return;
    
    try {
      await discountTypeApiService.delete(discountTypeToDelete.id);
      toast.success('Discount type deleted successfully');
      clearRelatedCache();
      loadDiscountTypes();
    } catch (error: any) {
      if (error.status === 409) {
        toast.error('Cannot delete discount type: it is currently in use by students');
      } else {
        toast.error('Failed to delete discount type: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setDiscountTypeToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  // Define columns for the discount type table
  const columns: SettingsTableColumn[] = [
    {
      key: 'name',
      label: 'Name',
      width: '25%',
    },
    {
      key: 'key',
      label: 'Key',
      width: '15%',
      render: (key: string) => (
        <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
          {key}
        </Badge>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      width: '35%',
    },
    {
      key: 'requiresAmount',
      label: 'Requires Amount',
      width: '15%',
      render: (requiresAmount: boolean) => (
        <Badge 
          variant={requiresAmount ? 'default' : 'secondary'} 
          className={requiresAmount 
            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' 
            : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
          }
        >
          {requiresAmount ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      width: '10%',
      render: (isActive: boolean) => (
        <Badge 
          variant={isActive ? 'default' : 'secondary'} 
          className={isActive 
            ? 'bg-green-500/20 text-green-300 border-green-500/30' 
            : 'bg-red-500/20 text-red-300 border-red-500/30'
          }
        >
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  // Remove this loading block since SettingsTable will handle loading state

  return (
    <>
      <SettingsTable
        title="Discount Types"
        description="Manage available discount types and their settings"
        columns={columns}
        data={discountTypes}
        onAdd={handleAddDiscountType}
        onEdit={handleEditDiscountType}
        onDelete={handleDeleteDiscountType}
        addButtonText="Add Discount Type"
        emptyStateTitle="No Discount Types Found"
        emptyStateDescription="Start by adding your first discount type to the system."
        isLoading={loading}
      />

      {/* Discount Type Form Sidebar */}
      <Sheet open={isFormOpen} onOpenChange={handleCloseForm}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto glass-scrollbar"
        >
          <SheetHeader className="pb-6 border-b border-white/20">
            <SheetTitle className="text-2xl font-bold text-white">
              {selectedDiscountType ? 'Edit Discount Type' : 'Add New Discount Type'}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <DiscountTypeForm
              discountType={selectedDiscountType}
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
        onConfirm={confirmDeleteDiscountType}
        title="Delete Discount Type"
        description={
          discountTypeToDelete
            ? `Are you sure you want to delete ${discountTypeToDelete.name}? This action cannot be undone and may affect existing student records.`
            : 'Are you sure you want to delete this discount type?'
        }
      />
    </>
  );
};

export default DiscountTypeSettingsTab;

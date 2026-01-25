import React, { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SettingsTable, type SettingsTableColumn } from '../../_shared/components';
import { DiscountTypeFormSheet } from '../dialogs';
import { ConfirmDialog } from '@/components/common/dialogs';
import { useDiscountTypes } from '../hooks/useDiscountTypes';
import type { DiscountType } from '@/domains/settings/types/discountTypeTypes';
import type { DiscountTypeFormData } from '../schemas/discountTypeSchemas';

export const DiscountTypeSettingsTab: React.FC = () => {
  // UI state (local)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedDiscountType, setSelectedDiscountType] = useState<DiscountType | null>(null);
  const [discountTypeToDelete, setDiscountTypeToDelete] = useState<DiscountType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Redux state via hook
  const {
    discountTypes,
    loading,
    fetchDiscountTypes,
    createDiscountType,
    updateDiscountType,
    deleteDiscountType,
  } = useDiscountTypes();

  // Fetch discount types on mount if empty
  useEffect(() => {
    if (discountTypes.length === 0) {
      fetchDiscountTypes();
    }
  }, [discountTypes.length, fetchDiscountTypes]);

  const handleAddDiscountType = useCallback(() => {
    setSelectedDiscountType(null);
    setIsFormOpen(true);
  }, []);

  const handleEditDiscountType = useCallback((discountType: DiscountType) => {
    setSelectedDiscountType(discountType);
    setIsFormOpen(true);
  }, []);

  const handleDeleteDiscountType = useCallback((discountType: DiscountType) => {
    setDiscountTypeToDelete(discountType);
    setIsConfirmOpen(true);
  }, []);

  const handleCloseForm = useCallback((open: boolean) => {
    if (!open) {
      setIsFormOpen(false);
      setSelectedDiscountType(null);
    }
  }, []);

  // Handle row click - opens edit sheet
  const handleRowClick = useCallback((discountType: DiscountType) => {
    handleEditDiscountType(discountType);
  }, [handleEditDiscountType]);

  // Handle delete from within the sheet
  const handleDeleteFromSheet = useCallback(() => {
    if (selectedDiscountType) {
      handleDeleteDiscountType(selectedDiscountType);
    }
  }, [selectedDiscountType, handleDeleteDiscountType]);

  const handleSubmit = async (data: DiscountTypeFormData) => {
    let success: boolean;
    if (selectedDiscountType) {
      success = await updateDiscountType(selectedDiscountType.id, data);
    } else {
      success = await createDiscountType(data);
    }
    if (success) {
      handleCloseForm(false);
    }
  };

  const confirmDeleteDiscountType = async () => {
    if (!discountTypeToDelete) return;

    const success = await deleteDiscountType(discountTypeToDelete.id);
    if (success) {
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
        <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          {key}
        </Badge>
      ),
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
      key: 'sortOrder',
      label: 'Order',
      width: '10%',
    },
    {
      key: 'isActive',
      label: 'Status',
      width: '15%',
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
        columns={columns}
        data={discountTypes}
        onAdd={handleAddDiscountType}
        onRowClick={handleRowClick}
        hideActionsColumn={true}
        showNavigationArrow={true}
        addButtonText="Add Discount Type"
        emptyStateTitle="No Discount Types Found"
        emptyStateDescription="Start by adding your first discount type to the system."
        isLoading={loading.fetching}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search discount types by name..."
        searchKeys={['name', 'key']}
      />

      {/* Discount Type Form Sheet */}
      <DiscountTypeFormSheet
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        discountType={selectedDiscountType}
        onSubmit={handleSubmit}
        onDelete={handleDeleteFromSheet}
        isLoading={loading.creating || loading.updating}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          setIsConfirmOpen(open);
          if (!open) {
            setDiscountTypeToDelete(null);
          }
        }}
        intent="danger"
        icon={Trash2}
        title="Delete Discount Type"
        description={
          discountTypeToDelete
            ? `Are you sure you want to delete ${discountTypeToDelete.name}? This action cannot be undone and may affect existing student records.`
            : 'Are you sure you want to delete this discount type?'
        }
        confirmText="Delete"
        onConfirm={confirmDeleteDiscountType}
        isLoading={loading.deleting}
      />
    </>
  );
};

export default DiscountTypeSettingsTab;

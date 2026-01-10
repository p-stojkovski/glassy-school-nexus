import React from 'react';
import { Plus, Edit, Trash2, CircleCheck, CircleX, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { ClassBasicInfoResponse } from '@/types/api/class';
import { useSalaryRules } from '../../hooks/useSalaryRules';
import ClassSalaryPreviewCard from './ClassSalaryPreviewCard';
import { CreateSalaryRuleDialog } from './CreateSalaryRuleDialog';
import { EditSalaryRuleDialog } from './EditSalaryRuleDialog';
import { DeleteSalaryRuleDialog } from './DeleteSalaryRuleDialog';

interface SalaryRulesTabProps {
  classData: ClassBasicInfoResponse;
  isActive: boolean;
}

const SalaryRulesTab: React.FC<SalaryRulesTabProps> = ({ classData, isActive }) => {
  const {
    salaryRules,
    loading,
    error,
    hasFetched,
    refetch,
    // Dialog state
    showCreateDialog,
    showEditDialog,
    showDeleteDialog,
    selectedRule,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    closeDialogs,
    // CRUD handlers
    handleCreateRule,
    handleUpdateRule,
    handleDeleteRule,
    createLoading,
    updateLoading,
    deleteLoading,
    // Preview
    salaryPreview,
    previewLoading,
    previewError,
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    refetchPreview,
  } = useSalaryRules({
    classId: classData.id,
    isActive,
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('mk-MK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' MKD';
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Ongoing';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
        title="Error Loading Salary Rules"
        message={error}
        onRetry={refetch}
        showRetry
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Salary Preview Card */}
      <ClassSalaryPreviewCard
        preview={salaryPreview}
        loading={previewLoading}
        error={previewError}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
        onRetry={refetchPreview}
      />

      {/* Rules Table or Empty State */}
      {salaryRules.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-8 bg-white/[0.02]">
          <div className="flex flex-col items-center text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
              <CircleX className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Salary Rules Configured</h3>
            <p className="text-white/70 mb-6">
              There are no salary rules for this class yet. Add your first rule to define teacher compensation tiers.
            </p>
            <Button
              onClick={openCreateDialog}
              size="default"
              variant="outline"
              className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Rule
            </Button>
          </div>
        </div>
      ) : (
        <div className="border border-white/10 rounded-lg bg-white/[0.02]">
          {/* Header with Add Rule button */}
          <div className="flex justify-end p-3 border-b border-white/10">
            <Button
              onClick={openCreateDialog}
              size="default"
              variant="outline"
              className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="py-2 text-white/70">Min Students</TableHead>
                <TableHead className="py-2 text-white/70">Rate per Lesson</TableHead>
                <TableHead className="py-2 text-white/70">Effective From</TableHead>
                <TableHead className="py-2 text-white/70">Effective To</TableHead>
                <TableHead className="py-2 text-white/70">Status</TableHead>
                <TableHead className="py-2 text-white/70">Applied</TableHead>
                <TableHead className="py-2 text-white/70 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryRules.map((rule) => (
                <TableRow
                  key={rule.id}
                  className={rule.isApplied ? 'bg-blue-500/10' : ''}
                >
                  <TableCell className="py-2 text-white font-medium">{rule.minStudents}</TableCell>
                  <TableCell className="py-2 text-white font-medium">
                    {formatCurrency(rule.ratePerLesson)}
                  </TableCell>
                  <TableCell className="py-2 text-white/80">{formatDate(rule.effectiveFrom)}</TableCell>
                  <TableCell className="py-2 text-white/80">{formatDate(rule.effectiveTo)}</TableCell>
                  <TableCell className="py-2">
                    <Badge
                      variant={rule.isActive ? 'default' : 'secondary'}
                      className={
                        rule.isActive
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    {rule.isApplied && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <CircleCheck className="w-4 h-4" />
                        <span className="text-xs font-medium">Applied</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-white/10"
                          aria-label="Salary rule actions"
                        >
                          <MoreVertical className="h-4 w-4 text-white/70" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => openEditDialog(rule)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4 text-blue-400" />
                          Edit rule...
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(rule)}
                          className="cursor-pointer text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete rule...
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialogs */}
      <CreateSalaryRuleDialog
        open={showCreateDialog}
        onOpenChange={closeDialogs}
        onSubmit={handleCreateRule}
        isSubmitting={createLoading}
      />

      <EditSalaryRuleDialog
        open={showEditDialog}
        onOpenChange={closeDialogs}
        rule={selectedRule}
        onSubmit={handleUpdateRule}
        isSubmitting={updateLoading}
      />

      <DeleteSalaryRuleDialog
        open={showDeleteDialog}
        onOpenChange={closeDialogs}
        rule={selectedRule}
        onConfirm={handleDeleteRule}
        isDeleting={deleteLoading}
      />
    </div>
  );
};

export default SalaryRulesTab;

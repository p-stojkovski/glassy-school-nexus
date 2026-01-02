import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useTeacherSalary } from './useTeacherSalary';
import { useSalaryAdjustments } from './useSalaryAdjustments';
import SalaryMonthSelector from './SalaryMonthSelector';
import SalarySummaryCards from './SalarySummaryCards';
import SalaryBreakdownTable from './SalaryBreakdownTable';
import SalaryAdjustmentsSection from './SalaryAdjustmentsSection';
import AddAdjustmentDialog from './AddAdjustmentDialog';
import { SalaryAdjustmentResponse } from '@/types/api/teacherSalary';

export default function TeacherSalaryTab() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const { toast } = useToast();

  // Current month/year state
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  // Dialog states
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [editingAdjustment, setEditingAdjustment] = useState<SalaryAdjustmentResponse | null>(null);
  const [deletingAdjustmentId, setDeletingAdjustmentId] = useState<string | null>(null);

  // Fetch salary data
  const { data: salaryData, loading, error, refresh } = useTeacherSalary({
    teacherId: teacherId!,
    year: selectedYear,
    month: selectedMonth,
  });

  // Adjustment operations
  const {
    creating,
    updating,
    deleting,
    createAdjustment,
    updateAdjustment,
    deleteAdjustment,
  } = useSalaryAdjustments({
    teacherId: teacherId!,
    onSuccess: () => {
      refresh();
      toast({
        title: 'Success',
        description: 'Salary adjustment updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    },
  });

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const handleAddAdjustment = () => {
    setEditingAdjustment(null);
    setShowAdjustmentDialog(true);
  };

  const handleEditAdjustment = (adjustment: SalaryAdjustmentResponse) => {
    setEditingAdjustment(adjustment);
    setShowAdjustmentDialog(true);
  };

  const handleDeleteAdjustment = (adjustmentId: string) => {
    setDeletingAdjustmentId(adjustmentId);
  };

  const confirmDelete = async () => {
    if (!deletingAdjustmentId) return;

    const success = await deleteAdjustment(deletingAdjustmentId);
    setDeletingAdjustmentId(null);
  };

  const handleSubmitAdjustment = async (data: {
    adjustmentType: 'bonus' | 'deduction';
    amount: number;
    reason: string;
  }) => {
    if (editingAdjustment) {
      // Update existing
      await updateAdjustment(editingAdjustment.id, data);
    } else {
      // Create new
      await createAdjustment({
        year: selectedYear,
        month: selectedMonth,
        ...data,
      });
    }
  };

  if (!teacherId) {
    return (
      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Teacher ID is required</AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        <span className="ml-3 text-white/60">Loading salary data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!salaryData) {
    return (
      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No salary data available</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Month Selector */}
      <SalaryMonthSelector
        year={selectedYear}
        month={selectedMonth}
        onChange={handleMonthChange}
      />

      {/* Summary Cards */}
      <SalarySummaryCards summary={salaryData.summary} />

      {/* Breakdown by Class */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Breakdown by Class</h3>
        <SalaryBreakdownTable classBreakdowns={salaryData.classBreakdowns} />
      </div>

      {/* Adjustments Section */}
      <SalaryAdjustmentsSection
        adjustments={salaryData.adjustments}
        onAdd={handleAddAdjustment}
        onEdit={handleEditAdjustment}
        onDelete={handleDeleteAdjustment}
        loading={creating || updating || deleting}
      />

      {/* Add/Edit Adjustment Dialog */}
      <AddAdjustmentDialog
        open={showAdjustmentDialog}
        onOpenChange={setShowAdjustmentDialog}
        year={selectedYear}
        month={selectedMonth}
        editingAdjustment={editingAdjustment}
        onSubmit={handleSubmitAdjustment}
        loading={creating || updating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAdjustmentId} onOpenChange={() => setDeletingAdjustmentId(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to delete this salary adjustment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

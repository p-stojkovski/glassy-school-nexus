import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SalaryAdjustmentResponse } from '@/types/api/teacherSalary';
import { format } from 'date-fns';

interface SalaryAdjustmentsSectionProps {
  adjustments: SalaryAdjustmentResponse[];
  onAdd: () => void;
  onEdit: (adjustment: SalaryAdjustmentResponse) => void;
  onDelete: (adjustmentId: string) => void;
  loading?: boolean;
}

export default function SalaryAdjustmentsSection({
  adjustments,
  onAdd,
  onEdit,
  onDelete,
  loading = false,
}: SalaryAdjustmentsSectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Adjustments</h3>
        <Button
          onClick={onAdd}
          size="sm"
          className="bg-purple-500 hover:bg-purple-600 text-white"
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Adjustment
        </Button>
      </div>

      {adjustments.length === 0 ? (
        <div className="p-8 text-center bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
          <p className="text-white/60">No adjustments for this month</p>
          <Button
            onClick={onAdd}
            variant="ghost"
            className="mt-4 text-purple-400 hover:text-purple-300 hover:bg-white/10"
          >
            Add your first adjustment
          </Button>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-white/90">Type</TableHead>
                <TableHead className="text-white/90 text-right">Amount</TableHead>
                <TableHead className="text-white/90">Reason</TableHead>
                <TableHead className="text-white/90">Date</TableHead>
                <TableHead className="text-white/90 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustments.map((adjustment) => (
                <TableRow key={adjustment.id} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <Badge
                      variant={adjustment.adjustmentType === 'bonus' ? 'default' : 'destructive'}
                      className={
                        adjustment.adjustmentType === 'bonus'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }
                    >
                      {adjustment.adjustmentType === 'bonus' ? '🟢 Bonus' : '🔴 Deduction'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    <span
                      className={
                        adjustment.adjustmentType === 'bonus' ? 'text-green-400' : 'text-red-400'
                      }
                    >
                      {adjustment.adjustmentType === 'bonus' ? '+' : '-'}
                      {formatCurrency(adjustment.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-white/80">{adjustment.reason}</TableCell>
                  <TableCell className="text-white/60 text-sm">
                    {format(new Date(adjustment.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(adjustment)}
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(adjustment.id)}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ClassSalaryBreakdownResponse } from '@/types/api/teacherSalary';

interface SalaryBreakdownTableProps {
  classBreakdowns: ClassSalaryBreakdownResponse[];
}

export default function SalaryBreakdownTable({ classBreakdowns }: SalaryBreakdownTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalSubtotal = classBreakdowns.reduce((sum, item) => sum + item.subtotal, 0);

  if (classBreakdowns.length === 0) {
    return (
      <div className="p-8 text-center bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
        <p className="text-white/60">No classes taught this month</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white/90">Class</TableHead>
              <TableHead className="text-white/90 text-right">Conducted</TableHead>
              <TableHead className="text-white/90 text-right">Cancelled</TableHead>
              <TableHead className="text-white/90 text-right">Makeup</TableHead>
              <TableHead className="text-white/90 text-right">Rate/Lesson</TableHead>
              <TableHead className="text-white/90 text-right">Hours</TableHead>
              <TableHead className="text-white/90 text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classBreakdowns.map((breakdown) => (
              <TableRow key={breakdown.classId} className="border-white/10 hover:bg-white/5">
                <TableCell className="font-medium text-white">{breakdown.className}</TableCell>
                <TableCell className="text-right text-green-400">{breakdown.conductedLessons}</TableCell>
                <TableCell className="text-right text-red-400">{breakdown.cancelledLessons}</TableCell>
                <TableCell className="text-right text-yellow-400">{breakdown.makeupLessons}</TableCell>
                <TableCell className="text-right text-white/80">{formatCurrency(breakdown.ratePerLesson)}</TableCell>
                <TableCell className="text-right text-white/80">
                  {breakdown.hoursWorked.toFixed(1)}h
                </TableCell>
                <TableCell className="text-right font-semibold text-white">
                  {formatCurrency(breakdown.subtotal)}
                </TableCell>
              </TableRow>
            ))}
            {/* Total Row */}
            <TableRow className="border-t-2 border-white/20 bg-white/10">
              <TableCell colSpan={6} className="font-bold text-white">
                Lessons Total
              </TableCell>
              <TableCell className="text-right font-bold text-white text-lg">
                {formatCurrency(totalSubtotal)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

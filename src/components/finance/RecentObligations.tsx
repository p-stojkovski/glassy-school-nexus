import React from 'react';
import { PaymentObligation } from '@/store/slices/financeSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';

interface RecentObligationsProps {
  obligations: PaymentObligation[];
  title?: string;
  onClose?: () => void;
}

const RecentObligations: React.FC<RecentObligationsProps> = ({ 
  obligations, 
  title = "Recent Obligations",
  onClose 
}) => {
  if (obligations.length === 0) {
    return null;
  }

  // Group by type for better organization
  const groupedObligations = obligations.reduce<Record<string, PaymentObligation[]>>((acc, obligation) => {
    const type = obligation.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(obligation);
    return acc;
  }, {});

  // Total amount calculation
  const totalAmount = obligations.reduce((sum, obligation) => sum + obligation.amount, 0);

  return (
    <Card className="bg-white/20 backdrop-blur-sm border-white/30 mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">{title}</CardTitle>
        <Badge variant="outline" className="bg-white/20 border-white/30 text-white">
          {obligations.length} obligation{obligations.length !== 1 ? 's' : ''}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-white/10 rounded-md text-white">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <div className="text-sm text-white/70">Total Amount</div>
              <div className="text-lg font-semibold">${totalAmount.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-white/70">Types</div>
              <div className="text-lg font-semibold">{Object.keys(groupedObligations).length}</div>
            </div>
            <div>
              <div className="text-sm text-white/70">Due Date</div>
              <div className="text-lg font-semibold">
                {format(parseISO(obligations[0].dueDate), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="text-white">
            <TableHeader className="border-white/20">
              <TableRow className="border-white/20 hover:bg-white/10">
                <TableHead className="text-white">Student</TableHead>
                <TableHead className="text-white">Type</TableHead>
                <TableHead className="text-white text-right">Amount</TableHead>
                <TableHead className="text-white">Period</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obligations.slice(0, 5).map((obligation) => (
                <TableRow key={obligation.id} className="border-white/20 hover:bg-white/10">
                  <TableCell className="font-medium text-white">{obligation.studentName}</TableCell>
                  <TableCell className="text-white">{obligation.type}</TableCell>
                  <TableCell className="text-right text-white">${obligation.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-white">{obligation.period}</TableCell>
                </TableRow>
              ))}
              {obligations.length > 5 && (
                <TableRow className="border-white/20 hover:bg-white/10">
                  <TableCell colSpan={4} className="text-center text-white/70">
                    + {obligations.length - 5} more obligations
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentObligations;

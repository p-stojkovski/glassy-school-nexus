import React from 'react';
import { PaymentMethod } from '@/types/enums';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Payment, PaymentObligation } from '@/domains/finance/financeSlice';

interface PaymentListProps {
  payments: Payment[];
  obligations: PaymentObligation[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const PaymentList: React.FC<PaymentListProps> = ({
  payments,
  obligations,
  onEdit,
  onDelete,
}) => {
  const getObligationDetails = (obligationId: string) => {
    const obligation = obligations.find((o) => o.id === obligationId);
    return obligation ? `${obligation.type} (${obligation.period})` : 'Unknown';
  };

  const formatPaymentMethod = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.Cash:
        return 'Cash';
      case PaymentMethod.Card:
        return 'Card';
      case PaymentMethod.Transfer:
        return 'Bank Transfer';
      default:
        return 'Other';
    }
  };

  return (
    <Table className="text-white">
      <TableCaption className="text-white/70">Payment history.</TableCaption>
      <TableHeader className="border-white/20">
        <TableRow className="border-white/20 hover:bg-transparent">
          <TableHead className="text-white">Date</TableHead>
          <TableHead className="text-white">Student</TableHead>
          <TableHead className="text-white">For</TableHead>
          <TableHead className="text-white">Method</TableHead>
          <TableHead className="text-right text-white">Amount</TableHead>
          <TableHead className="text-white">Reference</TableHead>
          <TableHead className="text-white">Recorded By</TableHead>
          <TableHead className="text-right text-white">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.length === 0 ? (
          <TableRow className="border-white/20 hover:bg-white/10">
            <TableCell colSpan={8} className="text-center py-8 text-white">
              No payment records found.
            </TableCell>
          </TableRow>
        ) : (
          payments.map((payment) => (
            <TableRow
              key={payment.id}
              className="border-white/20 hover:bg-white/10"
            >
              <TableCell className="text-white">
                {format(parseISO(payment.date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-white">
                {payment.studentName}
              </TableCell>
              <TableCell className="text-white">
                {getObligationDetails(payment.obligationId)}
              </TableCell>
              <TableCell className="text-white">
                {formatPaymentMethod(payment.method)}
              </TableCell>
              <TableCell className="text-right text-white">
                ${payment.amount.toFixed(2)}
              </TableCell>
              <TableCell className="text-white">
                {payment.reference || '-'}
              </TableCell>
              <TableCell className="text-white">{payment.createdBy}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(payment.id)}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">
                          Delete Payment
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-white/70">
                          Are you sure you want to delete this payment record?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(payment.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default PaymentList;


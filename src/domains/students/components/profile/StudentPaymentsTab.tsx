import React from 'react';
import { DollarSign, CheckCircle, CreditCard } from 'lucide-react';
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
import GlassCard from '@/components/common/GlassCard';
import { PaymentObligation, Payment } from '@/domains/finance/financeSlice';
import { ObligationStatus } from '@/types/enums';

interface StudentPaymentsTabProps {
  obligations: PaymentObligation[];
  payments: Payment[];
  onOpenPaymentSidebar: (obligation: PaymentObligation) => void;
  canMakePayment: (status: string) => boolean;
  getPaymentStatusColor: (status: string) => string;
}

const StudentPaymentsTab: React.FC<StudentPaymentsTabProps> = ({
  obligations,
  payments,
  onOpenPaymentSidebar,
  canMakePayment,
  getPaymentStatusColor,
}) => {
  return (
    <div className="space-y-6">
      {/* Payment Obligations */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Payment Obligations
        </h3>
        {obligations.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p>No payment obligations</p>
            <p className="text-sm">
              Payment obligations will appear here when assigned
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-white">
              <TableHeader>
                <TableRow className="border-white/20 hover:bg-white/5">
                  <TableHead className="text-white/90">Type</TableHead>
                  <TableHead className="text-white/90">Period</TableHead>
                  <TableHead className="text-white/90">Amount</TableHead>
                  <TableHead className="text-white/90">Due Date</TableHead>
                  <TableHead className="text-white/90">Status</TableHead>
                  <TableHead className="text-white/90">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {obligations.map((obligation) => (
                  <TableRow
                    key={obligation.id}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <TableCell className="font-medium">
                      {obligation.type}
                    </TableCell>
                    <TableCell>{obligation.period}</TableCell>
                    <TableCell>${obligation.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(obligation.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getPaymentStatusColor(obligation.status)} border`}
                      >
                        {obligation.status.charAt(0).toUpperCase() +
                          obligation.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {canMakePayment(obligation.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenPaymentSidebar(obligation)}
                          className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-200"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </GlassCard>

      {/* Payment History */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Payment History
        </h3>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p>No payments recorded</p>
            <p className="text-sm">
              Payment history will appear here when payments are made
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-white">
              <TableHeader>
                <TableRow className="border-white/20 hover:bg-white/5">
                  <TableHead className="text-white/90">Date</TableHead>
                  <TableHead className="text-white/90">Amount</TableHead>
                  <TableHead className="text-white/90">Method</TableHead>
                  <TableHead className="text-white/90">Reference</TableHead>
                  <TableHead className="text-white/90">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="border-white/10 hover:bg-white/5"
                  >
                    <TableCell>
                      {new Date(payment.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-semibold text-green-300">
                      ${payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {payment.method.charAt(0).toUpperCase() +
                        payment.method.slice(1)}
                    </TableCell>
                    <TableCell>{payment.reference || '-'}</TableCell>
                    <TableCell>{payment.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default StudentPaymentsTab;


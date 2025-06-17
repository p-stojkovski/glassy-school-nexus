import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PaymentMethod, ObligationStatus } from '@/types/enums';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import {
  createPayment,
  Payment,
  PaymentObligation,
  selectAllPayments,
} from '@/domains/finance/financeSlice';
import { useToast } from '@/hooks/use-toast';
import { getPaymentStatusColor } from '@/utils/statusColors';
import { Button } from '@/components/ui/button';
import FormButtons from '@/components/common/FormButtons';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, CreditCard } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  amount: z.coerce
    .number()
    .positive({ message: 'Amount must be greater than 0' }),
  date: z.date({ required_error: 'Payment date is required' }),
  method: z.enum(
    [
      PaymentMethod.Cash,
      PaymentMethod.Card,
      PaymentMethod.Transfer,
      PaymentMethod.Other,
    ],
    {
      required_error: 'Payment method is required',
    }
  ),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  obligation: PaymentObligation | null;
  studentName: string;
}

// Define mock user for the demo
const mockUser = {
  id: 'user1',
  name: 'Admin User',
};

const PaymentSidebar: React.FC<PaymentSidebarProps> = ({
  isOpen,
  onClose,
  obligation,
  studentName,
}) => {
  const dispatch = useAppDispatch();
  const allPayments = useAppSelector(selectAllPayments);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      date: new Date(),
      method: PaymentMethod.Cash,
      reference: '',
      notes: '',
    },
  });

  // Calculate remaining amount when obligation changes
  useEffect(() => {
    if (obligation) {
      const existingPayments = allPayments.filter(
        (payment) => payment.obligationId === obligation.id
      );
      const totalPaid = existingPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      const remainingAmount = obligation.amount - totalPaid;

      form.setValue('amount', remainingAmount > 0 ? remainingAmount : 0);
    }
  }, [obligation, allPayments, form]);

  // Reset form when sidebar opens/closes
  useEffect(() => {
    if (!isOpen) {
      form.reset({
        amount: 0,
        date: new Date(),
        method: PaymentMethod.Cash,
        reference: '',
        notes: '',
      });
    }
  }, [isOpen, form]);

  const onSubmit = (data: FormValues) => {
    if (!obligation) return;

    const now = new Date().toISOString();

    const newPayment: Payment = {
      id: uuidv4(),
      obligationId: obligation.id,
      studentId: obligation.studentId,
      studentName: studentName,
      amount: data.amount,
      date: format(data.date, 'yyyy-MM-dd'),
      method: data.method,
      reference: data.reference,
      notes: data.notes,
      createdBy: mockUser.name,
      createdAt: now,
      updatedAt: now,
    };

    dispatch(createPayment(newPayment));

    // Display toast notification for successful payment creation
    toast({
      title: 'Payment recorded',
      description: `Payment of $${data.amount.toFixed(2)} for ${studentName}'s ${obligation.type} has been recorded.`,
      variant: 'success',
      icon: (
        <svg
          className="w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    });

    // Reset form and close sidebar
    form.reset();
    onClose();
  };
  // Calculate existing payments and remaining amount
  const existingPayments = obligation
    ? allPayments.filter((payment) => payment.obligationId === obligation.id)
    : [];
  const totalPaid = existingPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const remainingAmount = obligation ? obligation.amount - totalPaid : 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto"
      >
        <SheetHeader className="pb-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Record Payment
            </SheetTitle>
          </div>
        </SheetHeader>

        {obligation && (
          <div className="space-y-6 py-6">
            {/* Obligation Details */}
            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              <h3 className="text-lg font-semibold text-white">
                Payment Obligation
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Student:</span>
                  <span className="text-white font-medium">{studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Type:</span>
                  <span className="text-white">{obligation.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Period:</span>
                  <span className="text-white">{obligation.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Total Amount:</span>
                  <span className="text-white font-medium">
                    ${obligation.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Paid:</span>
                  <span className="text-white">${totalPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Remaining:</span>
                  <span
                    className={`font-medium ${remainingAmount > 0 ? 'text-yellow-300' : 'text-green-300'}`}
                  >
                    ${remainingAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Status:</span>
                  <Badge
                    className={`${getPaymentStatusColor(obligation.status)} border`}
                  >
                    {obligation.status.charAt(0).toUpperCase() +
                      obligation.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Due Date:</span>
                  <span className="text-white">
                    {new Date(obligation.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Payment Amount ($)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-white/70">
                          Maximum: ${remainingAmount.toFixed(2)}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Payment Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal bg-white/10 border-white/20 text-white',
                                  !field.value && 'text-white/60'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 bg-gray-800 border border-white/20 backdrop-blur-sm"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date('1900-01-01')
                              }
                              initialFocus
                              className="text-white"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Payment Method
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 text-white border border-white/20 backdrop-blur-sm">
                            <SelectItem
                              value="cash"
                              className="text-white hover:bg-gray-700 focus:bg-gray-700"
                            >
                              Cash
                            </SelectItem>
                            <SelectItem
                              value="card"
                              className="text-white hover:bg-gray-700 focus:bg-gray-700"
                            >
                              Card
                            </SelectItem>
                            <SelectItem
                              value="transfer"
                              className="text-white hover:bg-gray-700 focus:bg-gray-700"
                            >
                              Bank Transfer
                            </SelectItem>
                            <SelectItem
                              value="other"
                              className="text-white hover:bg-gray-700 focus:bg-gray-700"
                            >
                              Other
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Reference Number (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Receipt or transaction number"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-white/70">
                          Optional receipt or transaction reference number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">
                          Notes (Optional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional information about this payment"
                            className="resize-none bg-white/10 border-white/20 text-white placeholder:text-white/60"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormButtons
                  submitText="Record Payment"
                  submitIcon={<CreditCard className="h-4 w-4" />}
                  disabled={remainingAmount <= 0}
                  onCancel={onClose}
                />
              </form>
            </Form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default PaymentSidebar;

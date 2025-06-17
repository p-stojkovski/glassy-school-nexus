import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PaymentMethod } from '@/types/enums';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '@/store';
import {
  createPayment,
  updatePayment,
  Payment,
  PaymentObligation,
  selectAllObligations,
  selectAllPayments,
  selectObligationsByStudentId,
} from '@/domains/finance/financeSlice';
import { Student } from '@/domains/students/studentsSlice';
import { Class } from '@/domains/classes/classesSlice';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import SingleStudentSelectionPanel from '@/components/common/SingleStudentSelectionPanel';
import SingleStudentSelectionTrigger from '@/components/common/SingleStudentSelectionTrigger';

const formSchema = z.object({
  studentId: z.string().min(1, { message: 'Student is required' }),
  obligationId: z
    .string()
    .min(1, { message: 'Payment obligation is required' }),
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

interface PaymentFormProps {
  editingId: string | null;
  onCancel: () => void;
}

// Define mock user for the demo
const mockUser = {
  id: 'user1',
  name: 'Admin User',
};

const PaymentForm: React.FC<PaymentFormProps> = ({ editingId, onCancel }) => {
  const dispatch = useAppDispatch();
  const allPayments = useAppSelector(selectAllPayments);
  const allObligations = useAppSelector(selectAllObligations);
  const { classes } = useAppSelector((state: RootState) => state.classes);
  const { toast } = useToast();
  const editedPayment = editingId
    ? allPayments.find((payment) => payment.id === editingId)
    : null;
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentSelectionOpen, setIsStudentSelectionOpen] = useState(false);
  const selectedStudentId = selectedStudent?.id || '';
  const { students } = useAppSelector((state: RootState) => state.students);
  const studentObligations = useAppSelector((state: RootState) =>
    selectObligationsByStudentId(state, selectedStudentId)
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
      obligationId: '',
      amount: 0,
      date: new Date(),
      method: PaymentMethod.Cash,
      reference: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (editedPayment) {
      form.reset({
        studentId: editedPayment.studentId,
        obligationId: editedPayment.obligationId,
        amount: editedPayment.amount,
        date: new Date(editedPayment.date),
        method: editedPayment.method,
        reference: editedPayment.reference || '',
        notes: editedPayment.notes || '',
      });
      // Find and set the selected student object for editing
      const student = students.find((s) => s.id === editedPayment.studentId);
      setSelectedStudent(student || null);
    } else {
      form.reset({
        studentId: '',
        obligationId: '',
        amount: 0,
        date: new Date(),
        method: PaymentMethod.Cash,
        reference: '',
        notes: '',
      });
    }
  }, [editedPayment, form, students]);
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    form.setValue('studentId', student.id);
    form.setValue('obligationId', ''); // Reset obligation when student changes

    // Populate obligation amount when student changes
    const obligations = allObligations.filter(
      (obl) => obl.studentId === student.id
    );
    if (obligations.length > 0) {
      form.setValue('obligationId', obligations[0].id);
      handleObligationChange(obligations[0].id);
    }
  };

  const handleStudentClear = () => {
    setSelectedStudent(null);
    form.setValue('studentId', '');
    form.setValue('obligationId', '');
    form.setValue('amount', 0);
  };

  const handleObligationChange = (obligationId: string) => {
    const selectedObligation = allObligations.find(
      (obl) => obl.id === obligationId
    );
    if (selectedObligation) {
      // Find existing payments for this obligation
      const existingPayments = allPayments.filter(
        (payment) => payment.obligationId === obligationId
      );
      const totalPaid = existingPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      const remainingAmount = selectedObligation.amount - totalPaid;

      // Set the amount to the remaining amount by default
      form.setValue('amount', remainingAmount > 0 ? remainingAmount : 0);
    }
  };

  const onSubmit = (data: FormValues) => {
    const now = new Date().toISOString();
    const selectedObligation = allObligations.find(
      (obl) => obl.id === data.obligationId
    );

    if (!selectedObligation) return;
    if (editingId && editedPayment) {
      dispatch(
        updatePayment({
          ...editedPayment,
          ...data,
          date: format(data.date, 'yyyy-MM-dd'),
          studentName: selectedObligation.studentName,
          updatedAt: now,
        })
      );
      // Display toast notification for successful payment update
      toast({
        title: 'Payment updated',
        description: `Payment of $${data.amount.toFixed(2)} for ${selectedObligation.type} has been updated successfully.`,
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        ),
      });
    } else {
      const newPayment: Payment = {
        id: uuidv4(),
        obligationId: data.obligationId,
        studentId: data.studentId,
        studentName: selectedObligation.studentName,
        amount: data.amount,
        date: format(data.date, 'yyyy-MM-dd'),
        method: data.method,
        reference: data.reference,
        notes: data.notes,
        createdBy: mockUser.name,
        createdAt: now,
        updatedAt: now,
      };
      dispatch(createPayment(newPayment)); // Display toast notification for successful payment creation
      toast({
        title: 'Payment recorded',
        description: `Payment of $${data.amount.toFixed(2)} for ${selectedObligation.studentName}'s ${selectedObligation.type} has been recorded.`,
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
    }

    // Reset form and exit edit mode
    form.reset();
    onCancel();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 text-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {' '}
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Student</FormLabel>
                <FormControl>
                  <SingleStudentSelectionTrigger
                    selectedStudent={selectedStudent}
                    onOpen={() => setIsStudentSelectionOpen(true)}
                    onClear={handleStudentClear}
                    placeholder="Select a student"
                    disabled={!!editingId}
                    showObligationHint={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="obligationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Payment Obligation</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleObligationChange(value);
                  }}
                  value={field.value}
                  disabled={!!editingId || !selectedStudentId}
                >
                  {' '}
                  <FormControl>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select obligation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 text-white border border-white/20 backdrop-blur-sm">
                    {studentObligations.map((obligation) => (
                      <SelectItem
                        key={obligation.id}
                        value={obligation.id}
                        className="text-white hover:bg-gray-700 focus:bg-gray-700"
                      >
                        {obligation.type} - ${obligation.amount} (
                        {obligation.period})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Amount ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    {...field}
                  />
                </FormControl>{' '}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Payment Date</FormLabel>
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
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                      className="text-white"
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className="text-white/70">
                  &nbsp;
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Payment Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  {' '}
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
        </div>
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
        />{' '}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Notes (Optional)</FormLabel>
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
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            className="bg-white/50 backdrop-blur-sm border-white text-white font-medium hover:bg-white/60 shadow-sm"
            onClick={onCancel}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
            Cancel
          </Button>
          <Button
            type="submit"
            className={`shadow-md ${
              editingId
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-yellow-500 hover:bg-yellow-600 text-black font-semibold'
            }`}
          >
            {editingId ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                  <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                </svg>
                Update Payment
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                  <line x1="2" x2="22" y1="10" y2="10"></line>
                </svg>
                Record Payment
              </>
            )}
          </Button>{' '}
        </div>
      </form>

      {/* Single Student Selection Panel */}
      <SingleStudentSelectionPanel
        open={isStudentSelectionOpen}
        onOpenChange={setIsStudentSelectionOpen}
        onStudentSelect={handleStudentSelect}
        filterOngoingObligationsOnly={true}
        students={students}
        classes={classes}
        obligations={allObligations}
        payments={allPayments}
      />
    </Form>
  );
};

export default PaymentForm;

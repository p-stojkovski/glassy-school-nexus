import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { AppDispatch, RootState } from '@/store';
import { 
  createPayment, 
  updatePayment, 
  Payment,
  PaymentObligation,
  selectAllObligations,
  selectAllPayments,
  selectObligationsByStudentId,
} from '@/store/slices/financeSlice';
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

const formSchema = z.object({
  studentId: z.string().min(1, { message: "Student is required" }),
  obligationId: z.string().min(1, { message: "Payment obligation is required" }),
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0" }),
  date: z.date({ required_error: "Payment date is required" }),
  method: z.enum(['cash', 'card', 'transfer', 'other'], {
    required_error: "Payment method is required",
  }),
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
  name: 'Admin User'
};

// Define some mock students for the demo
const mockStudents = [
  { id: 'student1', name: 'Alice Johnson' },
  { id: 'student2', name: 'Bob Smith' },
  { id: 'student3', name: 'Charlie Brown' },
  { id: 'student4', name: 'Diana Prince' },
  { id: 'student5', name: 'Ethan Hunt' }
];

const PaymentForm: React.FC<PaymentFormProps> = ({ editingId, onCancel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const allPayments = useSelector(selectAllPayments);
  const allObligations = useSelector(selectAllObligations);
  const { toast } = useToast();
  const editedPayment = editingId
    ? allPayments.find(payment => payment.id === editingId)
    : null;

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');  const studentObligations = useSelector((state: RootState) => 
    selectObligationsByStudentId(state, selectedStudentId)
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
      obligationId: '',
      amount: 0,
      date: new Date(),
      method: 'cash',
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
      setSelectedStudentId(editedPayment.studentId);
    } else {
      form.reset({
        studentId: '',
        obligationId: '',
        amount: 0,
        date: new Date(),
        method: 'cash',
        reference: '',
        notes: '',
      });
    }
  }, [editedPayment, form]);

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    form.setValue('studentId', studentId);
    form.setValue('obligationId', ''); // Reset obligation when student changes
    
    const student = mockStudents.find(s => s.id === studentId);
    if (student) {
      // Populate obligation amount when student changes
      const obligations = allObligations.filter(obl => obl.studentId === studentId);
      if (obligations.length > 0) {
        form.setValue('obligationId', obligations[0].id);
        handleObligationChange(obligations[0].id);
      }
    }
  };

  const handleObligationChange = (obligationId: string) => {
    const selectedObligation = allObligations.find(obl => obl.id === obligationId);
    if (selectedObligation) {
      // Find existing payments for this obligation
      const existingPayments = allPayments.filter(
        payment => payment.obligationId === obligationId
      );
      const totalPaid = existingPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingAmount = selectedObligation.amount - totalPaid;
      
      // Set the amount to the remaining amount by default
      form.setValue('amount', remainingAmount > 0 ? remainingAmount : 0);
    }
  };

  const onSubmit = (data: FormValues) => {
    const now = new Date().toISOString();
    const selectedObligation = allObligations.find(obl => obl.id === data.obligationId);
    
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
        title: "Payment updated",
        description: `Payment of $${data.amount.toFixed(2)} for ${selectedObligation.type} has been updated successfully.`,
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
      dispatch(createPayment(newPayment));
      
      // Display toast notification for successful payment creation
      toast({
        title: "Payment recorded",
        description: `Payment of $${data.amount.toFixed(2)} for ${selectedObligation.studentName}'s ${selectedObligation.type} has been recorded.`,
      });
    }

    // Reset form and exit edit mode
    form.reset();
    onCancel();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Student</FormLabel>
                <Select
                  onValueChange={(value) => handleStudentChange(value)}
                  value={field.value}
                  disabled={!!editingId}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white/90 backdrop-blur-sm">
                    {mockStudents.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <FormControl>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue placeholder="Select obligation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white/90 backdrop-blur-sm">
                    {studentObligations.map(obligation => (
                      <SelectItem key={obligation.id} value={obligation.id}>
                        {obligation.type} - ${obligation.amount} ({obligation.period})
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
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Payment Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal bg-white/20 border-white/30 text-white",
                          !field.value && "text-white/70"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white/90 backdrop-blur-sm" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white/90 backdrop-blur-sm">
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="transfer">Bank Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
              <FormLabel className="text-white">Reference Number (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Receipt or transaction number" 
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
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
              <FormLabel className="text-white">Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional information about this payment" 
                  className="resize-none bg-white/20 border-white/30 text-white placeholder:text-white/70" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end space-x-4">          <Button 
            type="button" 
            variant="outline" 
            className="bg-white/50 backdrop-blur-sm border-white text-white font-medium hover:bg-white/60 shadow-sm"
            onClick={onCancel}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            Cancel
          </Button>
          <Button 
            type="submit"
            className={`shadow-md ${editingId 
              ? "bg-blue-600 text-white hover:bg-blue-700" 
              : "bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            }`}
          >
            {editingId ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>
                Update Payment
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>
                Record Payment
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PaymentForm;

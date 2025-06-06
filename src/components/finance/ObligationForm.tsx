import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { AppDispatch, RootState } from '@/store';
import { 
  createObligation, 
  updateObligation, 
  PaymentObligation,
  selectAllObligations
} from '@/store/slices/financeSlice';
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
  studentId: z.string().min(1, { message: "Student ID is required" }),
  studentName: z.string().min(1, { message: "Student name is required" }),
  type: z.string().min(1, { message: "Obligation type is required" }),
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0" }),
  dueDate: z.date({ required_error: "Due date is required" }),
  period: z.string().min(1, { message: "Period is required" }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ObligationFormProps {
  editingId?: string | null;
  onCancel: () => void;
  batchMode?: boolean;
  onSubmitBatch?: (data: Omit<PaymentObligation, 'id' | 'studentId' | 'studentName' | 'status' | 'createdAt' | 'updatedAt'>) => void;
}

// Function to format the current school year
const getCurrentSchoolYear = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  
  // If we're in the latter half of the year (Jul-Dec), we use current year/next year format
  if (month >= 7) {
    return `${year}/${year + 1}`;
  }
  // Otherwise we're in the first half (Jan-Jun), we use previous year/current year format
  return `${year - 1}/${year}`;
};

// Define some mock students for the demo
const mockStudents = [
  { id: 'student1', name: 'Alice Johnson' },
  { id: 'student2', name: 'Bob Smith' },
  { id: 'student3', name: 'Charlie Brown' },
  { id: 'student4', name: 'Diana Prince' },
  { id: 'student5', name: 'Ethan Hunt' }
];

const obligationTypes = [
  "Tuition Fee",
  "Registration Fee",
  "Book Fee",
  "Activity Fee",
  "Excursion Fee",
  "Laboratory Fee",
  "Technology Fee",
  "Graduation Fee",
  "Other"
];

const ObligationForm: React.FC<ObligationFormProps> = ({ 
  editingId = null, 
  onCancel, 
  batchMode = false,
  onSubmitBatch 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const allObligations = useSelector(selectAllObligations);
  const editedObligation = editingId
    ? allObligations.find(obl => obl.id === editingId)
    : null;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
      studentName: '',
      type: '',
      amount: 0,
      dueDate: new Date(),
      period: getCurrentSchoolYear(),
      notes: '',
    },
  });

  useEffect(() => {
    if (editedObligation) {
      form.reset({
        studentId: editedObligation.studentId,
        studentName: editedObligation.studentName,
        type: editedObligation.type,
        amount: editedObligation.amount,
        dueDate: new Date(editedObligation.dueDate),
        period: editedObligation.period,
        notes: editedObligation.notes || '',
      });
    } else {
      form.reset({
        studentId: '',
        studentName: '',
        type: '',
        amount: 0,
        dueDate: new Date(),
        period: getCurrentSchoolYear(),
        notes: '',
      });
    }
  }, [editedObligation, form]);

  const handleStudentChange = (studentId: string) => {
    const student = mockStudents.find(s => s.id === studentId);
    if (student) {
      form.setValue('studentId', studentId);
      form.setValue('studentName', student.name);
    }
  };
  const onSubmit = (data: FormValues) => {
    const now = new Date().toISOString();
    const formattedDueDate = format(data.dueDate, 'yyyy-MM-dd');
    
    if (batchMode && onSubmitBatch) {
      // In batch mode, we just pass the obligation data to the parent component
      onSubmitBatch({
        type: data.type,
        amount: data.amount,
        period: data.period,
        dueDate: formattedDueDate,
        notes: data.notes
      });
      
      form.reset();
      return;
    }
    
    if (editingId && editedObligation) {
      // Editing an existing obligation
      dispatch(
        updateObligation({
          ...editedObligation,
          ...data,
          dueDate: formattedDueDate,
          updatedAt: now,
        })
      );
    } else {
      // Creating a new single obligation
      const newObligation: PaymentObligation = {
        id: uuidv4(),
        studentId: data.studentId,
        studentName: data.studentName,
        type: data.type,
        amount: data.amount,
        period: data.period,
        status: 'pending',
        dueDate: formattedDueDate,
        notes: data.notes,
        createdAt: now,
        updatedAt: now,
      };
      dispatch(createObligation(newObligation));
    }

    // Reset form and exit edit mode
    form.reset();
    onCancel();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!batchMode && (
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Student</FormLabel>
                  <Select
                    onValueChange={(value) => handleStudentChange(value)}
                    defaultValue={field.value}
                    value={field.value}
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
          )}

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Obligation Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white/90 backdrop-blur-sm">
                    {obligationTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
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
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-white">Due Date</FormLabel>
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
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Period</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="2023/2024" 
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-white/70">
                  Academic year or semester
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional information about this payment obligation" 
                  className="resize-none bg-white/20 border-white/30 text-white placeholder:text-white/70" 
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
            className="border-white/30 text-white hover:bg-white/20"
            onClick={onCancel}
          >
            Cancel
          </Button>          <Button 
            type="submit"
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            {editingId ? "Update Obligation" : batchMode ? "Apply to Selected Students" : "Create Obligation"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ObligationForm;

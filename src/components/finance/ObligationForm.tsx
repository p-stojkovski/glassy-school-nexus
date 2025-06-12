import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '@/store';
import { 
  createObligation, 
  updateObligation, 
  PaymentObligation,
  selectAllObligations
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
  const dispatch = useAppDispatch();
  const allObligations = useAppSelector(selectAllObligations);
  const { toast } = useToast();
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
      );      // Display toast notification for successful update
      toast({
        title: "Obligation updated",
        description: `${data.type} obligation for ${data.studentName} has been updated successfully.`,
        variant: "success",
        icon: <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>,
      });
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
      dispatch(createObligation(newObligation));      // Display toast notification for successful creation
      toast({
        title: "Obligation created",
        description: `${data.type} obligation for ${data.studentName} has been created successfully.`,
        variant: "success",
        icon: <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>,
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
                    value={field.value}                  >
                    <FormControl>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white">
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 text-white border border-white/30 backdrop-blur-sm">
                      {mockStudents.map(student => (
                        <SelectItem key={student.id} value={student.id} className="text-white hover:bg-gray-700 focus:bg-gray-700">
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
                <FormLabel className="text-white">Obligation Type</FormLabel>                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 text-white border border-white/30 backdrop-blur-sm">
                    {obligationTypes.map(type => (
                      <SelectItem key={type} value={type} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <FormDescription className="text-white/70">
                  &nbsp;
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
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
                        )}                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border border-white/30 backdrop-blur-sm" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date("1900-01-01")
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
          {/* Only show Cancel button in batch mode */}
          {batchMode && (
            <Button 
              type="button" 
              variant="outline" 
              className="bg-white/50 backdrop-blur-sm border-white text-white font-medium hover:bg-white/60 shadow-sm"
              onClick={onCancel}
            >
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              Cancel
            </Button>
          )}
          <Button 
            type="submit"
            className={`shadow-md ${editingId 
              ? "bg-blue-600 text-white hover:bg-blue-700" 
              : "bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            }`}
          >
            {editingId ? (
              <>
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Update Obligation
              </>            ) : batchMode ? (
              <>
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Apply to Selected Students
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Create Obligation
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ObligationForm;

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '@/store';
import {
  createObligation,
  PaymentObligation,
} from '@/domains/finance/financeSlice';
import { selectStudents } from '@/domains/students/studentsSlice';
import { useToast } from '@/hooks/use-toast';
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
import { CalendarIcon, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import StudentSelectionPanel from '@/components/common/StudentSelectionPanel';
import StudentSelectionTrigger from '@/components/common/StudentSelectionTrigger';
import { ObligationStatus } from '@/types/enums';

const formSchema = z.object({
  type: z.string().min(1, { message: 'Obligation type is required' }),
  amount: z.coerce
    .number()
    .positive({ message: 'Amount must be greater than 0' }),
  dueDate: z.date({ required_error: 'Due date is required' }),
  period: z.string().min(1, { message: 'Period is required' }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BatchObligationFormProps {
  onCancel: () => void;
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

const obligationTypes = [
  'Tuition Fee',
  'Registration Fee',
  'Book Fee',
  'Activity Fee',
  'Excursion Fee',
  'Laboratory Fee',
  'Technology Fee',
  'Graduation Fee',
  'Other',
];

const BatchObligationForm: React.FC<BatchObligationFormProps> = ({
  onCancel,
}) => {
  const dispatch = useAppDispatch();
  const students = useAppSelector((state: RootState) => selectStudents(state));
  const { classes } = useAppSelector((state: RootState) => state.classes);
  const { toast } = useToast();

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isStudentPanelOpen, setIsStudentPanelOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: '',
      amount: 0,
      dueDate: new Date(),
      period: getCurrentSchoolYear(),
      notes: '',
    },
  });

  const handleStudentSelectionChange = (studentIds: string[]) => {
    setSelectedStudentIds(studentIds);
  };

  const selectedStudents = students.filter((student) =>
    selectedStudentIds.includes(student.id)
  );

  const onSubmit = (data: FormValues) => {
    if (selectedStudentIds.length === 0) {
      toast({
        title: 'No students selected',
        description:
          'Please select at least one student to create obligations for.',
        variant: 'destructive',
      });
      return;
    }

    const now = new Date().toISOString();
    const formattedDueDate = format(data.dueDate, 'yyyy-MM-dd');

    // Create obligations for all selected students
    const newObligations: PaymentObligation[] = selectedStudentIds.map(
      (studentId) => {
        const student = students.find((s) => s.id === studentId);
        return {
          id: uuidv4(),
          studentId,
          studentName: student?.name || 'Unknown Student',
          type: data.type,
          amount: data.amount,
          period: data.period,
          status: ObligationStatus.Pending,
          dueDate: formattedDueDate,
          notes: data.notes,
          createdAt: now,
          updatedAt: now,
        };
      }
    );

    // Dispatch all obligations
    newObligations.forEach((obligation) => {
      dispatch(createObligation(obligation));
    });

    // Display success toast
    toast({
      title: 'Batch obligations created',
      description: `${newObligations.length} ${data.type} obligation${newObligations.length !== 1 ? 's' : ''} created successfully for selected students.`,
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      ),
    });

    // Reset form and selections
    form.reset();
    setSelectedStudentIds([]);
    onCancel();
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 text-white"
        >
          <div className="space-y-4">
            {/* Student Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Select Students
              </label>{' '}
              <StudentSelectionTrigger
                students={students}
                selectedStudentIds={selectedStudentIds}
                onOpenPanel={() => setIsStudentPanelOpen(true)}
                placeholder="Click to select students..."
                showCount={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Obligation Type
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 text-white border border-white/20 backdrop-blur-sm">
                        {obligationTypes.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="text-white hover:bg-gray-700 focus:bg-gray-700"
                          >
                            {type}
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
                    </FormControl>
                    <FormDescription className="text-white/70">
                      Amount will be applied to each selected student
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal bg-white/10 border-white/20 text-white',
                              !field.value && 'text-white/70'
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
                          disabled={(date) => date < new Date('1900-01-01')}
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
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
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
                      className="resize-none bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormButtons
              onCancel={onCancel}
              submitText={`Create for ${selectedStudentIds.length} Student${selectedStudentIds.length !== 1 ? 's' : ''}`}
              submitIcon={<Users className="h-4 w-4" />}
              disabled={selectedStudentIds.length === 0}
              variant="default"
            />
          </div>
        </form>
      </Form>

      {/* Student Selection Panel */}
      <StudentSelectionPanel
        students={students}
        classes={classes}
        selectedStudentIds={selectedStudentIds}
        onSelectionChange={handleStudentSelectionChange}
        onClose={() => setIsStudentPanelOpen(false)}
        isOpen={isStudentPanelOpen}
        title="Select Students for Batch Obligation"
        allowMultiple={true}
      />
    </>
  );
};

export default BatchObligationForm;

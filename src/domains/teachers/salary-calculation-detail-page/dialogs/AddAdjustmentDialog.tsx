/**
 * AddAdjustmentDialog - Dialog to add a salary adjustment (bonus/deduction)
 */
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ActionDialog } from '@/components/common/dialogs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useToast } from '@/hooks/use-toast';
import {
  setLoadingState,
  setError,
  addSalaryAdjustment,
} from '@/domains/teachers/teachersSlice';
import { createSalaryAdjustment } from '@/services/teacherApiService';
import {
  addAdjustmentSchema,
  type AddAdjustmentFormData,
} from '../schemas/addAdjustmentSchema';

interface AddAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculationId: string;
  onSuccess?: () => void;
}

export const AddAdjustmentDialog: React.FC<AddAdjustmentDialogProps> = ({
  open,
  onOpenChange,
  calculationId,
  onSuccess,
}) => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const loading = useAppSelector(
    (state) => state.teachers.loading.creatingSalaryAdjustment
  );

  const form = useForm<AddAdjustmentFormData>({
    resolver: zodResolver(addAdjustmentSchema),
    mode: 'onChange',
    defaultValues: {
      adjustmentType: 'addition',
      description: '',
      amount: undefined as any, // Allow undefined initially
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        adjustmentType: 'addition',
        description: '',
        amount: undefined as any, // Allow undefined on reset
      });
    }
  }, [open, form]);

  const onSubmit = async (data: AddAdjustmentFormData) => {
    if (!teacherId) return;

    try {
      dispatch(
        setLoadingState({ operation: 'creatingSalaryAdjustment', loading: true })
      );
      dispatch(
        setError({ operation: 'createSalaryAdjustment', error: null })
      );

      const result = await createSalaryAdjustment(teacherId, calculationId, data);

      // Update Redux state
      dispatch(addSalaryAdjustment(result));

      const typeLabel = data.adjustmentType === 'addition' ? 'bonus' : 'deduction';
      toast({
        title: 'Adjustment added',
        description: `Successfully added ${typeLabel}`,
        variant: 'default',
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const errorMessage =
        err?.message || 'Failed to add salary adjustment';
      dispatch(
        setError({ operation: 'createSalaryAdjustment', error: errorMessage })
      );
      toast({
        title: 'Failed to add adjustment',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      dispatch(
        setLoadingState({ operation: 'creatingSalaryAdjustment', loading: false })
      );
    }
  };

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="primary"
      size="md"
      icon={Plus}
      title="Add Salary Adjustment"
      description="Add a bonus or deduction to this salary calculation."
      confirmText="Add Adjustment"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={loading}
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="adjustmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/80">Adjustment Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="addition" id="addition" />
                      <Label htmlFor="addition" className="text-white/80 cursor-pointer">
                        Bonus (Addition)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="deduction" id="deduction" />
                      <Label htmlFor="deduction" className="text-white/80 cursor-pointer">
                        Deduction
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/80">
                  Description <span className="text-red-400">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    disabled={loading}
                    className="bg-white/5 border-white/20 text-white min-h-[80px] resize-none"
                    placeholder="Describe the reason for this adjustment..."
                  />
                </FormControl>
                <FormDescription className="text-white/50 text-xs">
                  3-200 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/80">
                  Amount (MKD) <span className="text-red-400">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="999999.99"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string as intermediate state
                      if (value === '') {
                        field.onChange(undefined);
                      } else {
                        const numValue = parseFloat(value);
                        field.onChange(isNaN(numValue) ? undefined : numValue);
                      }
                    }}
                    disabled={loading}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Enter amount"
                  />
                </FormControl>
                <FormDescription className="text-white/50 text-xs">
                  Maximum: 999,999.99 MKD
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </ActionDialog>
  );
};

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Coins } from 'lucide-react';
import { ActionDialog } from '@/components/common/dialogs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  createSalaryRuleSchema,
  type CreateSalaryRuleFormData,
} from '@/domains/classes/schemas/classValidators';

interface CreateSalaryRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSalaryRuleFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function CreateSalaryRuleDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CreateSalaryRuleDialogProps) {
  const form = useForm<CreateSalaryRuleFormData>({
    resolver: zodResolver(createSalaryRuleSchema),
    defaultValues: {
      minStudents: 0,
      ratePerLesson: 0,
      effectiveFrom: '',
      effectiveTo: '',
    },
  });

  const handleSubmit = async (data: CreateSalaryRuleFormData) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      intent="primary"
      size="md"
      icon={Coins}
      title="Create Salary Rule"
      description="Define a new tier-based rate for teacher compensation"
      confirmText="Create Rule"
      onConfirm={form.handleSubmit(handleSubmit)}
      isLoading={isSubmitting}
    >
      <ScrollArea className="max-h-[60vh]">
        <div className="px-1">
          <Form {...form}>
            <form className="space-y-4">
              {/* Min Students */}
              <FormField
                control={form.control}
                name="minStudents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Minimum Students *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        {...field}
                        placeholder="0"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rate per Lesson */}
              <FormField
                control={form.control}
                name="ratePerLesson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Rate per Lesson (MKD) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        placeholder="0.00"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Effective From */}
              <FormField
                control={form.control}
                name="effectiveFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Effective From *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Effective To */}
              <FormField
                control={form.control}
                name="effectiveTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Effective To (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value || ''}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </ScrollArea>
    </ActionDialog>
  );
}

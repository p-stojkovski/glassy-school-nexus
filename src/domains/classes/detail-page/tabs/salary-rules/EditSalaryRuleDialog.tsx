import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  updateSalaryRuleSchema,
  type UpdateSalaryRuleFormData,
} from '@/domains/classes/schemas/classValidators';
import { ClassSalaryRule } from '@/domains/classes/_shared/types/salaryRule.types';

interface EditSalaryRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: ClassSalaryRule | null;
  onSubmit: (data: UpdateSalaryRuleFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function EditSalaryRuleDialog({
  open,
  onOpenChange,
  rule,
  onSubmit,
  isSubmitting = false,
}: EditSalaryRuleDialogProps) {
  const form = useForm<UpdateSalaryRuleFormData>({
    resolver: zodResolver(updateSalaryRuleSchema),
    defaultValues: {
      minStudents: 0,
      ratePerLesson: 0,
      effectiveFrom: '',
      effectiveTo: '',
    },
  });

  // Reset form when dialog opens or rule changes
  useEffect(() => {
    if (open && rule) {
      form.reset({
        minStudents: rule.minStudents,
        ratePerLesson: rule.ratePerLesson,
        effectiveFrom: rule.effectiveFrom,
        effectiveTo: rule.effectiveTo || '',
      });
    }
  }, [open, rule, form]);

  const handleSubmit = async (data: UpdateSalaryRuleFormData) => {
    await onSubmit(data);
  };

  if (!rule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-400" />
            Edit Salary Rule
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Update the tier-based rate for teacher compensation
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="py-4 px-1">
            <Form {...form}>
              <form id="edit-salary-rule-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

        <DialogFooter className="gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-salary-rule-form"
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

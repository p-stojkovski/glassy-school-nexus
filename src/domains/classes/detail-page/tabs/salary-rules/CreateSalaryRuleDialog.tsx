import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Coins } from 'lucide-react';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-green-400" />
            Create Salary Rule
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Define a new tier-based rate for teacher compensation
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="py-4 px-1">
            <Form {...form}>
              <form id="create-salary-rule-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            form="create-salary-rule-form"
            disabled={isSubmitting}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold"
          >
            {isSubmitting ? 'Creating...' : 'Create Rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

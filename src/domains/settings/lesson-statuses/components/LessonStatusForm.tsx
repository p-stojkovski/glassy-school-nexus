import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { lessonStatusSchema, LessonStatusFormData } from '../schemas/lessonStatusSchemas';
import type { LessonStatus } from '../../types/lessonStatusTypes';
import LessonStatusBadge from '@/domains/lessons/components/LessonStatusBadge';

interface LessonStatusFormProps {
  lessonStatus: LessonStatus;
  onSubmit: (data: LessonStatusFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function LessonStatusForm({ 
  lessonStatus, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: LessonStatusFormProps) {
  const form = useForm<LessonStatusFormData>({
    resolver: zodResolver(lessonStatusSchema),
    defaultValues: {
      description: lessonStatus.description ?? '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Read-only status name display */}
        <div className="space-y-2">
          <FormLabel className="text-white">Status Name</FormLabel>
          <div className="p-3 bg-white/5 border border-white/10 rounded-md">
            <LessonStatusBadge status={lessonStatus.name} size="md" />
          </div>
          <FormDescription className="text-white/50">
            Status names are predefined and cannot be changed
          </FormDescription>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  placeholder="Enter a description for this status..."
                  className="bg-white/10 border-white/20 text-white min-h-[100px] resize-none"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription className="text-white/50">
                Optional description to help users understand when to use this status
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            {isSubmitting ? 'Saving...' : 'Update Description'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default LessonStatusForm;

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ClassroomStatus } from '@/types/enums';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Classroom } from '@/domains/classrooms/classroomsSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FormButtons from '@/components/common/FormButtons';

const classroomSchema = z.object({
  name: z
    .string()
    .min(1, 'Classroom name is required')
    .max(50, 'Name must be less than 50 characters'),
  location: z
    .string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  capacity: z
    .number()
    .min(1, 'Capacity must be at least 1')
    .max(500, 'Capacity cannot exceed 500'),
  status: z.enum([
    ClassroomStatus.Active,
    ClassroomStatus.Inactive,
    ClassroomStatus.Maintenance,
  ]),
});

type ClassroomFormData = z.infer<typeof classroomSchema>;

interface ClassroomFormProps {
  classroom?: Classroom;
  onSubmit: (data: ClassroomFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ClassroomForm: React.FC<ClassroomFormProps> = ({
  classroom,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const form = useForm<ClassroomFormData>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      name: classroom?.name || '',
      location: classroom?.location || '',
      capacity: classroom?.capacity || 30,
      status: classroom?.status || ClassroomStatus.Active,
    },
  });

  const handleSubmit = (data: ClassroomFormData) => {
    onSubmit(data);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {' '}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">
                Classroom Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Room A-101"
                  {...field}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">
                Location
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Building A, First Floor"
                  {...field}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">
                Capacity *
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="30"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 0)
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />{' '}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-semibold">Status</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20">
                    <SelectItem
                      value="active"
                      className="text-white hover:bg-white/10"
                    >
                      Active
                    </SelectItem>
                    <SelectItem
                      value="inactive"
                      className="text-white hover:bg-white/10"
                    >
                      Inactive
                    </SelectItem>
                    <SelectItem
                      value="maintenance"
                      className="text-white hover:bg-white/10"
                    >
                      Maintenance
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
        <FormButtons
          submitText={classroom ? 'Update Classroom' : 'Add Classroom'}
          isLoading={isLoading}
          onCancel={onCancel}
        />
      </form>
    </Form>
  );
};

export default ClassroomForm;

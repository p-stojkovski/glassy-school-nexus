
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Classroom } from '../../store/slices/classroomsSlice';

const classroomSchema = z.object({
  name: z.string().min(1, 'Classroom name is required').max(50, 'Name must be less than 50 characters'),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(500, 'Capacity cannot exceed 500'),
  status: z.enum(['active', 'inactive', 'maintenance']),
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
      status: classroom?.status || 'active',
    },
  });

  const handleSubmit = (data: ClassroomFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Classroom Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Room A-101"
                  {...field}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Building A, First Floor"
                  {...field}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="30"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-4">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : (classroom ? 'Update Classroom' : 'Add Classroom')}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClassroomForm;

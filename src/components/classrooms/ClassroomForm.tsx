
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
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-800 font-semibold">Classroom Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Room A-101"
                    {...field}
                    className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-800 font-semibold">Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Building A, First Floor"
                    {...field}
                    className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-800 font-semibold">Capacity *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="30"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-800 font-semibold">Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white border-gray-200 text-gray-800 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="active" className="text-gray-800 hover:bg-blue-50">Active</SelectItem>
                    <SelectItem value="inactive" className="text-gray-800 hover:bg-blue-50">Inactive</SelectItem>
                    <SelectItem value="maintenance" className="text-gray-800 hover:bg-blue-50">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-600" />
              </FormItem>
            )}
          />

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isLoading ? 'Saving...' : (classroom ? 'Update Classroom' : 'Add Classroom')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ClassroomForm;

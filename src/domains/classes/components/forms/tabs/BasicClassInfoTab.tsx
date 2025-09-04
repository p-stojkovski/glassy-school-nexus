import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { GraduationCap, BookOpen, User, MapPin, Calendar, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ClassFormData } from '@/types/api/class';
import SubjectsDropdown from '@/components/common/SubjectsDropdown';
import TeachersDropdown from '@/components/common/TeachersDropdown';
import ClassroomsDropdown from '@/components/common/ClassroomsDropdown';

interface BasicClassInfoTabProps {
  form: UseFormReturn<ClassFormData>;
  // Remove teachers and classrooms props - components handle data themselves
}

const BasicClassInfoTab: React.FC<BasicClassInfoTabProps> = ({
  form,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Class Name *
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter class name"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subject */}
        <FormField
          control={form.control}
          name="subjectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Subject *
              </FormLabel>
              <FormControl>
                <SubjectsDropdown
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  placeholder="Select subject"
                  className="bg-white/10 border-white/20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teacher */}
        <FormField
          control={form.control}
          name="teacherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white flex items-center gap-2">
                <User className="w-4 h-4" />
                Assigned Teacher *
              </FormLabel>
              <FormControl>
                <TeachersDropdown
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  placeholder="Select teacher"
                  className="bg-white/10 border-white/20"
                  includeSubjectInfo={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Classroom */}
        <FormField
          control={form.control}
          name="classroomId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Assigned Classroom *
              </FormLabel>
              <FormControl>
                <ClassroomsDropdown
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  placeholder="Select classroom"
                  className="bg-white/10 border-white/20"
                  includeCapacityInfo={true}
                  includeLocationInfo={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Description
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Enter class description..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicClassInfoTab;

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { GraduationCap, BookOpen, User, MapPin, Calendar, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ClassFormData } from '@/types/api/class';
import SubjectsDropdown from '@/components/common/SubjectsDropdown';

interface BasicClassInfoTabProps {
  form: UseFormReturn<ClassFormData>;
  teachers: any[];
  classrooms: any[];
}

const BasicClassInfoTab: React.FC<BasicClassInfoTabProps> = ({
  form,
  teachers,
  classrooms,
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.length > 0 ? (
                      teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                          {teacher.subjectName && (
                            <span className="text-sm text-white/60 ml-2">
                              ({teacher.subjectName})
                            </span>
                          )}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-teachers" disabled>
                        No teachers available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select classroom" />
                  </SelectTrigger>
                  <SelectContent>
                    {classrooms.length > 0 ? (
                      classrooms.map((classroom) => (
                        <SelectItem key={classroom.id} value={classroom.id}>
                          {classroom.name}
                          {classroom.capacity && (
                            <span className="text-sm text-white/60 ml-2">
                              (Capacity: {classroom.capacity})
                            </span>
                          )}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-classrooms" disabled>
                        No classrooms available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
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

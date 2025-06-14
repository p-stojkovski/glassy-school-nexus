
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Teacher, addTeacher, updateTeacher } from '../teachersSlice';
import { toast } from '@/hooks/use-toast';

const teacherSchema = z.object({
  name: z.string().min(1, 'Full name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  status: z.enum(['active', 'inactive']),
  notes: z.string().optional(),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  teacher?: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
}

const TeacherForm: React.FC<TeacherFormProps> = ({ teacher, isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: teacher?.name || '',
      email: teacher?.email || '',
      phone: teacher?.phone || '',
      subject: teacher?.subject || '',
      status: teacher?.status || 'active',
      notes: '',
    },
  });

  const handleSubmit = async (data: TeacherFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (teacher) {
        const updatedTeacher: Teacher = {
          ...teacher,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          subject: data.subject,
          status: data.status,
        };
        dispatch(updateTeacher(updatedTeacher));
        toast({
          title: "Teacher Updated",
          description: `${data.name} has been successfully updated.`,
        });
      } else {
        const newTeacher: Teacher = {
          id: Date.now().toString(),
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          subject: data.subject,
          status: data.status,
          avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150`,
          joinDate: new Date().toISOString(),
          classIds: [],
        };
        dispatch(addTeacher(newTeacher));
        toast({
          title: "Teacher Added",
          description: `${data.name} has been successfully added.`,
        });
      }
      
      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto"
      >
        <SheetHeader className="pb-6 border-b border-white/20">
          <SheetTitle className="text-2xl font-bold text-white">
            {teacher ? 'Edit Teacher' : 'Add New Teacher'}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter full name"
                        {...field}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-amber-600 focus:ring-amber-600"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        {...field}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-amber-600 focus:ring-amber-600"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter phone number"
                        {...field}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-amber-600 focus:ring-amber-600"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">Subject *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-white/20">
                        <SelectItem value="Grammar & Writing" className="text-white hover:bg-white/10">Grammar & Writing</SelectItem>
                        <SelectItem value="Conversation & Speaking" className="text-white hover:bg-white/10">Conversation & Speaking</SelectItem>
                        <SelectItem value="Reading & Comprehension" className="text-white hover:bg-white/10">Reading & Comprehension</SelectItem>
                        <SelectItem value="Listening & Pronunciation" className="text-white hover:bg-white/10">Listening & Pronunciation</SelectItem>
                        <SelectItem value="Business English" className="text-white hover:bg-white/10">Business English</SelectItem>
                        <SelectItem value="IELTS Preparation" className="text-white hover:bg-white/10">IELTS Preparation</SelectItem>
                        <SelectItem value="TOEFL Preparation" className="text-white hover:bg-white/10">TOEFL Preparation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">Employment Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-white/20">
                        <SelectItem value="active" className="text-white hover:bg-white/10">Active</SelectItem>
                        <SelectItem value="inactive" className="text-white hover:bg-white/10">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any additional notes..."
                        {...field}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-6 border-t border-white/20">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : (teacher ? 'Update Teacher' : 'Add Teacher')}                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-white/20 font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TeacherForm;

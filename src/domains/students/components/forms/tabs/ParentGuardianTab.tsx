import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { StudentFormData } from '@/types/api/student';

interface ParentGuardianTabProps {
  form: UseFormReturn<StudentFormData>;
}

const ParentGuardianTab: React.FC<ParentGuardianTabProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <FormField
        control={form.control}
        name="parentContact"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-semibold">
              Contact *
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Parent name and phone number"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
              />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="parentEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-semibold">
              Email *
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                placeholder="Enter parent/guardian email address"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
              />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ParentGuardianTab;


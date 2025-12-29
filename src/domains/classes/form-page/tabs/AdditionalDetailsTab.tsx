import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FileText, Target, Book, List } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { ClassFormData } from '@/types/api/class';

interface AdditionalDetailsTabProps {
  form: UseFormReturn<ClassFormData>;
}

const AdditionalDetailsTab: React.FC<AdditionalDetailsTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description
            </FormLabel>
            <FormDescription className="text-xs text-white/50">
              Brief overview of this class
            </FormDescription>
            <FormControl>
              <Textarea
                {...field}
                placeholder="e.g., This intermediate conversation class focuses on..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[72px]"
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Objectives */}
      <FormField
        control={form.control}
        name="objectives"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white flex items-center gap-2">
              <Target className="w-4 h-4" />
              Learning Objectives
            </FormLabel>
            <FormDescription className="text-xs text-white/50">
              What students will learn (one per line)
            </FormDescription>
            <FormControl>
              <Textarea
                {...field}
                placeholder="e.g., Students will be able to hold 5-minute conversations&#10;Students will learn 50 new vocabulary words"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[72px]"
                value={Array.isArray(field.value) ? field.value.join('\n') : field.value || ''}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').filter(line => line.trim());
                  field.onChange(lines.length > 0 ? lines : null);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Requirements */}
      <FormField
        control={form.control}
        name="requirements"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white flex items-center gap-2">
              <List className="w-4 h-4" />
              Requirements
            </FormLabel>
            <FormDescription className="text-xs text-white/50">
              Prerequisites or prior knowledge needed
            </FormDescription>
            <FormControl>
              <Textarea
                {...field}
                placeholder="e.g., Students should be comfortable with basic A2 grammar"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[72px]"
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Materials */}
      <FormField
        control={form.control}
        name="materials"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white flex items-center gap-2">
              <Book className="w-4 h-4" />
              Materials & Resources
            </FormLabel>
            <FormDescription className="text-xs text-white/50">
              Books, supplies, or resources (one per line)
            </FormDescription>
            <FormControl>
              <Textarea
                {...field}
                placeholder="e.g., English File Intermediate textbook&#10;Notebook for vocabulary"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[72px]"
                value={Array.isArray(field.value) ? field.value.join('\n') : field.value || ''}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').filter(line => line.trim());
                  field.onChange(lines.length > 0 ? lines : null);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AdditionalDetailsTab;

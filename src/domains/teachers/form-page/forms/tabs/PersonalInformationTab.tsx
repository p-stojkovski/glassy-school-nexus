import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
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
import { TeacherFormData, SubjectDto } from '@/types/api/teacher';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PersonalInformationTabProps {
  form: UseFormReturn<TeacherFormData>;
  subjects: SubjectDto[];
  emailAvailability?: {
    shouldCheckAvailability: boolean;
    debouncedEmail: string;
    isCheckingEmail: boolean;
    emailAvailable: boolean | null;
    emailCheckError: string | null;
    originalEmail: string;
  };
}

const PersonalInformationTab: React.FC<PersonalInformationTabProps> = ({
  form,
  subjects,
  emailAvailability,
}) => {
  const ea = emailAvailability;

  // Guard and memoized sorted subjects
  const sortedSubjects = React.useMemo(
    () => (Array.isArray(subjects) ? [...subjects].sort((a, b) => a.sortOrder - b.sortOrder) : []),
    [subjects]
  );
  const isSubjectsEmpty = sortedSubjects.length === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-lg">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-semibold">
              Full Name *
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter full name"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
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
            <FormLabel className="text-white font-semibold">
              Email Address *
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter email address"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 pr-10"
                />
                {ea && ea.shouldCheckAvailability && ea.debouncedEmail && ea.debouncedEmail.trim() && ea.debouncedEmail !== (ea.originalEmail || '') && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {ea.isCheckingEmail ? (
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" title="Checking availability..." />
                    ) : ea.emailCheckError ? (
                      <XCircle className="w-4 h-4 text-red-400" title={`Error: ${ea.emailCheckError}`} />
                    ) : ea.emailAvailable === true ? (
                      <CheckCircle className="w-4 h-4 text-green-400" title="Email is available" />
                    ) : ea.emailAvailable === false ? (
                      <XCircle className="w-4 h-4 text-red-400" title="Email is already taken" />
                    ) : null}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage className="text-red-300" />
            {ea && ea.shouldCheckAvailability && ea.debouncedEmail && ea.debouncedEmail.trim() && ea.debouncedEmail !== (ea.originalEmail || '') && !ea.isCheckingEmail && (
              <div className="text-xs mt-1">
                {ea.emailCheckError ? (
                  <span className="text-red-300">Error checking availability: {ea.emailCheckError}</span>
                ) : ea.emailAvailable === true ? (
                  <span className="text-green-300 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />"{ea.debouncedEmail}" is available
                  </span>
                ) : ea.emailAvailable === false ? (
                  <span className="text-red-300 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />"{ea.debouncedEmail}" is already taken
                  </span>
                ) : null}
              </div>
            )}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-semibold">
              Phone Number
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter phone number"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
              />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="subjectId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-semibold">
              Subject *
            </FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger
                  disabled={isSubjectsEmpty}
                  className="bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <SelectValue placeholder={isSubjectsEmpty ? 'No subjects available' : 'Select subject'} />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-gray-900/95 border-white/20">
                {isSubjectsEmpty ? (
                  <div className="px-3 py-2 text-white/60 text-sm">No subjects available</div>
                ) : (
                  sortedSubjects.map((subject) => (
                    <SelectItem
                      key={subject.id}
                      value={subject.id}
                      className="text-white hover:bg-white/10 focus:bg-white/10"
                    >
                      {subject.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PersonalInformationTab;

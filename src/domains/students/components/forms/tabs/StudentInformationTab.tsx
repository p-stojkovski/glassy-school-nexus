import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FriendlyDatePicker from '@/components/common/FriendlyDatePicker';
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
import { StudentFormData } from '@/types/api/student';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface StudentInformationTabProps {
  form: UseFormReturn<StudentFormData>;
  emailAvailability?: {
    shouldCheckAvailability: boolean;
    debouncedEmail: string;
    isCheckingEmail: boolean;
    emailAvailable: boolean | null;
    emailCheckError: string | null;
    originalEmail: string;
  };
}

const StudentInformationTab: React.FC<StudentInformationTabProps> = ({ form, emailAvailability }) => {
  const ea = emailAvailability;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-semibold">
              First Name *
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter first name"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
              />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-semibold">
              Last Name *
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter last name"
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
        name="isActive"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-semibold">
              Status *
            </FormLabel>
            <Select
              onValueChange={(value) => field.onChange(value === 'true')}
              defaultValue={field.value ? 'true' : 'false'}
            >
              <FormControl>
                <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="enrollmentDate"
        render={({ field, fieldState }) => (
          <FormItem className="flex flex-col">
            <FormControl>
              <FriendlyDatePicker
                value={field.value}
                onChange={field.onChange}
                label="Enrollment Date"
                required
                placeholder="Select enrollment date"
                error={fieldState.error?.message}
                maxDate={new Date()}
                minDate={new Date('1900-01-01')}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dateOfBirth"
        render={({ field, fieldState }) => (
          <FormItem className="flex flex-col">
            <FormControl>
              <FriendlyDatePicker
                value={field.value}
                onChange={field.onChange}
                label="Date of Birth"
                required={false}
                placeholder="Select date of birth (optional)"
                error={fieldState.error?.message}
                maxDate={new Date()}
                minDate={new Date('1950-01-01')}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="placeOfBirth"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white font-semibold">
              Place of Birth
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter place of birth (optional)"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
              />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel className="text-white font-semibold">
              Additional Notes
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Any additional information about the student"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 min-h-[100px] resize-none"
              />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default StudentInformationTab;

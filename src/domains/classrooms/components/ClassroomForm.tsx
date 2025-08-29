import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDebounce } from '@/hooks/useDebounce';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

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
import { 
  createClassroomSchema, 
  updateClassroomSchema,
  CreateClassroomFormData,
  UpdateClassroomFormData,
} from '@/utils/validation/classroomValidators';
import { ClassroomValidationRules } from '@/types/api/classroom';

// Use the exact API validation schemas
const classroomSchema = createClassroomSchema;

type ClassroomFormData = CreateClassroomFormData;

interface ClassroomFormProps {
  classroom?: Classroom;
  onSubmit: (data: ClassroomFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  checkNameAvailability?: (name: string, excludeId?: string) => void;
  nameAvailability?: {
    [name: string]: {
      isAvailable: boolean;
      isChecking: boolean;
      error: string | null;
    };
  };
  onFormStateChange?: (hasErrors: boolean) => void;
}

const ClassroomForm: React.FC<ClassroomFormProps> = ({
  classroom,
  onSubmit,
  onCancel,
  isLoading = false,
  checkNameAvailability,
  nameAvailability = {},
  onFormStateChange,
}) => {
  // Use different schemas for create vs update
  const isUpdate = !!classroom;
  const schema = isUpdate ? updateClassroomSchema : createClassroomSchema;
  
  const form = useForm<ClassroomFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: classroom?.name || '',
      location: classroom?.location || '',
      capacity: classroom?.capacity || ClassroomValidationRules.CAPACITY.DEFAULT,
    },
  });

  // Watch the name field for real-time availability checking
  const nameValue = form.watch('name');
  const debouncedName = useDebounce(nameValue, 300); // 300ms debounce
  
  // State for tracking if we should check availability
  const [shouldCheckAvailability, setShouldCheckAvailability] = useState(false);

// Hold latest callback in a ref to avoid effect retrigger on identity changes
  const checkNameAvailabilityRef = useRef<typeof checkNameAvailability>();
  useEffect(() => {
    checkNameAvailabilityRef.current = checkNameAvailability;
  }, [checkNameAvailability]);

  // Track last checked key to avoid rechecking the same value
  const lastCheckedKeyRef = useRef<string | null>(null);

  // Effect to check name availability when debounced name changes
  useEffect(() => {
    const trimmed = (debouncedName || '').trim();

    // Guards: non-empty, meets min length, not the same as current classroom name, user is typing
    if (!trimmed) return;
    if (trimmed.length < ClassroomValidationRules.NAME.MIN_LENGTH) return;
    if (trimmed === (classroom?.name || '').trim()) return;
    if (!shouldCheckAvailability) return;

    // Only check availability when there are no validation errors on the name field
    const hasLocalError = !!form.getFieldState('name').error;
    if (hasLocalError) return;

    const checkKey = `${trimmed}-${classroom?.id || 'new'}`;
    if (lastCheckedKeyRef.current === checkKey) return;

    checkNameAvailabilityRef.current?.(trimmed, classroom?.id);
    lastCheckedKeyRef.current = checkKey;
  }, [debouncedName, classroom?.name, classroom?.id, shouldCheckAvailability, form, form.formState.errors.name]);

  // Enable availability checking when user starts typing
  useEffect(() => {
    if (nameValue && nameValue !== classroom?.name) {
      setShouldCheckAvailability(true);
    } else {
      setShouldCheckAvailability(false);
    }
  }, [nameValue, classroom?.name]);

  // Notify parent of form validation state changes
  useEffect(() => {
    if (onFormStateChange) {
      const hasErrors = Object.keys(form.formState.errors).length > 0;
      onFormStateChange(hasErrors);
    }
  }, [form.formState.errors, onFormStateChange]);

  // Get availability status for current name
  const currentNameAvailability = nameAvailability[debouncedName?.trim() || ''];
  const hasNameError = !!form.getFieldState('name').error;
  const showAvailabilityIndicator =
    shouldCheckAvailability &&
    !hasNameError &&
    !!debouncedName &&
    !!debouncedName.trim() &&
    debouncedName !== classroom?.name;

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
                <div className="relative">
                  <Input
                    placeholder="e.g., Room A-101, Lab 205, Conference Room B"
                    {...field}
                    maxLength={ClassroomValidationRules.NAME.MAX_LENGTH}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 pr-10"
                  />
                  {showAvailabilityIndicator && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {currentNameAvailability?.isChecking ? (
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" title="Checking availability..." />
                      ) : currentNameAvailability?.error ? (
                        <XCircle className="w-4 h-4 text-red-400" title={`Error: ${currentNameAvailability.error}`} />
                      ) : currentNameAvailability?.isAvailable ? (
                        <CheckCircle className="w-4 h-4 text-green-400" title="Name is available" />
                      ) : currentNameAvailability && !currentNameAvailability.isAvailable ? (
                        <XCircle className="w-4 h-4 text-red-400" title="Name is already taken" />
                      ) : null}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage className="text-red-300" />
              
              {/* Availability status message */}
              {showAvailabilityIndicator && currentNameAvailability && !currentNameAvailability.isChecking && (
                <div className="text-xs mt-1">
                  {currentNameAvailability.error ? (
                    <span className="text-red-300">
                      Error checking availability: {currentNameAvailability.error}
                    </span>
                  ) : currentNameAvailability.isAvailable ? (
                    <span className="text-green-300 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      "{debouncedName}" is available
                    </span>
                  ) : (
                    <span className="text-red-300 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      "{debouncedName}" is already taken
                    </span>
                  )}
                </div>
              )}
              
              <p className="text-xs text-white/60 mt-1">
                {ClassroomValidationRules.NAME.MIN_LENGTH}-{ClassroomValidationRules.NAME.MAX_LENGTH} characters. Letters, numbers, spaces, and basic punctuation allowed.
              </p>
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
                  placeholder="e.g., Building A, First Floor, Room #205, North Wing"
                  {...field}
                  maxLength={ClassroomValidationRules.LOCATION.MAX_LENGTH}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
              <p className="text-xs text-white/60 mt-1">
                Optional. Max {ClassroomValidationRules.LOCATION.MAX_LENGTH} characters. Can include building names, floor numbers, and directions.
              </p>
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
                  type="text"
                  placeholder={ClassroomValidationRules.CAPACITY.DEFAULT.toString()}
                  {...field}
                  maxLength={2}
                  onChange={(e) => {
                    let inputValue = e.target.value;
                    // Allow empty input for editing
                    if (inputValue === '') {
                      field.onChange('');
                      return;
                    }
                    // Keep only digits and limit to 2 characters; strip +, -, and any other non-digits
                    inputValue = inputValue.replace(/\D/g, '').slice(0, 2);
                    if (inputValue === '') {
                      field.onChange('');
                      return;
                    }
                    const numericValue = parseInt(inputValue, 10);
                    if (!isNaN(numericValue)) {
                      field.onChange(numericValue);
                    }
                  }}
                  inputMode="numeric"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                />
              </FormControl>
              <FormMessage className="text-red-300" />
              <p className="text-xs text-white/60 mt-1">
                Maximum number of students. Range: {ClassroomValidationRules.CAPACITY.MIN}-{ClassroomValidationRules.CAPACITY.MAX} students.
              </p>
            </FormItem>
          )}
        />
        <FormButtons
          submitText={classroom ? 'Update Classroom' : 'Add Classroom'}
          isLoading={isLoading}
          onCancel={onCancel}
          disabled={
            !form.formState.isValid ||
            (showAvailabilityIndicator && !!currentNameAvailability?.isChecking) ||
            (showAvailabilityIndicator && currentNameAvailability !== undefined && currentNameAvailability.isAvailable === false)
          }
        />
      </form>
    </Form>
  );
};

export default ClassroomForm;

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2, User, Users, DollarSign, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { NativeDateInput } from '@/components/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import GlassCard from '@/components/common/GlassCard';
import { Student } from '@/domains/students/studentsSlice';
import { StudentFormData, UpdateStudentRequest } from '@/types/api/student';
import { createStudentSchema } from '@/utils/validation/studentValidators';
import { useDebounce } from '@/hooks/useDebounce';
import { useDiscountTypes } from '@/hooks/useDiscountTypes';
import { studentApiService, checkStudentEmailAvailable } from '@/services/studentApiService';
import { CheckCircle, XCircle } from 'lucide-react';
import DiscountTypesDropdown from '@/components/common/DiscountTypesDropdown';

// Section identifiers for deep linking
export type StudentDetailSection = 'student-info' | 'guardian-info' | 'financial-info';

interface StudentDetailsTabProps {
  student: Student;
  onUpdate: (updatedStudent: Student) => void;
  focusSection?: StudentDetailSection | null;
  onFocusSectionHandled?: () => void;
}

type SectionMode = 'view' | 'edit';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SectionState {
  mode: SectionMode;
  saveStatus: SaveStatus;
  errorMessage?: string;
}

const AUTOSAVE_DELAY = 600; // ms

/**
 * StudentDetailsTab - Main editable details component for student profile
 * Follows the ClassInfoTab pattern with inline editing and autosave
 */
const StudentDetailsTab: React.FC<StudentDetailsTabProps> = ({
  student,
  onUpdate,
  focusSection,
  onFocusSectionHandled,
}) => {
  // Permissions disabled for now - always allow editing
  const canEdit = true;
  const canEditFinance = true;
  
  const { discountTypes } = useDiscountTypes();
  
  // Section refs for scrolling
  const studentInfoRef = React.useRef<HTMLDivElement>(null);
  const guardianInfoRef = React.useRef<HTMLDivElement>(null);
  const financialInfoRef = React.useRef<HTMLDivElement>(null);
  
  // Section states
  const [studentInfoState, setStudentInfoState] = useState<SectionState>({ mode: 'view', saveStatus: 'idle' });
  const [guardianInfoState, setGuardianInfoState] = useState<SectionState>({ mode: 'view', saveStatus: 'idle' });
  const [financialInfoState, setFinancialInfoState] = useState<SectionState>({ mode: 'view', saveStatus: 'idle' });
  
  // Form state
  const form = useForm<StudentFormData>({
    resolver: zodResolver(createStudentSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth || '',
      enrollmentDate: student.enrollmentDate || '',
      isActive: student.isActive ?? true,
      parentContact: student.parentContact || '',
      parentEmail: student.parentEmail || '',
      placeOfBirth: student.placeOfBirth || '',
      notes: student.notes || '',
      hasDiscount: student.hasDiscount || false,
      discountTypeId: student.discountTypeId || '',
      discountAmount: student.discountAmount || 0,
    },
  });

  // Reset form when student changes
  useEffect(() => {
    form.reset({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth || '',
      enrollmentDate: student.enrollmentDate || '',
      isActive: student.isActive ?? true,
      parentContact: student.parentContact || '',
      parentEmail: student.parentEmail || '',
      placeOfBirth: student.placeOfBirth || '',
      notes: student.notes || '',
      hasDiscount: student.hasDiscount || false,
      discountTypeId: student.discountTypeId || '',
      discountAmount: student.discountAmount || 0,
    });
  }, [student, form]);
  
  // Email availability checking
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const emailValue = form.watch('email');
  const debouncedEmail = useDebounce(emailValue, 300);
  
  useEffect(() => {
    const trimmed = (debouncedEmail || '').trim().toLowerCase();
    if (!trimmed || trimmed === (student.email || '').toLowerCase()) {
      setEmailAvailable(null);
      setIsCheckingEmail(false);
      return;
    }
    
    let cancelled = false;
    (async () => {
      setIsCheckingEmail(true);
      try {
        const available = await checkStudentEmailAvailable(trimmed, student.id);
        if (!cancelled) {
          setEmailAvailable(available);
        }
      } catch {
        if (!cancelled) setEmailAvailable(null);
      } finally {
        if (!cancelled) setIsCheckingEmail(false);
      }
    })();
    
    return () => { cancelled = true; };
  }, [debouncedEmail, student.id, student.email]);

  // Handle focus section navigation
  useEffect(() => {
    if (focusSection) {
      const refMap: Record<StudentDetailSection, React.RefObject<HTMLDivElement>> = {
        'student-info': studentInfoRef,
        'guardian-info': guardianInfoRef,
        'financial-info': financialInfoRef,
      };
      
      const ref = refMap[focusSection];
      if (ref?.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Auto-enter edit mode for the focused section if user has permission
        if (canEdit) {
          if (focusSection === 'student-info') {
            setStudentInfoState({ mode: 'edit', saveStatus: 'idle' });
          } else if (focusSection === 'guardian-info') {
            setGuardianInfoState({ mode: 'edit', saveStatus: 'idle' });
          } else if (focusSection === 'financial-info' && canEditFinance) {
            setFinancialInfoState({ mode: 'edit', saveStatus: 'idle' });
          }
        }
      }
      
      onFocusSectionHandled?.();
    }
  }, [focusSection, onFocusSectionHandled, canEdit, canEditFinance]);

  // Autosave handler
  const performSave = useCallback(async (section: StudentDetailSection) => {
    const formData = form.getValues();
    const isValid = await form.trigger();
    
    if (!isValid) {
      const setState = section === 'student-info' ? setStudentInfoState :
                       section === 'guardian-info' ? setGuardianInfoState :
                       setFinancialInfoState;
      setState(prev => ({ ...prev, saveStatus: 'error', errorMessage: 'Please fix validation errors' }));
      return;
    }
    
    const setState = section === 'student-info' ? setStudentInfoState :
                     section === 'guardian-info' ? setGuardianInfoState :
                     setFinancialInfoState;
    
    setState(prev => ({ ...prev, saveStatus: 'saving' }));
    
    try {
      const request: UpdateStudentRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        enrollmentDate: formData.enrollmentDate,
        isActive: formData.isActive,
        parentContact: formData.parentContact || undefined,
        parentEmail: formData.parentEmail || undefined,
        placeOfBirth: formData.placeOfBirth || undefined,
        notes: formData.notes || undefined,
        hasDiscount: formData.hasDiscount,
        discountTypeId: formData.hasDiscount ? formData.discountTypeId : undefined,
        discountAmount: formData.discountAmount || 0,
      };
      
      const updatedStudent = await studentApiService.updateStudent(student.id, request);
      onUpdate(updatedStudent);
      setState(prev => ({ ...prev, saveStatus: 'saved', errorMessage: undefined }));
      
      // Clear saved status after 2 seconds
      setTimeout(() => {
        setState(prev => prev.saveStatus === 'saved' ? { ...prev, saveStatus: 'idle' } : prev);
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save changes';
      setState(prev => ({
        ...prev,
        saveStatus: 'error',
        errorMessage,
      }));
    }
  }, [form, student.id, onUpdate]);

  // Debounced form values for autosave
  const watchedValues = form.watch();
  const debouncedValues = useDebounce(watchedValues, AUTOSAVE_DELAY);
  const [lastSavedValues, setLastSavedValues] = useState(watchedValues);
  
  // Autosave effect - triggers when debounced values change and a section is in edit mode
  useEffect(() => {
    const hasStudentInfoChanges = studentInfoState.mode === 'edit' && (
      debouncedValues.firstName !== lastSavedValues.firstName ||
      debouncedValues.lastName !== lastSavedValues.lastName ||
      debouncedValues.email !== lastSavedValues.email ||
      debouncedValues.phone !== lastSavedValues.phone ||
      debouncedValues.dateOfBirth !== lastSavedValues.dateOfBirth ||
      debouncedValues.enrollmentDate !== lastSavedValues.enrollmentDate ||
      debouncedValues.isActive !== lastSavedValues.isActive ||
      debouncedValues.placeOfBirth !== lastSavedValues.placeOfBirth ||
      debouncedValues.notes !== lastSavedValues.notes
    );
    
    const hasGuardianChanges = guardianInfoState.mode === 'edit' && (
      debouncedValues.parentContact !== lastSavedValues.parentContact ||
      debouncedValues.parentEmail !== lastSavedValues.parentEmail
    );
    
    const hasFinancialChanges = financialInfoState.mode === 'edit' && (
      debouncedValues.hasDiscount !== lastSavedValues.hasDiscount ||
      debouncedValues.discountTypeId !== lastSavedValues.discountTypeId ||
      debouncedValues.discountAmount !== lastSavedValues.discountAmount
    );
    
    if (hasStudentInfoChanges) {
      performSave('student-info');
      setLastSavedValues(prev => ({ ...prev, ...debouncedValues }));
    } else if (hasGuardianChanges) {
      performSave('guardian-info');
      setLastSavedValues(prev => ({ ...prev, ...debouncedValues }));
    } else if (hasFinancialChanges) {
      performSave('financial-info');
      setLastSavedValues(prev => ({ ...prev, ...debouncedValues }));
    }
  }, [debouncedValues, lastSavedValues, studentInfoState.mode, guardianInfoState.mode, financialInfoState.mode, performSave]);

  // Section header with status
  const SectionHeader: React.FC<{
    title: string;
    icon: React.ReactNode;
    state: SectionState;
    onEdit: () => void;
    onCancel: () => void;
    canEdit: boolean;
  }> = ({ title, icon, state, onEdit, onCancel, canEdit: sectionCanEdit }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-lg">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        
        {/* Save status indicator */}
        {state.mode === 'edit' && (
          <div className="flex items-center gap-2 ml-3">
            {state.saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-sm text-blue-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </span>
            )}
            {state.saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-sm text-green-400">
                <Check className="w-3 h-3" />
                Saved
              </span>
            )}
            {state.saveStatus === 'error' && (
              <span className="flex items-center gap-1 text-sm text-red-400">
                <AlertCircle className="w-3 h-3" />
                {state.errorMessage || 'Error saving'}
              </span>
            )}
          </div>
        )}
      </div>
      
      {sectionCanEdit && (
        <div>
          {state.mode === 'view' ? (
            <Button
              onClick={onEdit}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          ) : (
            <Button
              onClick={onCancel}
              size="sm"
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              Done
            </Button>
          )}
        </div>
      )}
    </div>
  );

  // Value display for read-only mode
  const ValueDisplay: React.FC<{ label: string; value?: string | null; className?: string }> = ({ 
    label, 
    value,
    className = '' 
  }) => (
    <div className={className}>
      <p className="text-sm text-white/60 mb-1">{label}</p>
      <p className="text-white">{value || '—'}</p>
    </div>
  );

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth?: string): string | null => {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return `${age} years old`;
  };

  // Get discount type name
  const getDiscountTypeName = (discountTypeId?: string): string | null => {
    if (!discountTypeId) return null;
    const discountType = discountTypes.find(dt => dt.id.toString() === discountTypeId);
    return discountType?.name || null;
  };

  // Discount amount requirement
  const hasDiscount = form.watch('hasDiscount');
  const selectedDiscountTypeId = form.watch('discountTypeId');
  const selectedDiscountType = useMemo(() => {
    return discountTypes.find((dt) => dt.id.toString() === selectedDiscountTypeId);
  }, [discountTypes, selectedDiscountTypeId]);
  const isAmountRequired = !!(hasDiscount && selectedDiscountType?.requiresAmount);
  const isAmountDisabled = selectedDiscountType && !selectedDiscountType.requiresAmount;

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Student Information Section */}
        <div ref={studentInfoRef}>
          <GlassCard className="p-4">
            <SectionHeader
              title="Student Information"
              icon={<User className="w-5 h-5 text-blue-400" />}
              state={studentInfoState}
              onEdit={() => setStudentInfoState({ mode: 'edit', saveStatus: 'idle' })}
            onCancel={() => {
              setStudentInfoState({ mode: 'view', saveStatus: 'idle' });
              form.reset();
            }}
            canEdit={canEdit}
          />
          
          {studentInfoState.mode === 'view' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ValueDisplay label="First Name" value={student.firstName} />
              <ValueDisplay label="Last Name" value={student.lastName} />
              <ValueDisplay label="Email" value={student.email} />
              <ValueDisplay label="Phone" value={student.phone} />
              <ValueDisplay 
                label="Date of Birth" 
                value={student.dateOfBirth ? `${new Date(student.dateOfBirth).toLocaleDateString()} (${calculateAge(student.dateOfBirth)})` : undefined} 
              />
              <ValueDisplay label="Place of Birth" value={student.placeOfBirth} />
              <ValueDisplay 
                label="Enrollment Date" 
                value={student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : undefined} 
              />
              <ValueDisplay label="Status" value={student.isActive ? 'Active' : 'Inactive'} />
              <ValueDisplay label="Notes" value={student.notes} className="md:col-span-2" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">First Name *</FormLabel>
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
                    <FormLabel className="text-white font-semibold">Last Name *</FormLabel>
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
                    <FormLabel className="text-white font-semibold">Email Address *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter email address"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 pr-10"
                        />
                        {debouncedEmail && debouncedEmail.trim() && debouncedEmail !== (student.email || '') && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {isCheckingEmail ? (
                              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                            ) : emailAvailable === true ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : emailAvailable === false ? (
                              <XCircle className="w-4 h-4 text-red-400" />
                            ) : null}
                          </div>
                        )}
                      </div>
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
                    <FormLabel className="text-white font-semibold">Status *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'true')}
                      value={field.value ? 'true' : 'false'}
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
                      <NativeDateInput
                        value={field.value}
                        onChange={field.onChange}
                        label="Enrollment Date"
                        required
                        placeholder="Select enrollment date"
                        error={fieldState.error?.message}
                        max={new Date().toISOString().split('T')[0]}
                        min={new Date('1900-01-01').toISOString().split('T')[0]}
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
                      <NativeDateInput
                        value={field.value}
                        onChange={field.onChange}
                        label="Date of Birth"
                        required={false}
                        placeholder="Select date of birth"
                        error={fieldState.error?.message}
                        max={new Date().toISOString().split('T')[0]}
                        min={new Date('1950-01-01').toISOString().split('T')[0]}
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
                    <FormLabel className="text-white font-semibold">Place of Birth</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter place of birth"
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
                    <FormLabel className="text-white font-semibold">Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Any additional information"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 min-h-[80px] resize-none"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
            </div>
          )}
        </GlassCard>
        </div>

        {/* Parent/Guardian Information Section */}
        <div ref={guardianInfoRef}>
        <GlassCard className="p-4">
          <SectionHeader
            title="Parent/Guardian Information"
            icon={<Users className="w-5 h-5 text-purple-400" />}
            state={guardianInfoState}
            onEdit={() => setGuardianInfoState({ mode: 'edit', saveStatus: 'idle' })}
            onCancel={() => {
              setGuardianInfoState({ mode: 'view', saveStatus: 'idle' });
              form.reset();
            }}
            canEdit={canEdit}
          />
          
          {guardianInfoState.mode === 'view' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ValueDisplay label="Contact (Name & Phone)" value={student.parentContact} />
              <ValueDisplay label="Email" value={student.parentEmail} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="parentContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold">Contact *</FormLabel>
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
                    <FormLabel className="text-white font-semibold">Email *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter parent/guardian email"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
            </div>
          )}
        </GlassCard>
        </div>

        {/* Financial Information Section */}
        <div ref={financialInfoRef}>
        <GlassCard className="p-4">
          <SectionHeader
            title="Financial Information"
            icon={<DollarSign className="w-5 h-5 text-amber-400" />}
            state={financialInfoState}
            onEdit={() => setFinancialInfoState({ mode: 'edit', saveStatus: 'idle' })}
            onCancel={() => {
              setFinancialInfoState({ mode: 'view', saveStatus: 'idle' });
              form.reset();
            }}
            canEdit={canEditFinance}
          />
          
          {financialInfoState.mode === 'view' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ValueDisplay label="Has Discount" value={student.hasDiscount ? 'Yes' : 'No'} />
              {student.hasDiscount && (
                <>
                  <ValueDisplay label="Discount Type" value={getDiscountTypeName(student.discountTypeId) || student.discountTypeName} />
                  <ValueDisplay 
                    label="Discount Amount" 
                    value={student.discountAmount ? `${student.discountAmount} MKD` : '—'} 
                  />
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="hasDiscount"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue('discountTypeId', '');
                            form.setValue('discountAmount', 0);
                          }
                        }}
                        className="data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-white font-semibold">Enable Discount</FormLabel>
                      <p className="text-white/60 text-sm">
                        Check this box to enable discount options
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              {hasDiscount && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="discountTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-semibold">Discount Type *</FormLabel>
                        <FormControl>
                          <DiscountTypesDropdown
                            value={field.value || ''}
                            onValueChange={(value) => {
                              field.onChange(value);
                              const discountType = discountTypes.find(dt => dt.id.toString() === value);
                              if (discountType && !discountType.requiresAmount) {
                                form.setValue('discountAmount', 0);
                              }
                            }}
                            placeholder="Select discount type"
                            className="focus:border-yellow-400 focus:ring-yellow-400"
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="discountAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white font-semibold">
                          Discount Amount {isAmountRequired && '*'} (MKD)
                          {isAmountDisabled && (
                            <span className="text-white/60 text-sm ml-2">(Not required)</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="1"
                            placeholder={isAmountDisabled ? '0' : 'Enter discount amount'}
                            disabled={isAmountDisabled}
                            className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400 ${
                              isAmountDisabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onChange={(e) => {
                              const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                              field.onChange(value);
                            }}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </GlassCard>
        </div>
      </div>
    </Form>
  );
};

export default StudentDetailsTab;

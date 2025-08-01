import React, { useMemo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Phone, DollarSign, Circle } from 'lucide-react';
import { StudentStatus, DiscountType } from '@/types/enums';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import FormButtons from '@/components/common/FormButtons';
import GlassCard from '@/components/common/GlassCard';
import { Student } from '@/domains/students/studentsSlice';
import { cn } from '@/lib/utils';
import StudentInformationTab from './tabs/StudentInformationTab';
import ParentGuardianTab from './tabs/ParentGuardianTab';
import FinancialInformationTab from './tabs/FinancialInformationTab';

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional(),
  status: z.enum([StudentStatus.Active, StudentStatus.Inactive]),
  parentContact: z.string().optional(),
  parentEmail: z
    .string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate <= today;
    }, 'Date of birth cannot be in the future'),
  joiningDate: z
    .string()
    .min(1, 'Joining date is required')
    .refine((date) => {
      const joinDate = new Date(date);
      const today = new Date();
      return joinDate <= today;
    }, 'Joining date cannot be in the future'),
  placeOfBirth: z.string().optional(),
  notes: z.string().optional(),
  // Discount fields
  hasDiscount: z.boolean().optional(),
  discountType: z.enum([
    DiscountType.Relatives,
    DiscountType.SocialCase,
    DiscountType.SingleParent,
    DiscountType.FreeOfCharge,
  ]).optional(),
  discountAmount: z
    .number()
    .min(0, 'Discount amount must be positive')
    .optional()
    .or(z.literal(0)),
}).refine(
  (data) => {
    // Only validate discount fields if hasDiscount is true
    if (!data.hasDiscount) {
      return true;
    }
    
    // If discount is enabled but no type is selected, that's invalid
    if (data.hasDiscount && !data.discountType) {
      return false;
    }
    
    // If discount type is selected but not "free_of_charge", amount should be provided
    if (data.discountType && data.discountType !== DiscountType.FreeOfCharge) {
      return data.discountAmount !== undefined && data.discountAmount > 0;
    }
    // If discount type is "free_of_charge", amount should be 0 or undefined
    if (data.discountType === DiscountType.FreeOfCharge) {
      return data.discountAmount === 0 || data.discountAmount === undefined;
    }
    return true;
  },
  {
    message: 'When discount is enabled, discount type must be selected and amount must be provided (except for free of charge)',
    path: ['discountType'],
  }
);

export type StudentFormData = z.infer<typeof studentSchema>;

interface TabbedStudentFormContentProps {
  student?: Student | null;
  onSubmit: (data: StudentFormData) => void;
  onCancel: () => void;
  onFormChange?: () => void;
}

const TabbedStudentFormContent: React.FC<TabbedStudentFormContentProps> = ({
  student,
  onSubmit,
  onCancel,
  onFormChange,
}) => {
  const [activeTab, setActiveTab] = useState('student-info');

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student?.name || '',
      email: student?.email || '',
      phone: student?.phone || '',
      status: student?.status || StudentStatus.Active,
      parentContact: student?.parentContact || '',
      parentEmail: student?.parentEmail || '',
      dateOfBirth: student?.dateOfBirth || '',
      joiningDate: student?.joinDate || '',
      placeOfBirth: student?.placeOfBirth || '',
      notes: '',
      hasDiscount: student?.hasDiscount || (student?.discountType ? true : false) || false,
      discountType: student?.discountType,
      discountAmount: student?.discountAmount || 0,
    },
  });

  const {
    formState: { errors },
  } = form;

  // Watch form values for data indicators
  const watchedValues = form.watch();

  // Track form changes for unsaved changes warning
  useEffect(() => {
    const subscription = form.watch(() => {
      onFormChange?.();
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange]);

  // Determine which tabs have errors for auto-navigation
  const studentTabErrors = useMemo(() => {
    return !!(
      errors.name ||
      errors.email ||
      errors.phone ||
      errors.status ||
      errors.dateOfBirth ||
      errors.joiningDate ||
      errors.placeOfBirth ||
      errors.notes
    );
  }, [errors]);

  const parentTabErrors = useMemo(() => {
    return !!(errors.parentContact || errors.parentEmail);
  }, [errors]);

  const financialTabErrors = useMemo(() => {
    return !!(errors.discountType || errors.discountAmount);
  }, [errors]);

  // Determine which tabs have data for visual indicators
  const studentTabHasData = useMemo(() => {
    return !!(
      watchedValues.name ||
      watchedValues.email ||
      watchedValues.phone ||
      watchedValues.dateOfBirth ||
      watchedValues.joiningDate ||
      watchedValues.placeOfBirth ||
      watchedValues.notes
    );
  }, [
    watchedValues.name,
    watchedValues.email,
    watchedValues.phone,
    watchedValues.dateOfBirth,
    watchedValues.joiningDate,
    watchedValues.placeOfBirth,
    watchedValues.notes,
  ]);

  const parentTabHasData = useMemo(() => {
    return !!(watchedValues.parentContact || watchedValues.parentEmail);
  }, [watchedValues.parentContact, watchedValues.parentEmail]);

  const financialTabHasData = useMemo(() => {
    return !!(watchedValues.discountType || (watchedValues.discountAmount && watchedValues.discountAmount > 0));
  }, [watchedValues.discountType, watchedValues.discountAmount]);

  // Auto-navigate to tab with errors on form submission
  const handleSubmit = async (data: StudentFormData) => {
    const isValid = await form.trigger();
    
    if (!isValid) {
      // Navigate to the first tab with errors
      if (studentTabErrors) {
        setActiveTab('student-info');
      } else if (parentTabErrors) {
        setActiveTab('parent-info');
      } else if (financialTabErrors) {
        setActiveTab('financial-info');
      }
      return;
    }
    
    onSubmit(data);
  };

  const TabIndicator: React.FC<{ hasErrors: boolean; hasData: boolean }> = ({ hasErrors, hasData }) => (
    <div className="flex items-center gap-1 ml-2">
      {hasErrors && <Circle className="h-2 w-2 fill-red-400 text-red-400" />}
      {!hasErrors && hasData && <Circle className="h-2 w-2 fill-yellow-400 text-yellow-400" />}
    </div>
  );

  return (
    <GlassCard className="p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="bg-white/10 border-white/20">
              <TabsTrigger
                value="student-info"
                className="data-[state=active]:bg-white/20 text-white"
              >
                <User className="w-4 h-4 mr-2" />
                Student Information
                <TabIndicator hasErrors={studentTabErrors} hasData={studentTabHasData} />
              </TabsTrigger>
              <TabsTrigger
                value="parent-info"
                className="data-[state=active]:bg-white/20 text-white"
              >
                <Phone className="w-4 h-4 mr-2" />
                Parent/Guardian Information
                <TabIndicator hasErrors={parentTabErrors} hasData={parentTabHasData} />
              </TabsTrigger>
              <TabsTrigger
                value="financial-info"
                className="data-[state=active]:bg-white/20 text-white"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Financial Information
                <TabIndicator hasErrors={financialTabErrors} hasData={financialTabHasData} />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student-info">
              <StudentInformationTab form={form} />
            </TabsContent>

            <TabsContent value="parent-info">
              <ParentGuardianTab form={form} />
            </TabsContent>

            <TabsContent value="financial-info">
              <FinancialInformationTab form={form} />
            </TabsContent>
          </Tabs>

          <div className="pt-4">
            <FormButtons
              submitText={student ? 'Update Student' : 'Add Student'}
              onCancel={onCancel}
            />
          </div>
        </form>
      </Form>
    </GlassCard>
  );
};

export default TabbedStudentFormContent;
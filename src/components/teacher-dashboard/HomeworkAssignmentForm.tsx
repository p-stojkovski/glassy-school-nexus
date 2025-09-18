import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { CalendarDays, FileText, Save, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectHomeworkFormData,
  selectHomeworkValidationErrors,
  selectHomeworkLoadingStates,
  selectHomeworkError,
  updateFormData,
  resetFormData,
  clearValidationErrors,
  clearError,
  createHomeworkAssignment,
  updateHomeworkAssignment,
  upsertHomeworkAssignment
} from '@/store/slices/homeworkSlice';
import {
  HOMEWORK_ASSIGNMENT_TYPES,
  HOMEWORK_ASSIGNMENT_TYPE_LABELS,
  HOMEWORK_VALIDATION_RULES,
  HomeworkAssignmentFormData,
  HomeworkAssignmentType
} from '@/types/api/homework';
import { LessonResponse } from '@/types/api/lesson';
import { toast } from '@/hooks/use-toast';

// Validation schema using zod
const homeworkAssignmentSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(HOMEWORK_VALIDATION_RULES.TITLE_MAX_LENGTH, `Title must not exceed ${HOMEWORK_VALIDATION_RULES.TITLE_MAX_LENGTH} characters`)
    .refine((val) => val.trim().length > 0, 'Title cannot be empty or whitespace only'),
    
  description: z
    .string()
    .max(HOMEWORK_VALIDATION_RULES.DESCRIPTION_MAX_LENGTH, `Description must not exceed ${HOMEWORK_VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`)
    .optional()
    .or(z.literal('')),
    
  dueDate: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val || val === '') return true;
      const date = new Date(val);
      return !isNaN(date.getTime()) && date >= new Date(new Date().setHours(0, 0, 0, 0));
    }, 'Due date cannot be in the past'),
    
  assignmentType: z
    .enum(['general', 'reading', 'writing', 'vocabulary', 'grammar'] as const)
    .default('general'),
    
  instructions: z
    .string()
    .max(HOMEWORK_VALIDATION_RULES.INSTRUCTIONS_MAX_LENGTH, `Instructions must not exceed ${HOMEWORK_VALIDATION_RULES.INSTRUCTIONS_MAX_LENGTH} characters`)
    .optional()
    .or(z.literal(''))
});

type FormData = z.infer<typeof homeworkAssignmentSchema>;

// Component props interface
interface HomeworkAssignmentFormProps {
  lesson: LessonResponse;
  currentAssignment?: any; // Will be properly typed later
  isEditing?: boolean;
  onSuccess?: (assignment: any) => void;
  onCancel?: () => void;
  className?: string;
}

const HomeworkAssignmentForm: React.FC<HomeworkAssignmentFormProps> = ({
  lesson,
  currentAssignment,
  isEditing = false,
  onSuccess,
  onCancel,
  className = ''
}) => {
  const dispatch = useAppDispatch();
  
  // Redux state
  const formData = useAppSelector(selectHomeworkFormData);
  const validationErrors = useAppSelector(selectHomeworkValidationErrors);
  const loadingStates = useAppSelector(selectHomeworkLoadingStates);
  const error = useAppSelector(selectHomeworkError);
  
  // Loading states
  const isSaving = loadingStates.creatingAssignment || loadingStates.updatingAssignment;
  const isLoading = isSaving;
  
  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(homeworkAssignmentSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      assignmentType: 'general',
      instructions: ''
    },
    mode: 'onChange'
  });
  
  // Watch all form values
  const watchedValues = watch();
  
  // Sync form data with Redux state
  useEffect(() => {
    if (formData.title !== watchedValues.title ||
        formData.description !== watchedValues.description ||
        formData.dueDate !== watchedValues.dueDate ||
        formData.assignmentType !== watchedValues.assignmentType ||
        formData.instructions !== watchedValues.instructions) {
      dispatch(updateFormData({
        title: watchedValues.title || '',
        description: watchedValues.description || '',
        dueDate: watchedValues.dueDate || '',
        assignmentType: watchedValues.assignmentType as HomeworkAssignmentType,
        instructions: watchedValues.instructions || ''
      }));
    }
  }, [watchedValues, formData, dispatch]);
  
  // Initialize form with existing data
  useEffect(() => {
    if (currentAssignment && isEditing) {
      const initialData = {
        title: currentAssignment.title || '',
        description: currentAssignment.description || '',
        dueDate: currentAssignment.dueDate || '',
        assignmentType: currentAssignment.assignmentType as HomeworkAssignmentType || 'general',
        instructions: currentAssignment.instructions || ''
      };
      
      reset(initialData);
      dispatch(updateFormData(initialData));
    } else if (!isEditing) {
      // Reset form for new assignment
      const defaultData = {
        title: '',
        description: '',
        dueDate: '',
        assignmentType: 'general' as HomeworkAssignmentType,
        instructions: ''
      };
      
      reset(defaultData);
      dispatch(updateFormData(defaultData));
    }
  }, [currentAssignment, isEditing, reset, dispatch]);
  
  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      dispatch(clearError());
      dispatch(clearValidationErrors());
      
      const submissionData = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        dueDate: data.dueDate || undefined,
        assignmentType: data.assignmentType,
        instructions: data.instructions?.trim() || undefined
      };
      
      let result;
      if (isEditing && currentAssignment) {
        result = await dispatch(updateHomeworkAssignment({
          lessonId: lesson.id,
          request: submissionData
        })).unwrap();
      } else {
        result = await dispatch(createHomeworkAssignment({
          lessonId: lesson.id,
          request: submissionData
        })).unwrap();
      }
      
      // Success handling
      toast({
        title: isEditing ? 'Homework Updated' : 'Homework Created',
        description: `Homework assignment "${data.title}" has been ${isEditing ? 'updated' : 'created'} successfully.`,
        variant: 'default'
      });
      
      onSuccess?.(result.assignment);
      
    } catch (error: any) {
      // Error handling is done by Redux, just show a toast
      toast({
        title: 'Save Failed',
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} homework assignment.`,
        variant: 'destructive'
      });
    }
  };
  
  // Handle form reset/cancel
  const handleCancel = () => {
    dispatch(resetFormData());
    dispatch(clearValidationErrors());
    dispatch(clearError());
    
    if (currentAssignment && isEditing) {
      reset({
        title: currentAssignment.title || '',
        description: currentAssignment.description || '',
        dueDate: currentAssignment.dueDate || '',
        assignmentType: currentAssignment.assignmentType || 'general',
        instructions: currentAssignment.instructions || ''
      });
    } else {
      reset({
        title: '',
        description: '',
        dueDate: '',
        assignmentType: 'general',
        instructions: ''
      });
    }
    
    onCancel?.();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-6 ${className}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-300">Save Error</h4>
              <p className="text-sm text-red-200 mt-1">{error}</p>
            </div>
          </motion.div>
        )}
        
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-white/90 font-medium">
            Assignment Title *
          </Label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="title"
                placeholder="Enter homework assignment title..."
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500/50"
                disabled={isLoading}
              />
            )}
          />
          {(errors.title || validationErrors.title) && (
            <p className="text-sm text-red-400">
              {errors.title?.message || validationErrors.title}
            </p>
          )}
        </div>
        
        {/* Assignment Type Field */}
        <div className="space-y-2">
          <Label htmlFor="assignmentType" className="text-white/90 font-medium">
            Assignment Type
          </Label>
          <Controller
            name="assignmentType"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-purple-500/50">
                  <SelectValue placeholder="Select assignment type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-white/20">
                  {HOMEWORK_ASSIGNMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="text-white hover:bg-white/10">
                      {HOMEWORK_ASSIGNMENT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {(errors.assignmentType || validationErrors.assignmentType) && (
            <p className="text-sm text-red-400">
              {errors.assignmentType?.message || validationErrors.assignmentType}
            </p>
          )}
        </div>
        
        {/* Due Date Field */}
        <div className="space-y-2">
          <Label htmlFor="dueDate" className="text-white/90 font-medium flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Due Date (Optional)
          </Label>
          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="dueDate"
                type="date"
                className="bg-white/5 border-white/20 text-white focus:border-purple-500/50"
                disabled={isLoading}
                min={new Date().toISOString().split('T')[0]} // Prevent past dates
              />
            )}
          />
          {(errors.dueDate || validationErrors.dueDate) && (
            <p className="text-sm text-red-400">
              {errors.dueDate?.message || validationErrors.dueDate}
            </p>
          )}
        </div>
        
        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-white/90 font-medium">
            Description (Optional)
          </Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                id="description"
                placeholder="Provide a brief description of the assignment..."
                rows={3}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500/50 resize-none"
                disabled={isLoading}
              />
            )}
          />
          {(errors.description || validationErrors.description) && (
            <p className="text-sm text-red-400">
              {errors.description?.message || validationErrors.description}
            </p>
          )}
          <p className="text-xs text-white/60">
            {watchedValues.description?.length || 0} / {HOMEWORK_VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters
          </p>
        </div>
        
        {/* Instructions Field */}
        <div className="space-y-2">
          <Label htmlFor="instructions" className="text-white/90 font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Instructions (Optional)
          </Label>
          <Controller
            name="instructions"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                id="instructions"
                placeholder="Provide detailed instructions for completing the assignment..."
                rows={4}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500/50 resize-none"
                disabled={isLoading}
              />
            )}
          />
          {(errors.instructions || validationErrors.instructions) && (
            <p className="text-sm text-red-400">
              {errors.instructions?.message || validationErrors.instructions}
            </p>
          )}
          <p className="text-xs text-white/60">
            {watchedValues.instructions?.length || 0} / {HOMEWORK_VALIDATION_RULES.INSTRUCTIONS_MAX_LENGTH} characters
          </p>
        </div>
        
        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button
            type="submit"
            disabled={!isValid || isLoading || !isDirty}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Update Assignment' : 'Create Assignment'}
              </>
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30"
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default HomeworkAssignmentForm;
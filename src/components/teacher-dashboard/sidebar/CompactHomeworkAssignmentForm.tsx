import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarDays, FileText, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  selectCurrentHomeworkAssignment
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

interface CompactHomeworkAssignmentFormProps {
  lesson: LessonResponse;
  currentAssignment?: any;
  isEditing?: boolean;
  onSuccess?: (assignment: any) => void;
  onCancel?: () => void;
  className?: string;
}

const CompactHomeworkAssignmentForm: React.FC<CompactHomeworkAssignmentFormProps> = ({
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
  const existingAssignment = useAppSelector(selectCurrentHomeworkAssignment);
  
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
    if (existingAssignment || currentAssignment) {
      const assignment = existingAssignment || currentAssignment;
      const initialData = {
        title: assignment.title || '',
        description: assignment.description || '',
        dueDate: assignment.dueDate || '',
        assignmentType: assignment.assignmentType as HomeworkAssignmentType || 'general',
        instructions: assignment.instructions || ''
      };
      
      reset(initialData);
      dispatch(updateFormData(initialData));
    } else {
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
  }, [existingAssignment, currentAssignment, reset, dispatch]);
  
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
      if ((existingAssignment || currentAssignment) && isEditing) {
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
    
    if ((existingAssignment || currentAssignment) && isEditing) {
      const assignment = existingAssignment || currentAssignment;
      reset({
        title: assignment.title || '',
        description: assignment.description || '',
        dueDate: assignment.dueDate || '',
        assignmentType: assignment.assignmentType || 'general',
        instructions: assignment.instructions || ''
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
    <div className={`space-y-4 ${className}`}>
      <Card className="bg-purple-500/10 border-purple-500/30">
        <CardHeader className="p-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300">
              {(existingAssignment || currentAssignment) ? 'Edit Assignment' : 'Create Assignment'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <Label htmlFor="title" className="text-xs font-medium text-white/90">
                Title *
              </Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="title"
                    placeholder="Enter assignment title"
                    disabled={isLoading}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 text-sm"
                  />
                )}
              />
              {errors.title && (
                <p className="text-xs text-red-300 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Assignment Type */}
            <div className="space-y-1">
              <Label htmlFor="assignmentType" className="text-xs font-medium text-white/90">
                Type
              </Label>
              <Controller
                name="assignmentType"
                control={control}
                render={({ field }) => (
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOMEWORK_ASSIGNMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {HOMEWORK_ASSIGNMENT_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <Label htmlFor="dueDate" className="text-xs font-medium text-white/90">
                Due Date
              </Label>
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="dueDate"
                    type="date"
                    disabled={isLoading}
                    className="bg-white/10 border-white/20 text-white text-sm"
                  />
                )}
              />
              {errors.dueDate && (
                <p className="text-xs text-red-300 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.dueDate.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="description" className="text-xs font-medium text-white/90">
                Description
              </Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="description"
                    placeholder="Brief description of the assignment"
                    disabled={isLoading}
                    rows={3}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 text-sm resize-none"
                  />
                )}
              />
            </div>

            {/* Instructions */}
            <div className="space-y-1">
              <Label htmlFor="instructions" className="text-xs font-medium text-white/90">
                Instructions
              </Label>
              <Controller
                name="instructions"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="instructions"
                    placeholder="Detailed instructions for students"
                    disabled={isLoading}
                    rows={4}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 text-sm resize-none"
                  />
                )}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-2 bg-red-500/20 border border-red-500/30 rounded text-xs">
                <div className="flex items-center gap-2 text-red-300">
                  <AlertCircle className="w-3 h-3" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 text-xs"
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading || !isValid}
                className="flex-1 bg-purple-600/80 hover:bg-purple-700 text-white font-medium text-xs"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Save className="w-3 h-3 mr-1" />
                )}
                {(existingAssignment || currentAssignment) ? 'Update' : 'Create'}
              </Button>
            </div>

            {/* Save Status */}
            {isDirty && isValid && !isLoading && (
              <div className="flex items-center gap-2 text-xs text-green-300 justify-center">
                <CheckCircle2 className="w-3 h-3" />
                Ready to save
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompactHomeworkAssignmentForm;
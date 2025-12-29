import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClassAdditionalDetailsResponse } from '@/types/api/class';
import { classApiService } from '@/services/classApiService';
import { toast } from 'sonner';

// Validation schema - all fields optional since they can be null
const classDetailsSchema = z.object({
  description: z.string().optional(),
  objectives: z.array(z.object({ value: z.string() })),
  requirements: z.string().optional(),
  materials: z.array(z.object({ value: z.string() })),
});

type ClassDetailsFormData = z.infer<typeof classDetailsSchema>;

interface EditClassDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  initialData: ClassAdditionalDetailsResponse | null;
  onSuccess: () => void;
}

export function EditClassDetailsSheet({
  open,
  onOpenChange,
  classId,
  initialData,
  onSuccess,
}: EditClassDetailsSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClassDetailsFormData>({
    resolver: zodResolver(classDetailsSchema),
    defaultValues: {
      description: initialData?.description || '',
      objectives: initialData?.objectives?.map(obj => ({ value: obj })) || [],
      requirements: initialData?.requirements || '',
      materials: initialData?.materials?.map(mat => ({ value: mat })) || [],
    },
  });

  const { fields: objectiveFields, append: appendObjective, remove: removeObjective } = useFieldArray({
    control: form.control,
    name: 'objectives',
  });

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({
    control: form.control,
    name: 'materials',
  });

  // Reset form when sheet opens with new data
  useEffect(() => {
    if (open && initialData) {
      form.reset({
        description: initialData.description || '',
        objectives: initialData.objectives?.map(obj => ({ value: obj })) || [],
        requirements: initialData.requirements || '',
        materials: initialData.materials?.map(mat => ({ value: mat })) || [],
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = async (data: ClassDetailsFormData) => {
    setIsSubmitting(true);

    try {
      // Clean and prepare data
      const cleanedObjectives = data.objectives
        .map(obj => obj.value?.trim())
        .filter(Boolean);

      const cleanedMaterials = data.materials
        .map(mat => mat.value?.trim())
        .filter(Boolean);

      const request = {
        description: data.description?.trim() || null,
        objectives: cleanedObjectives.length > 0 ? cleanedObjectives : null,
        requirements: data.requirements?.trim() || null,
        materials: cleanedMaterials.length > 0 ? cleanedMaterials : null,
      };

      await classApiService.updateAdditionalDetails(classId, request);

      toast.success('Class details updated successfully');
      onOpenChange(false);
      onSuccess(); // Trigger refetch in parent
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update class details';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl p-0 bg-white/10 backdrop-blur-md border border-white/20 text-white overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b border-white/10">
            <SheetTitle className="flex items-center gap-2 text-white text-lg font-semibold">
              <FileText className="w-5 h-5 text-yellow-500" />
              Edit Class Details
            </SheetTitle>
            <SheetDescription className="text-white/70 mt-2">
              Update class overview, requirements, objectives, and materials
            </SheetDescription>
          </SheetHeader>

          {/* Form Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              <Form {...form}>
                <form id="edit-class-details-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">

                  {/* Class Overview Section */}
                  <div className="space-y-4">

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">                   <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <FileText className="h-4 w-4 text-white/60" />
                      <h3 className="text-sm font-semibold text-white">Class Overview</h3>
                    </div></FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ''}
                              placeholder="Enter a short overview of the class so families can quickly understand what this class covers..."
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 min-h-[200px] resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Learning Objectives Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <svg
                        className="h-4 w-4 text-white/60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                      <h3 className="text-sm font-semibold text-white">Learning Objectives</h3>
                    </div>
                    <div className="space-y-3">
                      {objectiveFields.map((field, index) => (
                        <FormField
                          key={field.id}
                          control={form.control}
                          name={`objectives.${index}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-start gap-2">
                                <div className="flex-1">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder={`Objective ${index + 1}`}
                                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeObjective(index)}
                                  className="text-white/60 hover:text-white hover:bg-white/10"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendObjective({ value: '' })}
                        className="border-white/30 bg-white/10 hover:bg-white/20 text-white gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Objective
                      </Button>
                    </div>
                  </div>

                  {/* Requirements Section */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="requirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80">
                                              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <svg
                        className="h-4 w-4 text-white/60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <h3 className="text-sm font-semibold text-white">Requirements</h3>
                    </div>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              value={field.value || ''}
                              placeholder="List prerequisites, supplies, or expectations here"
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 min-h-[150px] resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Materials Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <svg
                        className="h-4 w-4 text-white/60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <h3 className="text-sm font-semibold text-white">Materials</h3>
                    </div>
                    <div className="space-y-3">
                      {materialFields.map((field, index) => (
                        <FormField
                          key={field.id}
                          control={form.control}
                          name={`materials.${index}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-start gap-2">
                                <div className="flex-1">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder={`Material ${index + 1}`}
                                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/30"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMaterial(index)}
                                  className="text-white/60 hover:text-white hover:bg-white/10"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendMaterial({ value: '' })}
                        className="border-white/30 bg-white/10 hover:bg-white/20 text-white gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Material
                      </Button>
                    </div>
                  </div>

                </form>
              </Form>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <SheetFooter className="p-6 border-t border-white/10">
            <div className="flex gap-3 w-full">
              <Button
                type="submit"
                form="edit-class-details-form"
                disabled={isSubmitting}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}

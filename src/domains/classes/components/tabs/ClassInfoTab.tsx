import React, { useCallback, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { FileText, Edit2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import AdditionalDetailsTab from '@/domains/classes/components/forms/tabs/AdditionalDetailsTab';
import TabEditControls from '@/domains/classes/components/unified/TabEditControls';
import { ClassResponse } from '@/types/api/class';
import { classApiService } from '@/services/classApiService';
import { toast } from 'sonner';

interface ClassInfoTabProps {
  classData: ClassResponse;
  onUpdate: () => void;
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
}

// Simplified form data - only additional details
interface AdditionalDetailsFormData {
  description: string;
  requirements: string;
  objectives: string[];
  materials: string[];
}

const ClassInfoTab: React.FC<ClassInfoTabProps> = ({
  classData,
  onUpdate,
  onUnsavedChangesChange,
}) => {
  const [mode, setMode] = React.useState<'view' | 'edit'>('view');
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Extract additional details data from classData
  const detailsData: AdditionalDetailsFormData = useMemo(() => ({
    description: classData?.description || '',
    requirements: classData?.requirements || '',
    objectives: Array.isArray(classData?.objectives) ? classData.objectives : [],
    materials: Array.isArray(classData?.materials) ? classData.materials : [],
  }), [
    classData?.description,
    classData?.requirements,
    classData?.objectives,
    classData?.materials,
  ]);

  // Initialize form
  const form = useForm<AdditionalDetailsFormData>({
    defaultValues: detailsData,
  });

  // Keep form in sync when class data changes
  React.useEffect(() => {
    if (!classData || mode === 'edit') return;
    form.reset(detailsData);
    setHasUnsavedChanges(false);
    onUnsavedChangesChange?.(false);
  }, [classData?.id, detailsData, form, mode, onUnsavedChangesChange]);

  // Track unsaved changes
  React.useEffect(() => {
    if (!classData) return;
    if (mode !== 'edit') {
      setHasUnsavedChanges(false);
      onUnsavedChangesChange?.(false);
      return;
    }

    const subscription = form.watch((formData) => {
      if (!formData || !classData) return;
      
      // Compare with original data (only additional details)
      const hasChanges =
        (formData.description || '') !== (classData.description || '') ||
        (formData.requirements || '') !== (classData.requirements || '') ||
        JSON.stringify(formData.objectives || []) !== JSON.stringify(Array.isArray(classData.objectives) ? classData.objectives : []) ||
        JSON.stringify(formData.materials || []) !== JSON.stringify(Array.isArray(classData.materials) ? classData.materials : []);

      setHasUnsavedChanges(hasChanges);
      onUnsavedChangesChange?.(hasChanges);
    });

    return () => subscription.unsubscribe();
  }, [form, mode, classData, onUnsavedChangesChange]);

  const handleEdit = useCallback(() => {
    setMode('edit');
    form.reset(detailsData);
  }, [form, detailsData]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        setMode('view');
        form.reset(detailsData);
        setHasUnsavedChanges(false);
        onUnsavedChangesChange?.(false);
      }
    } else {
      setMode('view');
      form.reset(detailsData);
    }
  }, [hasUnsavedChanges, form, detailsData, onUnsavedChangesChange]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const formData = form.getValues();

      // Fetch latest class data to preserve basic info
      const latestData = await classApiService.getClassById(classData.id);

      // Merge - preserve basic info, update additional details
      const merged = {
        name: latestData.name,
        subjectId: latestData.subjectId,
        teacherId: latestData.teacherId,
        classroomId: latestData.classroomId,
        description: formData.description || null,
        requirements: formData.requirements || null,
        objectives: formData.objectives || null,
        materials: formData.materials || null,
        schedule: latestData.schedule,
        studentIds: latestData.studentIds,
      };

      await classApiService.updateClass(classData.id, merged);

      toast.success('Additional details updated successfully');
      setMode('view');
      setHasUnsavedChanges(false);
      onUnsavedChangesChange?.(false);

      await onUpdate();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update details');
    } finally {
      setIsSaving(false);
    }
  }, [form, classData, onUpdate, onUnsavedChangesChange]);

  if (!classData) {
    return null;
  }

  if (mode === 'view') {
    // Check if there's any content to show
    const hasDescription = !!classData.description;
    const hasObjectives = classData.objectives && Array.isArray(classData.objectives) && classData.objectives.length > 0;
    const hasRequirements = !!classData.requirements;
    const hasMaterials = classData.materials && Array.isArray(classData.materials) && classData.materials.length > 0;
    const hasAnyContent = hasDescription || hasObjectives || hasRequirements || hasMaterials;

    // Determine which sections to open by default (ones with content)
    const defaultOpenSections: string[] = [];
    if (hasDescription) defaultOpenSections.push('description');
    if (hasObjectives) defaultOpenSections.push('objectives');
    if (hasRequirements) defaultOpenSections.push('requirements');
    if (hasMaterials) defaultOpenSections.push('materials');

    return (
      <GlassCard className="p-4">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Additional Details</h3>
              <p className="text-white/60 text-sm">Description, objectives, requirements, and materials</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleEdit}
            className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        </div>

        {!hasAnyContent ? (
          <div className="text-center py-8">
            <p className="text-white/40 mb-4">No additional details have been added yet.</p>
            <Button
              size="sm"
              onClick={handleEdit}
              className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Add Details
            </Button>
          </div>
        ) : (
          <Accordion type="multiple" defaultValue={defaultOpenSections} className="space-y-2">
            {/* Description */}
            <AccordionItem value="description" className="border-white/10 rounded-lg bg-white/5">
              <AccordionTrigger className="px-4 py-3 text-white hover:no-underline hover:bg-white/5 rounded-t-lg [&[data-state=open]]:rounded-b-none">
                <div className="flex items-center gap-2">
                  <span>Description</span>
                  {!hasDescription && (
                    <span className="text-xs text-white/40 ml-2">(empty)</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {hasDescription ? (
                  <p className="text-white/80 leading-relaxed">{classData.description}</p>
                ) : (
                  <p className="text-white/40 text-sm italic">No description provided.</p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Learning Objectives */}
            <AccordionItem value="objectives" className="border-white/10 rounded-lg bg-white/5">
              <AccordionTrigger className="px-4 py-3 text-white hover:no-underline hover:bg-white/5 rounded-t-lg [&[data-state=open]]:rounded-b-none">
                <div className="flex items-center gap-2">
                  <span>Learning Objectives</span>
                  {hasObjectives && (
                    <Badge variant="secondary" className="ml-2 bg-white/10 text-white/70 text-xs">
                      {classData.objectives!.length}
                    </Badge>
                  )}
                  {!hasObjectives && (
                    <span className="text-xs text-white/40 ml-2">(empty)</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {hasObjectives ? (
                  <div className="space-y-2">
                    {classData.objectives!.map((objective, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5 flex-shrink-0" />
                        <span className="text-white/80">{objective}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm italic">No learning objectives set.</p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Requirements */}
            <AccordionItem value="requirements" className="border-white/10 rounded-lg bg-white/5">
              <AccordionTrigger className="px-4 py-3 text-white hover:no-underline hover:bg-white/5 rounded-t-lg [&[data-state=open]]:rounded-b-none">
                <div className="flex items-center gap-2">
                  <span>Requirements</span>
                  {!hasRequirements && (
                    <span className="text-xs text-white/40 ml-2">(empty)</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {hasRequirements ? (
                  <p className="text-white/80 leading-relaxed">{classData.requirements}</p>
                ) : (
                  <p className="text-white/40 text-sm italic">No requirements specified.</p>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Materials */}
            <AccordionItem value="materials" className="border-white/10 rounded-lg bg-white/5">
              <AccordionTrigger className="px-4 py-3 text-white hover:no-underline hover:bg-white/5 rounded-t-lg [&[data-state=open]]:rounded-b-none">
                <div className="flex items-center gap-2">
                  <span>Materials</span>
                  {hasMaterials && (
                    <Badge variant="secondary" className="ml-2 bg-white/10 text-white/70 text-xs">
                      {classData.materials!.length}
                    </Badge>
                  )}
                  {!hasMaterials && (
                    <span className="text-xs text-white/40 ml-2">(empty)</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {hasMaterials ? (
                  <div className="flex flex-wrap gap-2">
                    {classData.materials!.map((material, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-white border-green-400/30"
                      >
                        {material}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm italic">No materials listed.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </GlassCard>
    );
  }

  // Edit mode
  return (
    <FormProvider {...form}>
      <GlassCard className="p-4">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Edit Additional Details
              </h3>
              <p className="text-white/60 text-sm">
                Update description, objectives, requirements, and materials
              </p>
            </div>
          </div>
          <TabEditControls
            mode="edit"
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            validationErrors={form.formState?.errors ? Object.values(form.formState.errors || {}).filter(Boolean) : []}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
        <AdditionalDetailsTab form={form as any} />
      </GlassCard>
    </FormProvider>
  );
};

export default ClassInfoTab;

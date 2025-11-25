import React, { useCallback } from 'react';
import { FormProvider } from 'react-hook-form';
import { FileText, Target, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/common/GlassCard';
import BasicClassInfoTab from '@/domains/classes/components/forms/tabs/BasicClassInfoTab';
import AdditionalDetailsTab from '@/domains/classes/components/forms/tabs/AdditionalDetailsTab';
import ClassInfoSection from '@/domains/classes/components/sections/ClassInfoSection';
import ClassDescriptionSection from '@/domains/classes/components/sections/ClassDescriptionSection';
import TabEditControls from '@/domains/classes/components/unified/TabEditControls';
import { ClassResponse } from '@/types/api/class';
import { useOverviewTabForm, OverviewFormData } from '@/domains/classes/hooks/useOverviewTabForm';
import { classApiService } from '@/services/classApiService';
import { toast } from 'sonner';

interface ClassInfoTabProps {
  classData: ClassResponse;
  onUpdate: () => void;
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
}

const ClassInfoTab: React.FC<ClassInfoTabProps> = ({
  classData,
  onUpdate,
  onUnsavedChangesChange,
}) => {
  const [mode, setMode] = React.useState<'view' | 'edit'>('view');
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Extract overview data from classData
  const overviewData: OverviewFormData = {
    name: classData.name,
    subjectId: classData.subjectId,
    teacherId: classData.teacherId,
    classroomId: classData.classroomId,
    description: classData.description || '',
    requirements: classData.requirements || '',
    objectives: classData.objectives ?? [],
    materials: classData.materials ?? [],
  };

  // Initialize form
  const form = useOverviewTabForm(overviewData);

  // Track unsaved changes
  React.useEffect(() => {
    if (mode !== 'edit') {
      setHasUnsavedChanges(false);
      onUnsavedChangesChange?.(false);
      return;
    }

    const subscription = form.watch((formData) => {
      // Compare with original data
      const hasChanges =
        formData.name !== classData.name ||
        formData.subjectId !== classData.subjectId ||
        formData.teacherId !== classData.teacherId ||
        formData.classroomId !== classData.classroomId ||
        (formData.description || '') !== (classData.description || '') ||
        (formData.requirements || '') !== (classData.requirements || '') ||
        JSON.stringify(formData.objectives || []) !== JSON.stringify(classData.objectives || []) ||
        JSON.stringify(formData.materials || []) !== JSON.stringify(classData.materials || []);

      setHasUnsavedChanges(hasChanges);
      onUnsavedChangesChange?.(hasChanges);
    });

    return () => subscription.unsubscribe();
  }, [form, mode, classData, onUnsavedChangesChange]);

  const handleEdit = useCallback(() => {
    setMode('edit');
    form.reset(overviewData);
  }, [form, overviewData]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      // Show confirmation - for now just reset
      if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        setMode('view');
        form.reset(overviewData);
        setHasUnsavedChanges(false);
        onUnsavedChangesChange?.(false);
      }
    } else {
      setMode('view');
      form.reset(overviewData);
    }
  }, [hasUnsavedChanges, form, overviewData, onUnsavedChangesChange]);

  const handleSave = useCallback(async () => {
    // Validate form
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      const formData = form.getValues();

      // Fetch latest class data to avoid overwriting concurrent changes
      const latestData = await classApiService.getClassById(classData.id);

      // Merge overview data with existing class data
      const merged = {
        name: formData.name,
        subjectId: formData.subjectId,
        teacherId: formData.teacherId,
        classroomId: formData.classroomId,
        description: formData.description || null,
        requirements: formData.requirements || null,
        objectives: formData.objectives || null,
        materials: formData.materials || null,
        schedule: latestData.schedule,
        studentIds: latestData.studentIds,
      };

      // Update class
      await classApiService.updateClass(classData.id, merged);

      toast.success('Overview updated successfully');
      setMode('view');
      setHasUnsavedChanges(false);
      onUnsavedChangesChange?.(false);

      // Refresh parent data
      await onUpdate();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update overview');
    } finally {
      setIsSaving(false);
    }
  }, [form, classData, onUpdate, onUnsavedChangesChange]);

  if (mode === 'view') {
    return (
      <div className="space-y-6">
        {/* Class Information */}
        <ClassInfoSection
          mode="view"
          classData={classData}
          onEdit={handleEdit}
        />

        {/* Description */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Description
            </h3>
          </div>
          {classData.description ? (
            <p className="text-white/80 leading-relaxed">{classData.description}</p>
          ) : (
            <p className="text-white/40 text-sm italic">No description provided. Click Edit to add one.</p>
          )}
        </GlassCard>

        {/* Learning Objectives */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Learning Objectives
            </h3>
          </div>
          {classData.objectives && classData.objectives.length > 0 ? (
            <div className="space-y-3">
              {classData.objectives.map((objective, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span className="text-white/80">{objective}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-sm italic">No learning objectives set. Click Edit to add them.</p>
          )}
        </GlassCard>

        {/* Requirements */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Requirements
            </h3>
          </div>
          {classData.requirements ? (
            <p className="text-white/80 leading-relaxed">{classData.requirements}</p>
          ) : (
            <p className="text-white/40 text-sm italic">No requirements specified. Click Edit to add them.</p>
          )}
        </GlassCard>

        {/* Materials */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-green-400" />
              Materials
            </h3>
          </div>
          {classData.materials && classData.materials.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {classData.materials.map((material, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-white border-green-400/30 hover:border-green-400/60 transition-colors"
                >
                  {material}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-sm italic">No materials listed. Click Edit to add them.</p>
          )}
        </GlassCard>
      </div>
    );
  }

  // Edit mode
  return (
    <FormProvider {...form}>
      <div className="space-y-8">
        <GlassCard className="p-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Edit Class Information
              </h3>
              <p className="text-white/60 text-sm">
                Update the class details below
              </p>
            </div>
            <TabEditControls
              mode="edit"
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={isSaving}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
          <BasicClassInfoTab form={form as any} />
        </GlassCard>

        <GlassCard className="p-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-1">
              Additional Details
            </h3>
            <p className="text-white/60 text-sm">
              Add objectives, requirements, and materials
            </p>
          </div>
          <AdditionalDetailsTab form={form as any} />
        </GlassCard>
      </div>
    </FormProvider>
  );
};

export default ClassInfoTab;

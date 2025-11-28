import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { FileText, Edit2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import AdditionalDetailsTab from '@/domains/classes/components/forms/tabs/AdditionalDetailsTab';
import TabEditControls from '@/domains/classes/components/unified/TabEditControls';
import { ClassBasicInfoResponse, ClassAdditionalDetailsResponse } from '@/types/api/class';
import { classApiService } from '@/services/classApiService';
import { toast } from 'sonner';

interface ClassInfoTabProps {
  classData: ClassBasicInfoResponse;
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
  // Lazy loading state
  const [additionalDetails, setAdditionalDetails] = useState<ClassAdditionalDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Edit mode state
  const [mode, setMode] = React.useState<'view' | 'edit'>('view');
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Fetch additional details on mount (lazy loading)
  useEffect(() => {
    if (!hasFetched && classData?.id) {
      const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await classApiService.getAdditionalDetails(classData.id);
          setAdditionalDetails(response);
          setHasFetched(true);
        } catch (err: any) {
          setError(err?.message || 'Failed to load additional details');
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [classData?.id, hasFetched]);

  // Extract additional details data for form
  const detailsData: AdditionalDetailsFormData = useMemo(() => ({
    description: additionalDetails?.description || '',
    requirements: additionalDetails?.requirements || '',
    objectives: Array.isArray(additionalDetails?.objectives) ? additionalDetails.objectives : [],
    materials: Array.isArray(additionalDetails?.materials) ? additionalDetails.materials : [],
  }), [additionalDetails]);

  // Initialize form
  const form = useForm<AdditionalDetailsFormData>({
    defaultValues: detailsData,
  });

  // Keep form in sync when additional details change
  React.useEffect(() => {
    if (!additionalDetails || mode === 'edit') return;
    form.reset(detailsData);
    setHasUnsavedChanges(false);
    onUnsavedChangesChange?.(false);
  }, [additionalDetails, detailsData, form, mode, onUnsavedChangesChange]);

  // Track unsaved changes
  React.useEffect(() => {
    if (!additionalDetails) return;
    if (mode !== 'edit') {
      setHasUnsavedChanges(false);
      onUnsavedChangesChange?.(false);
      return;
    }

    const subscription = form.watch((formData) => {
      if (!formData || !additionalDetails) return;
      
      // Compare with original data (only additional details)
      const hasChanges =
        (formData.description || '') !== (additionalDetails.description || '') ||
        (formData.requirements || '') !== (additionalDetails.requirements || '') ||
        JSON.stringify(formData.objectives || []) !== JSON.stringify(Array.isArray(additionalDetails.objectives) ? additionalDetails.objectives : []) ||
        JSON.stringify(formData.materials || []) !== JSON.stringify(Array.isArray(additionalDetails.materials) ? additionalDetails.materials : []);

      setHasUnsavedChanges(hasChanges);
      onUnsavedChangesChange?.(hasChanges);
    });

    return () => subscription.unsubscribe();
  }, [form, mode, additionalDetails, onUnsavedChangesChange]);

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

      // Use the dedicated additional details endpoint
      await classApiService.updateAdditionalDetails(classData.id, {
        description: formData.description || null,
        requirements: formData.requirements || null,
        objectives: formData.objectives || null,
        materials: formData.materials || null,
      });

      toast.success('Additional details updated successfully');
      setMode('view');
      setHasUnsavedChanges(false);
      onUnsavedChangesChange?.(false);

      // Refetch additional details to get latest data
      const response = await classApiService.getAdditionalDetails(classData.id);
      setAdditionalDetails(response);

      await onUpdate();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update details');
    } finally {
      setIsSaving(false);
    }
  }, [form, classData.id, onUpdate, onUnsavedChangesChange]);

  // Loading state
  if (loading && !hasFetched) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        title="Error Loading Details"
        message={error}
        onRetry={() => {
          setHasFetched(false);
          setError(null);
        }}
        showRetry
      />
    );
  }

  if (!additionalDetails) {
    return null;
  }

  if (mode === 'view') {
    // Check if there's any content to show
    const hasDescription = !!additionalDetails.description;
    const hasObjectives = additionalDetails.objectives && Array.isArray(additionalDetails.objectives) && additionalDetails.objectives.length > 0;
    const hasRequirements = !!additionalDetails.requirements;
    const hasMaterials = additionalDetails.materials && Array.isArray(additionalDetails.materials) && additionalDetails.materials.length > 0;
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
                  <p className="text-white/80 leading-relaxed">{additionalDetails.description}</p>
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
                      {additionalDetails.objectives!.length}
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
                    {additionalDetails.objectives!.map((objective, index) => (
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
                  <p className="text-white/80 leading-relaxed">{additionalDetails.requirements}</p>
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
                      {additionalDetails.materials!.length}
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
                    {additionalDetails.materials!.map((material, index) => (
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

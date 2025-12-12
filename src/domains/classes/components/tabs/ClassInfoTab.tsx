import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Edit2, Plus, FileText, ListChecks, FolderOpen, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
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
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);

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
      setShowCancelDialog(true);
    } else {
      setMode('view');
      form.reset(detailsData);
    }
  }, [hasUnsavedChanges, form, detailsData]);

  const handleConfirmCancel = useCallback(() => {
    setShowCancelDialog(false);
    setMode('view');
    form.reset(detailsData);
    setHasUnsavedChanges(false);
    onUnsavedChangesChange?.(false);
  }, [form, detailsData, onUnsavedChangesChange]);

  const handleDismissCancelDialog = useCallback(() => {
    setShowCancelDialog(false);
  }, []);

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
    // Section presence
    const hasDescription = !!additionalDetails.description;
    const hasObjectives =
      additionalDetails.objectives &&
      Array.isArray(additionalDetails.objectives) &&
      additionalDetails.objectives.length > 0;
    const hasRequirements = !!additionalDetails.requirements;
    const hasMaterials =
      additionalDetails.materials &&
      Array.isArray(additionalDetails.materials) &&
      additionalDetails.materials.length > 0;
    const hasAnyContent = hasDescription || hasObjectives || hasRequirements || hasMaterials;

    // Default open sections
    const defaultOpenSections: string[] = [];
    if (hasDescription) defaultOpenSections.push('description');
    if (hasObjectives) defaultOpenSections.push('objectives');
    if (hasRequirements) defaultOpenSections.push('requirements');
    if (hasMaterials) defaultOpenSections.push('materials');

    const emptySections: string[] = [];
    if (!hasDescription) emptySections.push('description');
    if (!hasObjectives) emptySections.push('objectives');
    if (!hasRequirements) emptySections.push('requirements');
    if (!hasMaterials) emptySections.push('materials');

    const sectionsToOpen = [...defaultOpenSections];
    const firstIncompleteSection = emptySections[0];
    if (firstIncompleteSection && !sectionsToOpen.includes(firstIncompleteSection)) {
      sectionsToOpen.push(firstIncompleteSection);
    }

    const accordionDefaultValue = sectionsToOpen.length > 0 ? sectionsToOpen : ['description'];
    const accordionKey = accordionDefaultValue.join('|');

    const objectivesCount = hasObjectives ? additionalDetails.objectives!.length : 0;
    const materialsCount = hasMaterials ? additionalDetails.materials!.length : 0;

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 md:gap-6 p-3 bg-white/[0.02] rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-white/60" />
            <div className="text-sm text-white/80">
              <span className="font-semibold text-white">Class details</span>
              <span className="ml-1 text-white/60">overview</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/80">
              {hasDescription ? (
                <>
                  <span className="font-semibold text-white">Description ready</span>
                </>
              ) : (
                <span className="text-white/70">Add description</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/80">
              <span className="font-semibold text-white">{objectivesCount}</span>{' '}
              {objectivesCount === 1 ? 'objective' : 'objectives'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/80">
              <span className="font-semibold text-white">{materialsCount}</span>{' '}
              {materialsCount === 1 ? 'material' : 'materials'}
            </span>
          </div>
          <div className="ml-auto w-full md:w-auto md:ml-auto">
            <Button
              onClick={handleEdit}
              size="default"
              variant="outline"
              className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium gap-2"
            >
              {hasAnyContent ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  Edit details
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add details
                </>
              )}
            </Button>
          </div>
        </div>

        <Accordion
          key={accordionKey}
          type="multiple"
          defaultValue={accordionDefaultValue}
          className="space-y-3"
        >
          {/* Description */}
          <AccordionItem
            value="description"
            className={`rounded-2xl border border-white/10 transition-colors ${
              hasDescription ? 'bg-white/[0.07]' : 'bg-white/[0.03]'
            }`}
          >
            <AccordionTrigger className="px-4 py-3 text-white hover:no-underline hover:bg-white/5 rounded-t-2xl [&[data-state=open]]:rounded-b-none">
              <div className="flex flex-col text-left sm:flex-row sm:items-center sm:gap-2">
                <span className="font-medium">Description</span>
                {!hasDescription && (
                  <span className="text-xs text-white/60">
                    Add a short overview so families can quickly scan the class.
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {hasDescription && (
                <p className="text-white/90 leading-relaxed">{additionalDetails.description}</p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Learning Objectives */}
          <AccordionItem
            value="objectives"
            className={`rounded-2xl border border-white/10 transition-colors ${
              hasObjectives ? 'bg-white/[0.07]' : 'bg-white/[0.03]'
            }`}
          >
            <AccordionTrigger className="px-4 py-3 text-white hover:no-underline hover:bg-white/5 rounded-t-2xl [&[data-state=open]]:rounded-b-none">
              <div className="flex flex-col text-left gap-1 sm:flex-row sm:items-center sm:gap-2">
                <span className="font-medium">Learning objectives</span>
                {hasObjectives ? (
                  <span className="text-xs font-semibold text-white/80 bg-white/10 border border-white/20 px-2 py-0.5 rounded-full">
                    {additionalDetails.objectives!.length}{' '}
                    {additionalDetails.objectives!.length === 1 ? 'item' : 'items'}
                  </span>
                ) : (
                  <span className="text-xs text-white/60">
                    Clarify 2-3 goals to guide instruction and communication.
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {hasObjectives && (
                <div className="space-y-3">
                  {additionalDetails.objectives!.map((objective, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-xl bg-white/[0.02] p-3">
                      <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                      <span className="text-white/90">{objective}</span>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Requirements */}
          <AccordionItem
            value="requirements"
            className={`rounded-2xl border border-white/10 transition-colors ${
              hasRequirements ? 'bg-white/[0.07]' : 'bg-white/[0.03]'
            }`}
          >
            <AccordionTrigger className="px-4 py-3 text-white hover:no-underline hover:bg-white/5 rounded-t-2xl [&[data-state=open]]:rounded-b-none">
              <div className="flex flex-col text-left sm:flex-row sm:items-center sm:gap-2">
                <span className="font-medium">Requirements</span>
                {!hasRequirements && (
                  <span className="text-xs text-white/60">
                    List prerequisites, supplies, or expectations here.
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {hasRequirements && (
                <p className="text-white/90 leading-relaxed whitespace-pre-line">
                  {additionalDetails.requirements}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Materials */}
          <AccordionItem
            value="materials"
            className={`rounded-2xl border border-white/10 transition-colors ${
              hasMaterials ? 'bg-white/[0.07]' : 'bg-white/[0.03]'
            }`}
          >
            <AccordionTrigger className="px-4 py-3 text-white hover:no-underline hover:bg-white/5 rounded-t-2xl [&[data-state=open]]:rounded-b-none">
              <div className="flex flex-col text-left gap-1 sm:flex-row sm:items-center sm:gap-2">
                <span className="font-medium">Materials</span>
                {hasMaterials ? (
                  <span className="text-xs font-semibold text-white/80 bg-emerald-400/15 border border-emerald-300/30 px-2 py-0.5 rounded-full">
                    View {additionalDetails.materials!.length}{' '}
                    {additionalDetails.materials!.length === 1 ? 'file' : 'files'}
                  </span>
                ) : (
                  <span className="text-xs text-white/60">
                    Attach resources, slide decks, or helpful links.
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {hasMaterials && (
                <div className="flex flex-wrap gap-2">
                  {additionalDetails.materials!.map((material, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                    >
                      {material}
                    </Badge>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  // Edit mode
  return (
    <>
      <FormProvider {...form}>
        <GlassCard className="p-3">
          <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white">
                  Edit details
                </h3>
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

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCancelDialog}
        onClose={handleDismissCancelDialog}
        onConfirm={handleConfirmCancel}
        title="Unsaved Changes"
        description="You have unsaved changes that will be lost. Would you like to stay and keep editing, or discard your changes?"
        confirmText="Discard Changes"
        cancelText="Stay"
        variant="warning"
      />
    </>
  );
};

export default ClassInfoTab;

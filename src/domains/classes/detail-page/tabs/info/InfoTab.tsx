import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { ClassBasicInfoResponse, ClassAdditionalDetailsResponse } from '@/types/api/class';
import { classApiService } from '@/services/classApiService';
import ReadOnlyClassOverview from './ReadOnlyClassOverview';
import ReadOnlyLearningObjectives from './ReadOnlyLearningObjectives';
import ReadOnlyRequirements from './ReadOnlyRequirements';
import ReadOnlyMaterials from './ReadOnlyMaterials';
import { EditClassDetailsSheet } from '../../dialogs/EditClassDetailsSheet';

interface InfoTabProps {
  classData: ClassBasicInfoResponse;
  onUpdate: () => void;
  isActive: boolean;
}

const InfoTab: React.FC<InfoTabProps> = ({
  classData,
  onUpdate,
  isActive,
}) => {
  // Lazy loading state
  const [additionalDetails, setAdditionalDetails] = useState<ClassAdditionalDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedForClassId, setFetchedForClassId] = useState<string | null>(null);

  const hasFetched = Boolean(classData?.id && fetchedForClassId === classData.id);

  // Reset when switching to a different class
  useEffect(() => {
    if (!classData?.id) return;
    if (fetchedForClassId === null) return;
    if (fetchedForClassId === classData.id) return;

    setAdditionalDetails(null);
    setError(null);
    setLoading(true);
    setFetchedForClassId(null);
  }, [classData?.id, fetchedForClassId]);

  // Sheet state
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Section expanded state (optional - can remove if you want sections always expanded)
  const [overviewExpanded, setOverviewExpanded] = useState(true);
  const [objectivesExpanded, setObjectivesExpanded] = useState(true);
  const [requirementsExpanded, setRequirementsExpanded] = useState(true);
  const [materialsExpanded, setMaterialsExpanded] = useState(true);

  // Fetch additional details on mount (lazy loading)
  useEffect(() => {
    if (!isActive) return;

    if (!hasFetched && classData?.id) {
      const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await classApiService.getAdditionalDetails(classData.id);
          setAdditionalDetails(response);
          setFetchedForClassId(classData.id);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to load additional details';
          setError(message);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [classData?.id, hasFetched, isActive]);

  // Handle successful save from Sheet
  const handleSaveSuccess = async () => {
    try {
      // Refetch additional details to get latest data
      const response = await classApiService.getAdditionalDetails(classData.id);
      setAdditionalDetails(response);
      await onUpdate();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to refresh data';
      setError(message);
    }
  };

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
          setFetchedForClassId(null);
          setError(null);
        }}
        showRetry
      />
    );
  }

  if (!additionalDetails) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Edit Button - consistent wrapper styling across tabs */}
      <div className="flex justify-end p-3 bg-white/[0.02] rounded-lg border border-white/10">
        <Button
          onClick={() => setIsEditSheetOpen(true)}
          size="default"
          variant="outline"
          className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit Class Details
        </Button>
      </div>

      {/* Read-Only Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 auto-rows-fr">
        <ReadOnlyClassOverview
          description={additionalDetails.description}
          isExpanded={overviewExpanded}
          onExpandedChange={setOverviewExpanded}
          className="h-full"
        />
        <ReadOnlyLearningObjectives
          objectives={additionalDetails.objectives}
          isExpanded={objectivesExpanded}
          onExpandedChange={setObjectivesExpanded}
          className="h-full"
        />
        <ReadOnlyRequirements
          requirements={additionalDetails.requirements}
          isExpanded={requirementsExpanded}
          onExpandedChange={setRequirementsExpanded}
          className="h-full"
        />
        <ReadOnlyMaterials
          materials={additionalDetails.materials}
          isExpanded={materialsExpanded}
          onExpandedChange={setMaterialsExpanded}
          className="h-full"
        />
      </div>

      {/* Edit Sheet */}
      <EditClassDetailsSheet
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        classId={classData.id}
        initialData={additionalDetails}
        onSuccess={handleSaveSuccess}
      />
    </div>
  );
};

export default InfoTab;

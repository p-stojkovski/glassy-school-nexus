import React, { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { ClassBasicInfoResponse, ClassAdditionalDetailsResponse } from '@/types/api/class';
import { classApiService } from '@/services/classApiService';
import ReadOnlyClassOverview from './ReadOnlyClassOverview';
import ReadOnlyLearningObjectives from './ReadOnlyLearningObjectives';
import ReadOnlyRequirements from './ReadOnlyRequirements';
import ReadOnlyMaterials from './ReadOnlyMaterials';

interface InfoTabProps {
  classData: ClassBasicInfoResponse;
  onUpdate: () => void;
  isActive: boolean;
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
}

const InfoTab: React.FC<InfoTabProps> = ({
  classData,
  onUpdate,
  isActive,
  onUnsavedChangesChange,
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
    </div>
  );
};

export default InfoTab;

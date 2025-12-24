import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { ClassBasicInfoResponse, ClassAdditionalDetailsResponse } from '@/types/api/class';
import { classApiService } from '@/services/classApiService';
import {
  ReadOnlyClassOverview,
  ReadOnlyLearningObjectives,
  ReadOnlyRequirements,
  ReadOnlyMaterials,
} from './sections';
import { EditClassDetailsSheet } from '../sheets/EditClassDetailsSheet';

interface ClassInfoTabProps {
  classData: ClassBasicInfoResponse;
  onUpdate: () => void;
}

const ClassInfoTab: React.FC<ClassInfoTabProps> = ({
  classData,
  onUpdate,
}) => {
  // Lazy loading state
  const [additionalDetails, setAdditionalDetails] = useState<ClassAdditionalDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Sheet state
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Section expanded state (optional - can remove if you want sections always expanded)
  const [overviewExpanded, setOverviewExpanded] = useState(true);
  const [objectivesExpanded, setObjectivesExpanded] = useState(true);
  const [requirementsExpanded, setRequirementsExpanded] = useState(true);
  const [materialsExpanded, setMaterialsExpanded] = useState(true);

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

  // Handle successful save from Sheet
  const handleSaveSuccess = async () => {
    try {
      // Refetch additional details to get latest data
      const response = await classApiService.getAdditionalDetails(classData.id);
      setAdditionalDetails(response);
      await onUpdate();
    } catch (err: any) {
      setError(err?.message || 'Failed to refresh data');
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

  return (
    <>
      {/* Edit Button */}
      <div className="mb-4 flex justify-end">
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
    </>
  );
};

export default ClassInfoTab;

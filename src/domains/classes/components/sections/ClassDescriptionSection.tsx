import React from 'react';
import { FileText } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { ClassResponse } from '@/types/api/class';

interface ClassDescriptionSectionProps {
  classData: ClassResponse;
}

const ClassDescriptionSection: React.FC<ClassDescriptionSectionProps> = ({
  classData,
}) => {
  const hasDescription = !!(
    classData.description ||
    classData.requirements ||
    classData.objectives ||
    classData.materials
  );

  if (!hasDescription) {
    return null;
  }

  return (
    <GlassCard className="p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Details
        </h3>
      </div>

      <div className="space-y-4">
        {classData.description && (
          <div>
            <div className="text-sm text-white/60 mb-2">Description</div>
            <p className="text-white/80 text-sm leading-relaxed">
              {classData.description}
            </p>
          </div>
        )}

        {classData.objectives && (
          <div>
            <div className="text-sm text-white/60 mb-2">Objectives</div>
            <p className="text-white/80 text-sm leading-relaxed">
              {classData.objectives}
            </p>
          </div>
        )}

        {classData.requirements && (
          <div>
            <div className="text-sm text-white/60 mb-2">Requirements</div>
            <p className="text-white/80 text-sm leading-relaxed">
              {classData.requirements}
            </p>
          </div>
        )}

        {classData.materials && (
          <div>
            <div className="text-sm text-white/60 mb-2">Materials</div>
            <p className="text-white/80 text-sm leading-relaxed">
              {classData.materials}
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default ClassDescriptionSection;

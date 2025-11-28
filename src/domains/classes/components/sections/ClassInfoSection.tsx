import React from 'react';
import { BookOpen, User, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import { ClassBasicInfoResponse } from '@/types/api/class';

interface ClassInfoSectionProps {
  classData: ClassBasicInfoResponse;
  mode?: 'view' | 'edit';
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

const ClassInfoSection: React.FC<ClassInfoSectionProps> = ({
  classData,
  mode = 'view',
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Class Information
        </h3>
        {mode === 'view' && onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="text-white border-white/20 hover:bg-white/10"
          >
            Edit
          </Button>
        )}
        {mode === 'edit' && (onSave || onCancel) && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
              className="text-white border-white/20 hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-white/60 mb-2">Name</div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">{classData.name}</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-2">Subject</div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">{classData.subjectName}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-white/60 mb-2">Teacher</div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-green-400" />
              <span className="text-white font-medium">{classData.teacherName}</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-2">Classroom</div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">{classData.classroomName}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm text-white/60 mb-2">Capacity</div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-400" />
            <span className="text-white font-medium">
              {classData.enrolledCount}/{classData.classroomCapacity}
            </span>
            {classData.availableSlots > 0 && (
              <span className="text-sm text-white/50">
                ({classData.availableSlots} available)
              </span>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ClassInfoSection;

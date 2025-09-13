import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LessonStatus } from '@/services/lessonStatusApiService';
import LessonStatusBadge from '@/domains/lessons/components/LessonStatusBadge';

interface LessonStatusFormProps {
  lessonStatus: LessonStatus; // Required - we're only editing existing statuses
  onSubmit: (data: LessonStatusFormData) => void;
  onCancel: () => void;
}

export interface LessonStatusFormData {
  description: string;
}

const LessonStatusForm: React.FC<LessonStatusFormProps> = ({
  lessonStatus,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<LessonStatusFormData>({
    description: lessonStatus?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Status Name (Read Only) */}
        <div className="space-y-2">
          <Label className="text-white text-sm font-medium">
            Status Name
          </Label>
          <div className="p-3 bg-white/5 border border-white/10 rounded-md">
            <LessonStatusBadge status={lessonStatus.name} size="md" />
          </div>
          <p className="text-white/50 text-xs">
            Status names are predefined and cannot be changed
          </p>
        </div>

        {/* Description (Editable) */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-white text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => 
              setFormData(prev => ({ ...prev, description: e.target.value }))
            }
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            placeholder="Optional description for this status..."
            rows={4}
          />
        </div>
      </div>

      <div className="flex gap-4 pt-6 border-t border-white/20">
        <Button
          type="submit"
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
        >
          Update Description
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-white/20 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default LessonStatusForm;



import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from '../ui/use-toast';
import GlassCard from '../common/GlassCard';
import BasicClassInfo from './forms/BasicClassInfo';
import DateTimeFields from './forms/DateTimeFields';
import RecurringOptions from './forms/RecurringOptions';

export interface ScheduleFormData {
  id?: string;
  classId: string;
  teacherId: string;
  studentIds: string[];
  classroomId: string;
  date: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurringPattern?: 'weekly' | 'biweekly' | 'monthly';
  notes?: string;
}

interface ScheduleClassFormProps {
  onSubmit: (data: ScheduleFormData) => void;
  onCancel: () => void;
  initialData?: ScheduleFormData;
}

const ScheduleClassForm: React.FC<ScheduleClassFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    classId: initialData?.classId || '',
    teacherId: initialData?.teacherId || '',
    studentIds: initialData?.studentIds || [],
    classroomId: initialData?.classroomId || '',
    date: initialData?.date || '',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    isRecurring: initialData?.isRecurring || false,
    recurringPattern: initialData?.recurringPattern || 'weekly',
    notes: initialData?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.classId || !formData.teacherId || !formData.classroomId || 
        !formData.date || !formData.startTime || !formData.endTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.studentIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one student.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
  };
  return (
    <GlassCard className="p-6 w-full mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {initialData ? 'Reschedule Class' : 'Schedule New Class'}
        </h2>
        <p className="text-white/70">
          Fill in the details below to schedule a class session
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicClassInfo formData={formData} onFormDataChange={setFormData} />
        
        <DateTimeFields formData={formData} onFormDataChange={setFormData} />

        <RecurringOptions
          isRecurring={formData.isRecurring}
          recurringPattern={formData.recurringPattern}
          onRecurringChange={(isRecurring) => setFormData({...formData, isRecurring})}
          onPatternChange={(pattern) => setFormData({...formData, recurringPattern: pattern})}
        />

        {/* Notes */}
        <div>
          <Label className="text-white mb-2 block">Notes</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Additional notes for this class session..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium"
          >
            {initialData ? 'Update Schedule' : 'Schedule Class'}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
};

export default ScheduleClassForm;

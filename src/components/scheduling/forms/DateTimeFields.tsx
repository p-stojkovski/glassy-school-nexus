
import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Calendar, Clock } from 'lucide-react';
import { ScheduleFormData } from '../types';

interface DateTimeFieldsProps {
  formData: ScheduleFormData;
  onFormDataChange: (data: ScheduleFormData) => void;
}

const DateTimeFields: React.FC<DateTimeFieldsProps> = ({ formData, onFormDataChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Date */}
      <div>
        <Label className="text-white mb-2 block">
          <Calendar className="w-4 h-4 inline mr-2" />
          Date *
        </Label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => onFormDataChange({...formData, date: e.target.value})}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>

      {/* Start Time */}
      <div>
        <Label className="text-white mb-2 block">
          <Clock className="w-4 h-4 inline mr-2" />
          Start Time *
        </Label>
        <Input
          type="time"
          value={formData.startTime}
          onChange={(e) => onFormDataChange({...formData, startTime: e.target.value})}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>

      {/* End Time */}
      <div>
        <Label className="text-white mb-2 block">
          <Clock className="w-4 h-4 inline mr-2" />
          End Time *
        </Label>
        <Input
          type="time"
          value={formData.endTime}
          onChange={(e) => onFormDataChange({...formData, endTime: e.target.value})}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>
    </div>
  );
};

export default DateTimeFields;

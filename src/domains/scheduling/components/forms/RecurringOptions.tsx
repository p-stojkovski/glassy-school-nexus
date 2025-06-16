import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Repeat } from 'lucide-react';
import { RecurringPattern } from '@/types/enums';

interface RecurringOptionsProps {
  isRecurring: boolean;
  recurringPattern: RecurringPattern;
  onRecurringChange: (isRecurring: boolean) => void;
  onPatternChange: (pattern: RecurringPattern) => void;
}

const RecurringOptions: React.FC<RecurringOptionsProps> = ({
  isRecurring,
  recurringPattern,
  onRecurringChange,
  onPatternChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={isRecurring}
          onCheckedChange={(checked) => onRecurringChange(!!checked)}
          className="border-white/20"
        />
        <Label className="text-white">
          <Repeat className="w-4 h-4 inline mr-2" />
          Recurring Class
        </Label>
      </div>

      {isRecurring && (
        <div>
          <Label className="text-white mb-2 block">Recurring Pattern</Label>
          <Select
            value={recurringPattern}
            onValueChange={(value: RecurringPattern) => onPatternChange(value)}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default RecurringOptions;

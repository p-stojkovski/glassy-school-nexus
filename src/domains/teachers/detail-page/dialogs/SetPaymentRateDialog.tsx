import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  SetTeacherPaymentRateRequest,
  UpdateTeacherPaymentRateRequest,
  TeacherPaymentRateResponse,
  PAYMENT_RATE_VALIDATION,
} from '@/types/api/teacherPaymentRate';

interface SetPaymentRateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherId: string;
  classId: string;
  className: string;
  existingRate?: TeacherPaymentRateResponse;
  onSubmit: (
    request: SetTeacherPaymentRateRequest | UpdateTeacherPaymentRateRequest
  ) => Promise<void>;
}

export function SetPaymentRateDialog({
  open,
  onOpenChange,
  teacherId,
  classId,
  className,
  existingRate,
  onSubmit,
}: SetPaymentRateDialogProps) {
  const [ratePerLesson, setRatePerLesson] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!existingRate;

  // Initialize form with existing rate data when editing
  useEffect(() => {
    if (existingRate) {
      setRatePerLesson(existingRate.ratePerLesson.toString());
      setEffectiveFrom(new Date(existingRate.effectiveFrom));
      setNotes(existingRate.notes || '');
    } else {
      // Reset form for new rate
      setRatePerLesson('');
      setEffectiveFrom(new Date());
      setNotes('');
    }
    setErrors({});
  }, [existingRate, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const rate = parseFloat(ratePerLesson);
    if (!ratePerLesson || isNaN(rate)) {
      newErrors.ratePerLesson = 'Rate per lesson is required';
    } else if (rate <= 0) {
      newErrors.ratePerLesson = 'Rate must be greater than zero';
    } else if (rate > PAYMENT_RATE_VALIDATION.MAX_RATE) {
      newErrors.ratePerLesson = `Rate cannot exceed ${PAYMENT_RATE_VALIDATION.MAX_RATE.toLocaleString()}`;
    }

    if (notes && notes.length > PAYMENT_RATE_VALIDATION.MAX_NOTES_LENGTH) {
      newErrors.notes = `Notes cannot exceed ${PAYMENT_RATE_VALIDATION.MAX_NOTES_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        const request: UpdateTeacherPaymentRateRequest = {
          ratePerLesson: parseFloat(ratePerLesson),
          notes: notes || undefined,
        };
        await onSubmit(request);
      } else {
        const request: SetTeacherPaymentRateRequest = {
          classId,
          ratePerLesson: parseFloat(ratePerLesson),
          effectiveFrom: effectiveFrom ? format(effectiveFrom, 'yyyy-MM-dd') : undefined,
          notes: notes || undefined,
        };
        await onSubmit(request);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit payment rate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Payment Rate' : 'Set Payment Rate'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update the payment rate for ${className}`
              : `Set a new payment rate for ${className}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rate Per Lesson */}
          <div className="space-y-2">
            <Label htmlFor="ratePerLesson">
              Rate per Lesson <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ratePerLesson"
              type="number"
              step="0.01"
              min="0.01"
              max={PAYMENT_RATE_VALIDATION.MAX_RATE}
              placeholder="0.00"
              value={ratePerLesson}
              onChange={(e) => setRatePerLesson(e.target.value)}
              className={cn(errors.ratePerLesson && 'border-red-500')}
            />
            {errors.ratePerLesson && (
              <p className="text-sm text-red-500">{errors.ratePerLesson}</p>
            )}
          </div>

          {/* Effective From (only for new rates) */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="effectiveFrom">Effective From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="effectiveFrom"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !effectiveFrom && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {effectiveFrom ? format(effectiveFrom, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={effectiveFrom}
                    onSelect={setEffectiveFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes
              <span className="text-sm text-gray-400 ml-2">
                ({notes.length}/{PAYMENT_RATE_VALIDATION.MAX_NOTES_LENGTH})
              </span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Optional notes about this payment rate..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={PAYMENT_RATE_VALIDATION.MAX_NOTES_LENGTH}
              className={cn(errors.notes && 'border-red-500')}
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Rate' : 'Set Rate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

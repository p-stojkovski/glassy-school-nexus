import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClassResponse, ClassBasicInfoResponse } from '@/types/api/class';
import { classApiService, transferStudent } from '@/services/classApiService';
import { toast } from 'sonner';

interface TransferStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceClass: ClassBasicInfoResponse;
  studentId: string;
  studentName: string;
  onSuccess: () => void;
}

export default function TransferStudentDialog({
  open,
  onOpenChange,
  sourceClass,
  studentId,
  studentName,
  onSuccess,
}: TransferStudentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<ClassResponse[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load available classes when dialog opens
  useEffect(() => {
    if (open) {
      loadClasses();
      // Reset state
      setSelectedClassId(null);
      setReason('');
      setSearchTerm('');
    }
  }, [open]);

  const loadClasses = async () => {
    setIsLoadingClasses(true);
    try {
      const allClasses = await classApiService.getAllClasses();
      // Filter out the source class and only show classes with available capacity
      const filtered = allClasses.filter(
        (c) => c.id !== sourceClass.id && c.availableSlots > 0
      );
      setAvailableClasses(filtered);
    } catch (error: any) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load available classes');
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedClassId) {
      toast.error('Please select a target class');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await transferStudent(sourceClass.id, studentId, {
        targetClassId: selectedClassId,
        reason: reason.trim() || undefined,
      });

      const targetClassName =
        availableClasses.find((c) => c.id === selectedClassId)?.name || 'new class';

      toast.success(
        `${studentName} transferred to ${targetClassName} successfully`
      );
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to transfer student');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter classes by search term
  const filteredClasses = availableClasses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedClass = availableClasses.find((c) => c.id === selectedClassId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-400" />
            Transfer Student
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Transfer <span className="font-medium text-white">{studentName}</span> from{' '}
            <span className="font-medium text-white">{sourceClass.name}</span> to another
            class
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Class Search */}
          <div className="space-y-2">
            <Label className="text-white/80 text-sm">Select Target Class</Label>
            <Input
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          {/* Class List */}
          <ScrollArea className="h-[220px] rounded-md border border-white/10 bg-white/5">
            {isLoadingClasses ? (
              <div className="flex items-center justify-center h-full py-8">
                <Loader2 className="w-6 h-6 animate-spin text-white/40" />
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-white/40">
                <Users className="w-8 h-8 mb-2" />
                <p className="text-sm">
                  {searchTerm
                    ? 'No matching classes found'
                    : 'No available classes with capacity'}
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredClasses.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedClassId === cls.id
                        ? 'bg-blue-500/30 border border-blue-400/50'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">{cls.name}</p>
                        <p className="text-sm text-white/60 truncate">
                          {cls.subjectName} • {cls.teacherName}
                        </p>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            cls.availableSlots > 3
                              ? 'bg-green-500/20 text-green-300'
                              : cls.availableSlots > 1
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {cls.availableSlots} slot{cls.availableSlots !== 1 ? 's' : ''} left
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Selected Class Preview */}
          {selectedClass && (
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
              <p className="text-sm text-white/60">Transferring to:</p>
              <p className="font-medium text-white">{selectedClass.name}</p>
              <p className="text-sm text-white/60">
                {selectedClass.subjectName} • {selectedClass.teacherName}
              </p>
            </div>
          )}

          {/* Reason (Optional) */}
          <div className="space-y-2">
            <Label className="text-white/80 text-sm">
              Reason for Transfer{' '}
              <span className="text-white/40">(optional)</span>
            </Label>
            <Textarea
              placeholder="E.g., Schedule conflict, changed skill level, parent request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedClassId}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4" />
                Transfer Student
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

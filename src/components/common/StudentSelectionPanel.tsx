import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Users,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Student } from '@/domains/students/studentsSlice';
import { Class } from '@/domains/classes/classesSlice';
import { cn } from '@/lib/utils';
import { studentApiService } from '@/services/studentApiService';
// CapacityValidationPanel removed - capacity info now shown in button

interface StudentSelectionPanelProps {
  students?: Student[]; // Made optional since we'll load them independently
  classes: Class[];
  selectedStudentIds: string[];
  excludeStudentIds?: string[]; // Students to exclude from the available list (client-side filter)
  availableForEnrollment?: boolean; // If true, only fetch students not enrolled in any class (server-side filter)
  onSelectionChange: (studentIds: string[]) => void;
  onClose: () => void;
  isOpen: boolean;
  title?: string;
  allowMultiple?: boolean;
  maxSelections?: number;
  className?: string;
  classData?: {
    id: string;
    enrolledCount: number;
    classroomCapacity: number;
    availableSlots: number;
  };
}

const StudentSelectionPanel: React.FC<StudentSelectionPanelProps> = ({
  students: propStudents = [],
  classes,
  selectedStudentIds,
  excludeStudentIds = [],
  availableForEnrollment = false,
  onSelectionChange,
  onClose,
  isOpen,
  title = 'Select Students',
  allowMultiple = true,
  maxSelections,
  className,
  classData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelectedIds, setTempSelectedIds] =
    useState<string[]>(selectedStudentIds);
  
  // Independent student loading state
  const [loadedStudents, setLoadedStudents] = useState<Student[]>(propStudents);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  
  // Use prop students if provided, otherwise use loaded students
  // Ensure students is always an array
  const students = Array.isArray(propStudents) && propStudents.length > 0 ? propStudents : (Array.isArray(loadedStudents) ? loadedStudents : []);

  // Load students when panel opens (if not provided via props)
  useEffect(() => {
    const loadStudents = async () => {
      if (isOpen && propStudents.length === 0 && loadedStudents.length === 0 && !isLoadingStudents && !studentsError) {
        console.log('🔄 Loading students for sidebar...');
        setIsLoadingStudents(true);
        setStudentsError(null);
        
        try {      
          const { students: activeStudents } = await studentApiService.searchStudents({ 
            isActive: true, 
            notEnrolledInAnyClass: availableForEnrollment || undefined,
            skip: 0, 
            take: 1000 
          });
          console.log('✅ Students loaded for sidebar:', activeStudents?.length || 0);
          setLoadedStudents(Array.isArray(activeStudents) ? activeStudents : []);
        } catch (error: any) {
          console.error('❌ Failed to load students for sidebar:', error);
          setStudentsError(error?.message || 'Failed to load students');
        } finally {
          setIsLoadingStudents(false);
        }
      }
    };

    loadStudents();
  }, [isOpen, propStudents.length]); // ✅ Removed isLoadingStudents and studentsError from deps

  // Reset temp selection when panel opens
  useEffect(() => {
    if (isOpen) {
      setTempSelectedIds(selectedStudentIds);
    }
  }, [isOpen, selectedStudentIds]);

  // Reset error state when panel closes (but keep loaded students)
  useEffect(() => {
    if (!isOpen && studentsError) {
      setStudentsError(null);
    }
  }, [isOpen, studentsError]);

  // Filter students based on search query and exclusions
  const filteredStudents = useMemo(() => {
    // Ensure students is an array before filtering
    const studentArray = Array.isArray(students) ? students : [];
    
    // First, exclude students that should not be shown (e.g., already enrolled)
    let filtered = excludeStudentIds.length > 0
      ? studentArray.filter(student => !excludeStudentIds.includes(student.id))
      : studentArray;
    
    // Apply search query filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) => {
          const fullName = student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim();
          return (
            fullName.toLowerCase().includes(lowercasedQuery) ||
            student.firstName?.toLowerCase().includes(lowercasedQuery) ||
            student.lastName?.toLowerCase().includes(lowercasedQuery) ||
            student.email?.toLowerCase().includes(lowercasedQuery) ||
            student.phone?.toLowerCase().includes(lowercasedQuery)
          );
        }
      );
    }
    // Create a copy before sorting to avoid mutating the original array
    return [...filtered].sort((a, b) => {
      const nameA = a.fullName || `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.email || '';
      const nameB = b.fullName || `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.email || '';
      return nameA.localeCompare(nameB);
    });
  }, [students, searchQuery, excludeStudentIds]);

  // Get selected students info
  const selectedStudents = useMemo(() => {
    return students.filter((student) => tempSelectedIds.includes(student.id));
  }, [students, tempSelectedIds]);

  // Capacity validation
  const capacityInfo = useMemo(() => {
    if (!classData) return { hasIssue: false, overBy: 0, remaining: null };
    const totalAfterAdd = classData.enrolledCount + tempSelectedIds.length;
    const remaining = classData.classroomCapacity - totalAfterAdd;
    return {
      hasIssue: totalAfterAdd > classData.classroomCapacity,
      overBy: Math.max(0, totalAfterAdd - classData.classroomCapacity),
      remaining: remaining,
    };
  }, [classData, tempSelectedIds.length]);

  const hasCapacityIssue = capacityInfo.hasIssue;

  const handleSelect = (student: Student) => {
    const isSelected = tempSelectedIds.includes(student.id);

    if (isSelected) {
      // Remove student
      setTempSelectedIds((prev) => prev.filter((id) => id !== student.id));
    } else {
      if (!allowMultiple) {
        // Single selection mode
        setTempSelectedIds([student.id]);
      } else {
        // Multiple selection mode
        if (maxSelections && tempSelectedIds.length >= maxSelections) {
          return; // Don't add if at max
        }
        setTempSelectedIds((prev) => [...prev, student.id]);
      }
    }
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredStudents.map((student) => student.id);
    const newSelection = maxSelections
      ? allFilteredIds.slice(
          0,
          maxSelections -
            tempSelectedIds.length +
            allFilteredIds.filter((id) => tempSelectedIds.includes(id)).length
        )
      : allFilteredIds;

    setTempSelectedIds((prev) => {
      const nonFilteredSelected = prev.filter(
        (id) => !allFilteredIds.includes(id)
      );
      return [...nonFilteredSelected, ...newSelection];
    });
  };

  const handleDeselectAll = () => {
    const allFilteredIds = filteredStudents.map((student) => student.id);
    setTempSelectedIds((prev) =>
      prev.filter((id) => !allFilteredIds.includes(id))
    );
  };

  const handleApply = () => {
    onSelectionChange(tempSelectedIds);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedIds(selectedStudentIds);
    onClose();
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      // Escape to close
      if (event.key === 'Escape') {
        onClose();
      }

      // Ctrl+Enter to apply (if valid)
      if (event.key === 'Enter' && event.ctrlKey) {
        if (tempSelectedIds.length > 0 && !isLoadingStudents && !studentsError && !hasCapacityIssue) {
          handleApply();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, tempSelectedIds.length, isLoadingStudents, studentsError, hasCapacityIssue, handleApply]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-white/10 backdrop-blur-md border border-white/20 text-white overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-4 py-4 border-b border-white/10">
            <SheetTitle className="flex items-center gap-2 text-white text-lg font-semibold">
              <Users className="w-5 h-5 text-yellow-400" />
              {title}
            </SheetTitle>
          </SheetHeader>

          {/* Search Section - Consolidated */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {!isLoadingStudents && !studentsError && filteredStudents.length > 0 && allowMultiple && (
                  <>
                    <button
                      onClick={handleSelectAll}
                      disabled={maxSelections !== undefined && tempSelectedIds.length >= maxSelections}
                      className="text-xs text-white/50 hover:text-white/70 transition-colors disabled:opacity-50"
                    >
                      Select All
                    </button>
                    <span className="text-white/30">·</span>
                    <button
                      onClick={handleDeselectAll}
                      className="text-xs text-white/50 hover:text-white/70 transition-colors"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
              {!isLoadingStudents && !studentsError && (
                <span className="text-xs text-white/50">
                  {filteredStudents.length} available{classData && ` · ${classData.availableSlots} slots`}
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-10"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Student List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {/* Loading State */}
              {isLoadingStudents ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-white/40" />
                  <p className="text-sm font-medium text-white/70">Loading students...</p>
                  <p className="text-xs text-white/40 mt-1">Please wait</p>
                </div>
              ) : studentsError ? (
                /* Error State */
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="w-12 h-12 mb-4 text-red-400/60" />
                  <p className="text-sm font-medium text-white/70">Failed to load students</p>
                  <p className="text-xs text-white/40 mt-1 text-center max-w-xs">{studentsError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setStudentsError(null);
                      setIsLoadingStudents(true);
                      
                      try {
                        const { students: activeStudents } = await studentApiService.searchStudents({ isActive: true, skip: 0, take: 1000 });
                        setLoadedStudents(Array.isArray(activeStudents) ? activeStudents : []);
                      } catch (error: any) {
                        setStudentsError(error?.message || 'Failed to load students');
                      } finally {
                        setIsLoadingStudents(false);
                      }
                    }}
                    className="mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  >
                    Try Again
                  </Button>
                </div>
              ) : filteredStudents.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="w-12 h-12 text-white/40 mb-4" />
                  <p className="text-sm font-medium text-white/70">
                    {searchQuery ? 'No students match your search' : 'No students available'}
                  </p>
                  {searchQuery ? (
                    <p className="text-xs text-white/40 mt-1">Try different keywords or check if students are already enrolled</p>
                  ) : (
                    <p className="text-xs text-white/40 mt-1 text-center max-w-xs">All active students are already enrolled in classes</p>
                  )}
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = tempSelectedIds.includes(student.id);
                  const isDisabled =
                    !allowMultiple && tempSelectedIds.length > 0 && !isSelected;
                  const isMaxReached =
                    maxSelections &&
                    tempSelectedIds.length >= maxSelections &&
                    !isSelected;

                  return (
                    <div
                      key={student.id}
                      onClick={() =>
                        !isDisabled && !isMaxReached && handleSelect(student)
                      }
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer',
                        isSelected
                          ? 'bg-white/10 border-white/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20',
                        (isDisabled || isMaxReached) &&
                          'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {/* Checkbox */}
                      <div
                        className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0',
                          isSelected
                            ? 'bg-white/20 border-white/40'
                            : 'border-white/30 hover:border-white/50'
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>

                      {/* Student Info - Simplified */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email || 'Unknown Student'}
                        </p>
                        {student.email && (
                          <p className="text-xs text-white/50 truncate">{student.email}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Footer Actions - Smart button with capacity feedback */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-3">
              <Button
                onClick={handleApply}
                disabled={tempSelectedIds.length === 0 || isLoadingStudents || studentsError !== null || hasCapacityIssue}
                className={cn(
                  'flex-1 font-semibold disabled:opacity-50 disabled:cursor-not-allowed',
                  hasCapacityIssue
                    ? 'bg-red-500/80 hover:bg-red-500 text-white'
                    : capacityInfo.remaining !== null && capacityInfo.remaining <= 2 && capacityInfo.remaining >= 0
                    ? 'bg-amber-500 hover:bg-amber-600 text-black'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                )}
              >
                {tempSelectedIds.length === 0
                  ? 'Select Students'
                  : hasCapacityIssue
                  ? `Exceeds by ${capacityInfo.overBy}`
                  : capacityInfo.remaining !== null && capacityInfo.remaining <= 2
                  ? `Add ${tempSelectedIds.length} · ${capacityInfo.remaining} left`
                  : `Add ${tempSelectedIds.length} Student${tempSelectedIds.length !== 1 ? 's' : ''}`}
              </Button>
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="flex-1 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StudentSelectionPanel;


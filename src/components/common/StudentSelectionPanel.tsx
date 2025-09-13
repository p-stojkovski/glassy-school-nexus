import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Users,
  Check,
  UserCheck,
  UserX,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import FormButtons from '@/components/common/FormButtons';
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

interface StudentSelectionPanelProps {
  students?: Student[]; // Made optional since we'll load them independently
  classes: Class[];
  selectedStudentIds: string[];
  onSelectionChange: (studentIds: string[]) => void;
  onClose: () => void;
  isOpen: boolean;
  title?: string;
  allowMultiple?: boolean;
  maxSelections?: number;
  className?: string;
}

const StudentSelectionPanel: React.FC<StudentSelectionPanelProps> = ({
  students: propStudents = [],
  classes,
  selectedStudentIds,
  onSelectionChange,
  onClose,
  isOpen,
  title = 'Select Students',
  allowMultiple = true,
  maxSelections,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelectedIds, setTempSelectedIds] =
    useState<string[]>(selectedStudentIds);
  
  // Independent student loading state
  const [loadedStudents, setLoadedStudents] = useState<Student[]>(propStudents);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  
  // Use prop students if provided, otherwise use loaded students
  const students = propStudents.length > 0 ? propStudents : loadedStudents;

  // Load students when panel opens (if not provided via props)
  useEffect(() => {
    const loadStudents = async () => {
      if (isOpen && propStudents.length === 0 && loadedStudents.length === 0 && !isLoadingStudents && !studentsError) {
        console.log('🔄 Loading students for sidebar...');
        setIsLoadingStudents(true);
        setStudentsError(null);
        
        try {
          
          studentApiService
          
          const studentsData = await studentApiService.getAllStudents();
          console.log('✅ Students loaded for sidebar:', studentsData?.length || 0);
          setLoadedStudents(studentsData);
        } catch (error: any) {
          console.error('❌ Failed to load students for sidebar:', error);
          setStudentsError(error?.message || 'Failed to load students');
        } finally {
          setIsLoadingStudents(false);
          
          
          studentApiService
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

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);
  // Filter students based on search query only
  const filteredStudents = useMemo(() => {
    let filtered = students;
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
  }, [students, searchQuery]);

  // Get selected students info
  const selectedStudents = useMemo(() => {
    return students.filter((student) => tempSelectedIds.includes(student.id));
  }, [students, tempSelectedIds]);

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
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="flex items-center justify-between px-6 py-4 border-b border-white/20">
            <SheetTitle className="flex items-center gap-3 text-white text-2xl font-bold">
              <Users className="w-5 h-5" />
              {title}
            </SheetTitle>
          </SheetHeader>
          {/* Search */}
          <div className="p-4 space-y-3 border-b border-white/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60"
              />
            </div>

            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearSearch}
                className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <X className="w-3 h-3 mr-2" />
                Clear Search
              </Button>
            )}
          </div>
          {/* Selection Summary */}
          {tempSelectedIds.length > 0 && (
            <div className="px-4 py-3 bg-white/5 border-b border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">
                  Selected ({tempSelectedIds.length})
                  {maxSelections && ` / ${maxSelections}`}
                </span>
                {allowMultiple && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTempSelectedIds([])}
                    className="text-white/70 hover:text-white hover:bg-white/10 h-6 px-2 text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {selectedStudents.slice(0, 5).map((student) => (
                  <Badge
                    key={student.id}
                    variant="secondary"
                    className="bg-blue-500/20 text-white border border-blue-400/30 text-xs font-medium"
                  >
                    {student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email || 'Unknown'}
                    <button
                      onClick={() => handleSelect(student)}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      title="Remove student"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </Badge>
                ))}
                {selectedStudents.length > 5 && (
                  <Badge variant="outline" className="text-white/70 text-xs">
                    +{selectedStudents.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          {/* Bulk Actions */}
          {allowMultiple && filteredStudents.length > 0 && !isLoadingStudents && !studentsError && (
            <div className="px-4 py-3 border-b border-white/20">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                  disabled={
                    maxSelections && tempSelectedIds.length >= maxSelections
                  }
                >
                  <UserCheck className="w-3 h-3 mr-1" />
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                >
                  <UserX className="w-3 h-3 mr-1" />
                  Deselect All
                </Button>
              </div>
            </div>
          )}
          {/* Student List */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-2">
              {/* Loading State */}
              {isLoadingStudents ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/60">
                  <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-400" />
                  <p className="font-medium">Loading students...</p>
                  <p className="text-sm text-white/40">Please wait while we fetch the student list</p>
                </div>
              ) : studentsError ? (
                /* Error State */
                <div className="flex flex-col items-center justify-center py-12 text-white/60">
                  <AlertCircle className="w-8 h-8 mb-3 text-red-400" />
                  <p className="font-medium text-red-300">Failed to load students</p>
                  <p className="text-sm text-white/40 text-center max-w-xs">{studentsError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setStudentsError(null);
                      setIsLoadingStudents(true);
                      
                      try {
                        
                        studentApiService
                        
                        const studentsData = await studentApiService.getAllStudents();
                        setLoadedStudents(studentsData);
                      } catch (error: any) {
                        setStudentsError(error?.message || 'Failed to load students');
                      } finally {
                        setIsLoadingStudents(false);
                        
                        
                        studentApiService
                      }
                    }}
                    className="mt-3 bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    Try Again
                  </Button>
                </div>
              ) : filteredStudents.length === 0 ? (
                /* Empty State */
                <div className="text-center py-8 text-white/60">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p>No students found</p>
                  {searchQuery && (
                    <p className="text-sm">Try adjusting your search</p>
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
                          ? 'bg-blue-500/20 border-blue-400/50 shadow-sm ring-1 ring-blue-400/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20',
                        (isDisabled || isMaxReached) &&
                          'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div
                        className={cn(
                          'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
                          isSelected
                            ? 'bg-blue-500 border-blue-500 shadow-sm'
                            : 'border-white/30 hover:border-white/50'
                        )}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-white truncate text-sm leading-tight">
                              {student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email || 'Unknown Student'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {(student.fullName || student.firstName || student.lastName) && student.email && (
                                <p className="text-xs text-white/60 truncate">
                                  {student.email}
                                </p>
                              )}
                              {student.phone && (
                                <span className="text-white/40">•</span>
                              )}
                              {student.phone && (
                                <p className="text-xs text-white/60 truncate">
                                  {student.phone}
                                </p>
                              )}
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>{' '}
          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-white/20">
            <FormButtons
              onSubmit={handleApply}
              onCancel={handleCancel}
              submitText={`Apply (${tempSelectedIds.length})`}
              disabled={isLoadingStudents || studentsError !== null || (!allowMultiple && tempSelectedIds.length === 0)}
              variant="compact"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StudentSelectionPanel;


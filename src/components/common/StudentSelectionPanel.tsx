import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { X, Search, Users, Check, Filter, BookOpen, UserCheck, UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Student } from '@/store/slices/studentsSlice';
import { Class } from '@/store/slices/classesSlice';
import { RootState } from '@/store';
import { cn } from '@/lib/utils';

interface StudentSelectionPanelProps {
  students: Student[];
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
  students,
  selectedStudentIds,
  onSelectionChange,
  onClose,
  isOpen,
  title = 'Select Students',
  allowMultiple = true,
  maxSelections,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>(selectedStudentIds);

  // Reset temp selection when panel opens
  useEffect(() => {
    if (isOpen) {
      setTempSelectedIds(selectedStudentIds);
    }
  }, [isOpen, selectedStudentIds]);

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
  }, [isOpen, onClose]);  // Get classes from store
  const { classes } = useSelector((state: RootState) => state.classes);
  
  // Get available classes for filter, using actual class data
  const availableClasses = useMemo(() => {
    // Create a map of class IDs to class names for easier reference
    const classMap = classes.reduce((acc: Record<string, string>, cls: Class) => {
      acc[cls.id] = cls.name;
      return acc;
    }, {});
    
    // Get unique classIds from students that have assigned classes
    const classIds = students
      .map(student => student.classId)
      .filter(Boolean)
      .filter((classId, index, array) => array.indexOf(classId) === index);
    
    // Return array of class IDs with proper names
    return classIds;
  }, [students, classes]);
  // Filter students based on search query, status, and grade
  const filteredStudents = useMemo(() => {
    let filtered = students;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }
    // Apply class filter (using classId as proxy for grade)
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(student => student.classId === gradeFilter);
    }
    
    // Apply search query filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(lowercasedQuery) || 
        student.email.toLowerCase().includes(lowercasedQuery) ||
        student.phone?.toLowerCase().includes(lowercasedQuery)
      );
    }
    
    // Create a copy before sorting to avoid mutating the original array
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [students, searchQuery, statusFilter, gradeFilter]);

  // Get selected students info
  const selectedStudents = useMemo(() => {
    return students.filter(student => tempSelectedIds.includes(student.id));
  }, [students, tempSelectedIds]);

  const handleSelect = (student: Student) => {
    const isSelected = tempSelectedIds.includes(student.id);
    
    if (isSelected) {
      // Remove student
      setTempSelectedIds(prev => prev.filter(id => id !== student.id));
    } else {
      if (!allowMultiple) {
        // Single selection mode
        setTempSelectedIds([student.id]);
      } else {
        // Multiple selection mode
        if (maxSelections && tempSelectedIds.length >= maxSelections) {
          return; // Don't add if at max
        }
        setTempSelectedIds(prev => [...prev, student.id]);
      }
    }
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredStudents.map(student => student.id);
    const newSelection = maxSelections 
      ? allFilteredIds.slice(0, maxSelections - tempSelectedIds.length + allFilteredIds.filter(id => tempSelectedIds.includes(id)).length)
      : allFilteredIds;
    
    setTempSelectedIds(prev => {
      const nonFilteredSelected = prev.filter(id => !allFilteredIds.includes(id));
      return [...nonFilteredSelected, ...newSelection];
    });
  };

  const handleDeselectAll = () => {
    const allFilteredIds = filteredStudents.map(student => student.id);
    setTempSelectedIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
  };

  const handleApply = () => {
    onSelectionChange(tempSelectedIds);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedIds(selectedStudentIds);
    onClose();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setGradeFilter('all');
  };  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md p-0 bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="flex items-center justify-between p-6 border-b border-white/20">
            <SheetTitle className="flex items-center gap-3 text-white text-2xl font-bold">
              <Users className="w-5 h-5" />
              {title}
            </SheetTitle>
          </SheetHeader>

          {/* Search and Filters */}
          <div className="p-6 space-y-4 border-b border-white/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border border-white/30">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border border-white/30">
                  <SelectItem value="all">All Classes</SelectItem>
                  {availableClasses.map(classId => {
                    const className = classes.find(cls => cls.id === classId)?.name || classId;
                    return (
                      <SelectItem key={classId} value={classId}>{className}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || statusFilter !== 'all' || gradeFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <Filter className="w-3 h-3 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Selection Summary */}
          {tempSelectedIds.length > 0 && (
            <div className="p-4 bg-white/5 border-b border-white/20">
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
                {selectedStudents.slice(0, 5).map(student => (
                  <Badge
                    key={student.id}
                    variant="secondary"
                    className="bg-blue-500/20 text-white border border-blue-400/30 text-xs"
                  >
                    {student.name}
                    <button
                      onClick={() => handleSelect(student)}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5"
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
          {allowMultiple && filteredStudents.length > 0 && (
            <div className="p-4 border-b border-white/20">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                  disabled={maxSelections && tempSelectedIds.length >= maxSelections}
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
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p>No students found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              ) : (
                filteredStudents.map(student => {
                  const isSelected = tempSelectedIds.includes(student.id);
                  const isDisabled = !allowMultiple && tempSelectedIds.length > 0 && !isSelected;
                  const isMaxReached = maxSelections && tempSelectedIds.length >= maxSelections && !isSelected;
                  
                  return (
                    <div
                      key={student.id}
                      onClick={() => !isDisabled && !isMaxReached && handleSelect(student)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                        isSelected 
                          ? "bg-blue-500/20 border-blue-400/40 shadow-sm" 
                          : "bg-white/5 border-white/10 hover:bg-white/10",
                        (isDisabled || isMaxReached) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center",
                        isSelected 
                          ? "bg-blue-500 border-blue-500" 
                          : "border-white/30"
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white truncate">{student.name}</p>
                          <Badge
                            variant={student.status === 'active' ? 'default' : 'secondary'}
                            className={cn(
                              "text-xs px-1.5 py-0",
                              student.status === 'active' 
                                ? "bg-green-500/20 text-green-300 border border-green-400/30" 
                                : "bg-gray-500/20 text-gray-300 border border-gray-400/30"
                            )}
                          >
                            {student.status}
                          </Badge>
                        </div>                        
                            <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-white/70 truncate">{student.email}</p>                          <div className="flex items-center gap-1 text-xs text-white/60">
                            <BookOpen className="w-3 h-3" />
                            <span>{classes.find(cls => cls.id === student.classId)?.name || student.classId}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>          {/* Footer Actions */}
          <div className="p-6 border-t border-white/20">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!allowMultiple && tempSelectedIds.length === 0}
              >
                Apply ({tempSelectedIds.length})
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StudentSelectionPanel;

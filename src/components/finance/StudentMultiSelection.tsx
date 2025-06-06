import React, { useState, useEffect } from 'react';
import { X, Check, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Student } from '@/store/slices/studentsSlice';

interface StudentMultiSelectionProps {
  students: Student[];
  selectedStudents: Student[];
  onChange: (students: Student[]) => void;
  disabled?: boolean;
}

const StudentMultiSelection: React.FC<StudentMultiSelectionProps> = ({
  students,
  selectedStudents,
  onChange,
  disabled = false
}) => {  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);
  const [classFilter, setClassFilter] = useState<string>('all_classes');  // Close popover when component unmounts to prevent async issues
  useEffect(() => {
    return () => {
      if (open) setOpen(false);
    };
  }, [open]);
  
  // Handle cleanup when the component unmounts
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [open]);
    // Get unique class IDs for filtering with better memoization
  const classIds = React.useMemo(() => {
    // Using a Map for better performance with large datasets
    const uniqueClassIds = new Map<string, boolean>();
    
    // Process all students, but only once per unique classId
    for (const student of students) {
      if (student.classId && !uniqueClassIds.has(student.classId)) {
        uniqueClassIds.set(student.classId, true);
      }
    }
    
    return Array.from(uniqueClassIds.keys());
  }, [students]);
  // Filter students based on search query and class filter
  useEffect(() => {
    let filtered = students;
    
    // Apply class filter if selected
    if (classFilter && classFilter !== 'all_classes') {
      filtered = filtered.filter(student => student.classId === classFilter);
    }
    
    // Apply search query filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(lowercasedQuery) || 
        student.email.toLowerCase().includes(lowercasedQuery) || 
        (student.id && student.id.toLowerCase().includes(lowercasedQuery)) ||
        (student.classId && student.classId.toLowerCase().includes(lowercasedQuery))
      );
    }
    
    setFilteredStudents(filtered);
  }, [searchQuery, students, classFilter]);

  const handleSelect = (student: Student) => {
    const isSelected = selectedStudents.some(s => s.id === student.id);
    
    if (isSelected) {
      // Remove student
      onChange(selectedStudents.filter(s => s.id !== student.id));
    } else {
      // Add student
      onChange([...selectedStudents, student]);
    }
  };

  const handleRemoveSelected = (studentId: string) => {
    onChange(selectedStudents.filter(student => student.id !== studentId));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Function to select all filtered students
  const handleSelectAllFiltered = () => {
    // Create a set of existing selected student IDs for faster lookup
    const existingSelectedIds = new Set(selectedStudents.map(s => s.id));
    
    // Add all filtered students that aren't already selected
    const newSelectedStudents = [...selectedStudents];
    let addedCount = 0;
    
    filteredStudents.forEach(student => {
      if (!existingSelectedIds.has(student.id)) {
        newSelectedStudents.push(student);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      onChange(newSelectedStudents);
      return addedCount;
    }
    
    return 0;
  };
  
  // Function to deselect all filtered students
  const handleDeselectAllFiltered = () => {
    // Get set of filtered student IDs
    const filteredIds = new Set(filteredStudents.map(s => s.id));
    
    // Keep only students not in the filtered set
    const remainingStudents = selectedStudents.filter(student => !filteredIds.has(student.id));
    
    if (remainingStudents.length !== selectedStudents.length) {
      onChange(remainingStudents);
      return selectedStudents.length - remainingStudents.length;
    }
    
    return 0;
  };
  
  return (
    <div className="space-y-4">
      {/* Add class filter */}
      <div className="flex items-center gap-2">
        <div className="flex-1">          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>            <SelectContent className="bg-gray-800 text-white border border-white/30 backdrop-blur-sm">
              <SelectItem value="all_classes" className="text-white hover:bg-gray-700 focus:bg-gray-700">All Classes</SelectItem>
              {classIds.map(classId => (
                <SelectItem key={classId} value={classId} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                  Class {classId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>        {classFilter !== 'all_classes' && (
          <Button
            variant="ghost"
            onClick={() => setClassFilter('all_classes')}
            className="h-auto p-1 bg-blue-500/20 hover:bg-blue-500/40 rounded-full border border-blue-400/30 shadow-sm"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear filter</span>
          </Button>
        )}
      </div>
        <div className="flex flex-col space-y-4">        <Popover 
          open={open} 
          onOpenChange={setOpen}
        ><PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between bg-white/30 border-white/50 text-white font-medium w-full h-auto min-h-10 flex-wrap shadow-sm hover:bg-white/40"
              disabled={disabled}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex-1 text-left overflow-hidden">
                  {selectedStudents.length === 0 ? (
                    <span className="text-white/70">Select students...</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedStudents.map(student => (
                        <Badge 
                          key={student.id} 
                          variant="secondary"
                          className="bg-white/20 text-white hover:bg-white/30"
                        >
                          {student.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="ml-2 flex-shrink-0">
                  {selectedStudents.length > 0 ? (
                    <span 
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearAll();
                      }}
                      className="inline-flex h-auto p-1 hover:bg-white/10 rounded-full cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear selection</span>
                    </span>
                  ) : (
                    <Search className="h-4 w-4 opacity-50" />
                  )}
                </div>
              </div>
            </Button>
          </PopoverTrigger>          <PopoverContent 
            className="w-full p-0 bg-gray-800 text-white border border-white/30 backdrop-blur-sm" 
            align="start"
            sideOffset={4}
          >            <Command className="rounded-lg border-none bg-gray-800 text-white w-full" shouldFilter={false}>              <CommandInput 
                placeholder="Search students..." 
                onValueChange={setSearchQuery} 
                autoFocus={false}
                className="text-white placeholder:text-white/70"
              />
              <CommandList>
                <CommandEmpty className="py-6 text-center text-white/70">No students found.</CommandEmpty>
                  {/* Add select/deselect all buttons */}                {filteredStudents.length > 0 && (
                  <div className="flex justify-between p-2 border-b border-white/20">
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectAllFiltered();
                      }}
                      className="text-xs bg-blue-500/20 hover:bg-blue-500/40 text-white font-medium shadow-sm"
                    >
                      <svg className="mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      Select all ({filteredStudents.length})
                    </Button>
                    
                    {selectedStudents.length > 0 && (
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeselectAllFiltered();
                        }}
                        className="text-xs bg-white/30 hover:bg-white/40 text-white font-medium shadow-sm"
                      >
                        <svg className="mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        Deselect filtered
                      </Button>
                    )}
                  </div>
                )}
                
                <CommandGroup>
                  {filteredStudents.map(student => {
                    const isSelected = selectedStudents.some(s => s.id === student.id);                    return (
                      <CommandItem
                        key={student.id}
                        onSelect={() => handleSelect(student)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center">
                          {student.avatar && (
                            <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                              <img 
                                src={student.avatar} 
                                alt={student.name} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          )}
                          <span className="text-white">{student.name}</span>
                        </div>
                        {isSelected && <Check className="h-4 w-4 ml-2 text-white" />}
                      </CommandItem>
                    );
                  })}                </CommandGroup>
              </CommandList>
                {/* Add a Done button to provide a clear way to close the popover */}
              <div className="p-2 border-t border-white/20">
                <Button 
                  type="button"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(false);
                  }}
                >
                  Done
                </Button>
              </div>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      {selectedStudents.length > 0 && (
        <div className="flex flex-wrap gap-1 p-2 bg-white/10 rounded-md">
          {selectedStudents.map(student => (
            <Badge 
              key={student.id} 
              variant="secondary" 
              className="bg-white/20 text-white border-white/30"
            >
              {student.name}              <Button
                variant="ghost"
                onClick={() => handleRemoveSelected(student.id)}
                className="h-auto p-0 ml-1 hover:bg-white/20 rounded-full"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {student.name}</span>
              </Button>
            </Badge>
          ))}
          <div className="text-sm text-white/70 ml-2">
            {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(StudentMultiSelection);

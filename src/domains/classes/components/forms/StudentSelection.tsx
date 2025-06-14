import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, Search, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { Student } from '@/domains/students/studentsSlice';

interface StudentSelectionProps {
  students: Student[];
  selectedStudentIds: string[];
  onChange: (studentIds: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const StudentSelection: React.FC<StudentSelectionProps> = ({
  students,
  selectedStudentIds,
  onChange,
  disabled = false,
  placeholder = 'Select students...'
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get selected students from IDs
  const selectedStudents = useMemo(() => {
    return students.filter(student => selectedStudentIds.includes(student.id));
  }, [students, selectedStudentIds]);

  // Filter students based on search query and status filter
  const filteredStudents = useMemo(() => {
    let filtered = students;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }
    
    // Apply search query filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(lowercasedQuery) || 
        student.email.toLowerCase().includes(lowercasedQuery)
      );
    }
    
    return filtered;
  }, [students, searchQuery, statusFilter]);

  // Close popover when component unmounts to prevent async issues
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

  const handleSelect = (student: Student) => {
    const isSelected = selectedStudentIds.includes(student.id);
    
    if (isSelected) {
      // Remove student
      onChange(selectedStudentIds.filter(id => id !== student.id));
    } else {
      // Add student - check for duplicates to prevent infinite loops
      if (!selectedStudentIds.includes(student.id)) {
        onChange([...selectedStudentIds, student.id]);
      }
    }
  };

  const handleRemoveSelected = (studentId: string) => {
    onChange(selectedStudentIds.filter(id => id !== studentId));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Function to select all filtered students
  const handleSelectAllFiltered = () => {
    const filteredIds = filteredStudents.map(s => s.id);
    const newSelectedIds = [...new Set([...selectedStudentIds, ...filteredIds])];
    onChange(newSelectedIds);
  };
  
  // Function to deselect all filtered students
  const handleDeselectAllFiltered = () => {
    const filteredIds = new Set(filteredStudents.map(s => s.id));
    const remainingIds = selectedStudentIds.filter(id => !filteredIds.has(id));
    onChange(remainingIds);
  };

  // Validation: Prevent assigning the same student multiple times
  const availableStudents = filteredStudents;

  if (students.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-white/70">
          <Users className="w-4 h-4" />
          <span className="text-sm">No students available</span>
        </div>
        <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-300 text-sm">
            No students found. Please add students first before creating a class.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Status filter */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white border border-white/30 backdrop-blur-sm">
              <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">All Students</SelectItem>
              <SelectItem value="active" className="text-white hover:bg-gray-700 focus:bg-gray-700">Active Students</SelectItem>
              <SelectItem value="inactive" className="text-white hover:bg-gray-700 focus:bg-gray-700">Inactive Students</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {statusFilter !== 'all' && (
          <Button
            variant="ghost"
            onClick={() => setStatusFilter('all')}
            className="h-auto p-1 bg-blue-500/20 hover:bg-blue-500/40 rounded-full border border-blue-400/30 shadow-sm"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear filter</span>
          </Button>
        )}
      </div>

      <div className="flex flex-col space-y-4">
        <Popover 
          open={open} 
          onOpenChange={setOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between bg-white/10 border-white/20 text-white font-medium w-full h-auto min-h-12 flex-wrap shadow-sm hover:bg-white/20"
              disabled={disabled}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex-1 text-left overflow-hidden">
                  {selectedStudents.length === 0 ? (
                    <span className="text-white/70">{placeholder}</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedStudents.slice(0, 3).map(student => (
                        <Badge 
                          key={student.id} 
                          variant="secondary"
                          className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30"
                        >
                          {student.name}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveSelected(student.id);
                            }}
                            className="ml-1 hover:bg-blue-500/40 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {selectedStudents.length > 3 && (
                        <Badge 
                          variant="secondary"
                          className="bg-gray-500/20 text-gray-300 border border-gray-500/30"
                        >
                          +{selectedStudents.length - 3} more
                        </Badge>
                      )}
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
          </PopoverTrigger>
          
          <PopoverContent 
            className="w-full p-0 bg-gray-800 text-white border border-white/30 backdrop-blur-sm" 
            align="start"
            sideOffset={4}
          >
            <Command className="rounded-lg border-none bg-gray-800 text-white w-full" shouldFilter={false}>
              <CommandInput 
                placeholder="Search students..." 
                onValueChange={setSearchQuery} 
                autoFocus={false}
                className="text-white placeholder:text-white/70"
              />
              <CommandList>
                <CommandEmpty className="py-6 text-center text-white/70">No students found.</CommandEmpty>
                
                {/* Add select/deselect all buttons */}
                {availableStudents.length > 0 && (
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
                      <Check className="mr-1 h-3 w-3" />
                      Select all ({availableStudents.length})
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
                        className="text-xs bg-red-500/20 hover:bg-red-500/40 text-white font-medium shadow-sm"
                      >
                        <X className="mr-1 h-3 w-3" />
                        Deselect filtered
                      </Button>
                    )}
                  </div>
                )}
                
                <CommandGroup>
                  {availableStudents.map(student => {
                    const isSelected = selectedStudentIds.includes(student.id);
                    
                    return (
                      <CommandItem
                        key={student.id}
                        onSelect={() => handleSelect(student)}
                        className="flex items-center justify-between cursor-pointer hover:bg-white/10"
                      >
                        <div className="flex items-center">
                          {student.avatar && (
                            <div className="w-6 h-6 rounded-full overflow-hidden mr-2 bg-white/20">
                              <img 
                                src={student.avatar} 
                                alt={student.name} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-white">{student.name}</span>
                            <span className="text-xs text-white/60">{student.email}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 ml-2 text-green-400" />}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
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
    </div>
  );
};

export default StudentSelection;

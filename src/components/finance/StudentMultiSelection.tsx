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
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);
  const [classFilter, setClassFilter] = useState<string>('all_classes');
  
  // Get unique class IDs for filtering
  const classIds = React.useMemo(() => {
    const uniqueClassIds = new Set<string>();
    students.forEach(student => {
      if (student.classId) {
        uniqueClassIds.add(student.classId);
      }
    });
    return Array.from(uniqueClassIds);
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
        <div className="flex-1">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="bg-white/20 border-white/30 text-white">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>            <SelectContent className="bg-white/90 backdrop-blur-sm">
              <SelectItem value="all_classes">All Classes</SelectItem>
              {classIds.map(classId => (
                <SelectItem key={classId} value={classId}>
                  Class {classId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>        {classFilter !== 'all_classes' && (
          <Button
            variant="ghost"
            onClick={() => setClassFilter('all_classes')}
            className="h-auto p-1 hover:bg-white/10 rounded-full"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear filter</span>
          </Button>
        )}
      </div>
      
      <div className="flex flex-col space-y-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between bg-white/20 border-white/30 text-white w-full h-auto min-h-10 flex-wrap"
              disabled={disabled}
            >
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
              <div className="ml-2">
                {selectedStudents.length > 0 ? (
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearAll();
                    }}
                    className="h-auto p-1 hover:bg-white/10 rounded-full"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear selection</span>
                  </Button>
                ) : (
                  <Search className="h-4 w-4 opacity-50" />
                )}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-white/90 backdrop-blur-sm" align="start">
            <Command className="rounded-lg border-none">
              <CommandInput placeholder="Search students..." onValueChange={setSearchQuery} />              <CommandList>
                <CommandEmpty>No students found.</CommandEmpty>
                
                {/* Add select/deselect all buttons */}
                {filteredStudents.length > 0 && (
                  <div className="flex justify-between p-2 border-b">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const count = handleSelectAllFiltered();
                        if (count > 0) setOpen(false);
                      }}
                      className="text-xs"
                    >
                      Select all ({filteredStudents.length})
                    </Button>
                    
                    {selectedStudents.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          handleDeselectAllFiltered();
                        }}
                        className="text-xs"
                      >
                        Deselect filtered
                      </Button>
                    )}
                  </div>
                )}
                
                <CommandGroup>
                  {filteredStudents.map(student => {
                    const isSelected = selectedStudents.some(s => s.id === student.id);
                    return (
                      <CommandItem
                        key={student.id}
                        onSelect={() => handleSelect(student)}
                        className="flex items-center justify-between"
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
                          <span>{student.name}</span>
                        </div>
                        {isSelected && <Check className="h-4 w-4 ml-2" />}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
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
              {student.name}
              <Button
                variant="ghost"
                onClick={() => handleRemoveSelected(student.id)}
                className="h-auto p-0 ml-1 hover:bg-transparent"
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

export default StudentMultiSelection;

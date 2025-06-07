
import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Search, UserCheck, UserX } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { FormLabel } from '../ui/form';

interface StudentSelectionProps {
  selectedStudentIds: string[];
  onStudentToggle: (studentId: string) => void;
}

const StudentSelection: React.FC<StudentSelectionProps> = ({
  selectedStudentIds = [],
  onStudentToggle,
}) => {
  const { students } = useSelector((state: RootState) => state.students);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'selected' | 'unselected'>('all');
    // Filter students based on search term and filter mode
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(studentSearchTerm.toLowerCase());
      const isSelected = selectedStudentIds?.includes(student.id);
      
      if (filterMode === 'selected' && !isSelected) return false;
      if (filterMode === 'unselected' && isSelected) return false;
      
      return matchesSearch;
    });
  }, [students, studentSearchTerm, filterMode, selectedStudentIds]);

  // Count of selected students
  const selectedCount = useMemo(() => selectedStudentIds?.length || 0, [selectedStudentIds]);

  return (
    <div>      <div className="flex justify-between items-center mb-4">
        <FormLabel className="text-white block">Students</FormLabel>
        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white">
          {selectedCount} selected
        </span>
      </div>
      <div className="bg-white/5 p-4 rounded-lg space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <Input
              placeholder="Search students by name..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>          <div className="flex gap-2">
            <div
              onClick={() => setFilterMode('all')}
              className={`inline-flex cursor-pointer px-3 py-1 text-sm rounded-md ${
                filterMode === 'all' 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-black' 
                : 'text-white border border-white/20 hover:bg-white/10'
              }`}
            >
              All
            </div>
            <div
              onClick={() => setFilterMode('selected')}
              className={`inline-flex cursor-pointer items-center px-3 py-1 text-sm rounded-md ${
                filterMode === 'selected' 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-black' 
                : 'text-white border border-white/20 hover:bg-white/10'
              }`}
            >
              <UserCheck className="w-4 h-4 mr-1" />
              Selected
            </div>
            <div
              onClick={() => setFilterMode('unselected')}
              className={`inline-flex cursor-pointer items-center px-3 py-1 text-sm rounded-md ${
                filterMode === 'unselected' 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-black' 
                : 'text-white border border-white/20 hover:bg-white/10'
              }`}
            >
              <UserX className="w-4 h-4 mr-1" />
              Unselected
            </div>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-80">
          <Table className="text-white">
            <TableHeader>
              <TableRow className="hover:bg-white/5 border-white/20">
                <TableHead className="text-white/70 w-10">Select</TableHead>
                <TableHead className="text-white/70">Name</TableHead>
                <TableHead className="text-white/70">Email</TableHead>
                <TableHead className="text-white/70">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const isSelected = selectedStudentIds?.includes(student.id) || false;
                  return (
                    <TableRow 
                      key={student.id} 
                      className={`hover:bg-white/5 border-white/10 cursor-pointer ${
                        isSelected ? 'bg-yellow-500/10' : ''
                      }`}
                      onClick={() => onStudentToggle(student.id)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onStudentToggle(student.id)}
                          className={isSelected ? "border-yellow-400" : "border-white/20"}
                        />
                      </TableCell>
                      <TableCell className={isSelected ? "font-medium text-yellow-300" : ""}>
                        {student.name}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium 
                          ${student.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                          {student.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-white/50">
                    {filterMode === 'selected' && (!selectedStudentIds || selectedStudentIds.length === 0)
                      ? "No students have been selected yet."
                      : filterMode === 'unselected' && selectedStudentIds && selectedStudentIds.length === students.length
                        ? "All students have been selected."
                        : "No students found matching your search."
                    }
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default StudentSelection;

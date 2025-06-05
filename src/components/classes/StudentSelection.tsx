
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { FormLabel } from '../ui/form';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface StudentSelectionProps {
  selectedStudentIds: string[];
  onStudentToggle: (studentId: string) => void;
}

const StudentSelection: React.FC<StudentSelectionProps> = ({
  selectedStudentIds,
  onStudentToggle,
}) => {
  const { students } = useSelector((state: RootState) => state.students);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Filter students based on search term
  const filteredStudents = students.filter((student) => 
    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  return (
    <div>
      <FormLabel className="text-white mb-4 block">Students</FormLabel>
      <div className="bg-white/5 p-4 rounded-lg space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
          <Input
            placeholder="Search students by name..."
            value={studentSearchTerm}
            onChange={(e) => setStudentSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
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
                filteredStudents.map((student) => (
                  <TableRow 
                    key={student.id} 
                    className="hover:bg-white/5 border-white/10 cursor-pointer"
                    onClick={() => onStudentToggle(student.id)}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedStudentIds.includes(student.id)}
                        onCheckedChange={() => onStudentToggle(student.id)}
                        className="border-white/20"
                      />
                    </TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium 
                        ${student.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                        {student.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-white/50">
                    No students found matching your search.
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

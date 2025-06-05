
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { Users } from 'lucide-react';

interface StudentSelectionProps {
  selectedStudentIds: string[];
  onStudentIdsChange: (studentIds: string[]) => void;
}

const StudentSelection: React.FC<StudentSelectionProps> = ({ 
  selectedStudentIds, 
  onStudentIdsChange 
}) => {
  const { students } = useSelector((state: RootState) => state.students);

  const handleStudentToggle = (studentId: string, checked: boolean) => {
    if (checked) {
      onStudentIdsChange([...selectedStudentIds, studentId]);
    } else {
      onStudentIdsChange(selectedStudentIds.filter(id => id !== studentId));
    }
  };

  return (
    <div>
      <Label className="text-white mb-4 block">
        <Users className="w-4 h-4 inline mr-2" />
        Students *
      </Label>
      <div className="bg-white/5 p-4 rounded-lg max-h-48 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {students.map((student) => (
            <div key={student.id} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedStudentIds.includes(student.id)}
                onCheckedChange={(checked) => handleStudentToggle(student.id, !!checked)}
                className="border-white/20"
              />
              <span className="text-white text-sm">{student.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentSelection;

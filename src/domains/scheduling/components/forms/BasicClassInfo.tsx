
import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Users, MapPin } from 'lucide-react';
import { ScheduleFormData } from '../types';

interface BasicClassInfoProps {
  formData: ScheduleFormData;
  onFormDataChange: (data: ScheduleFormData) => void;
}

const BasicClassInfo: React.FC<BasicClassInfoProps> = ({ formData, onFormDataChange }) => {
  const { classes } = useAppSelector((state: RootState) => state.classes);
  const { teachers } = useAppSelector((state: RootState) => state.teachers);
  const { classrooms } = useAppSelector((state: RootState) => state.classrooms);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Class Selection */}
      <div>
        <Label className="text-white mb-2 block">
          <BookOpen className="w-4 h-4 inline mr-2" />
          Class *
        </Label>
        <Select 
          value={formData.classId} 
          onValueChange={(value) => onFormDataChange({...formData, classId: value})}
        >
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((classItem) => (
              <SelectItem key={classItem.id} value={classItem.id}>
                {classItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Teacher Selection */}
      <div>
        <Label className="text-white mb-2 block">
          <Users className="w-4 h-4 inline mr-2" />
          Teacher *
        </Label>
        <Select 
          value={formData.teacherId} 
          onValueChange={(value) => onFormDataChange({...formData, teacherId: value})}
        >
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Select a teacher" />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name} - {teacher.subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Classroom Selection */}
      <div>
        <Label className="text-white mb-2 block">
          <MapPin className="w-4 h-4 inline mr-2" />
          Classroom *
        </Label>
        <Select 
          value={formData.classroomId} 
          onValueChange={(value) => onFormDataChange({...formData, classroomId: value})}
        >
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Select a classroom" />
          </SelectTrigger>
          <SelectContent>
            {classrooms.map((classroom) => (
              <SelectItem key={classroom.id} value={classroom.id}>
                {classroom.name} - {classroom.location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BasicClassInfo;

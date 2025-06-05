
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Calendar, Clock, Users, MapPin, Repeat, BookOpen } from 'lucide-react';
import { toast } from '../ui/use-toast';
import GlassCard from '../common/GlassCard';

interface ScheduleClassFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const ScheduleClassForm: React.FC<ScheduleClassFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const { classes } = useSelector((state: RootState) => state.classes);
  const { teachers } = useSelector((state: RootState) => state.teachers);
  const { students } = useSelector((state: RootState) => state.students);
  const { classrooms } = useSelector((state: RootState) => state.classrooms);

  const [formData, setFormData] = useState({
    classId: initialData?.classId || '',
    teacherId: initialData?.teacherId || '',
    studentIds: initialData?.studentIds || [],
    classroomId: initialData?.classroomId || '',
    date: initialData?.date || '',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    isRecurring: initialData?.isRecurring || false,
    recurringPattern: initialData?.recurringPattern || 'weekly',
    notes: initialData?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.classId || !formData.teacherId || !formData.classroomId || 
        !formData.date || !formData.startTime || !formData.endTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.studentIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one student.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <GlassCard className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {initialData ? 'Reschedule Class' : 'Schedule New Class'}
        </h2>
        <p className="text-white/70">
          Fill in the details below to schedule a class session
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Class Selection */}
          <div>
            <Label className="text-white mb-2 block">
              <BookOpen className="w-4 h-4 inline mr-2" />
              Class *
            </Label>
            <Select value={formData.classId} onValueChange={(value) => setFormData({...formData, classId: value})}>
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
            <Select value={formData.teacherId} onValueChange={(value) => setFormData({...formData, teacherId: value})}>
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
            <Select value={formData.classroomId} onValueChange={(value) => setFormData({...formData, classroomId: value})}>
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

          {/* Date */}
          <div>
            <Label className="text-white mb-2 block">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date *
            </Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          {/* Start Time */}
          <div>
            <Label className="text-white mb-2 block">
              <Clock className="w-4 h-4 inline mr-2" />
              Start Time *
            </Label>
            <Input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          {/* End Time */}
          <div>
            <Label className="text-white mb-2 block">
              <Clock className="w-4 h-4 inline mr-2" />
              End Time *
            </Label>
            <Input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({...formData, endTime: e.target.value})}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        </div>

        {/* Student Selection */}
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
                    checked={formData.studentIds.includes(student.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          studentIds: [...formData.studentIds, student.id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          studentIds: formData.studentIds.filter(id => id !== student.id)
                        });
                      }
                    }}
                    className="border-white/20"
                  />
                  <span className="text-white text-sm">{student.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recurring Options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.isRecurring}
              onCheckedChange={(checked) => setFormData({...formData, isRecurring: !!checked})}
              className="border-white/20"
            />
            <Label className="text-white">
              <Repeat className="w-4 h-4 inline mr-2" />
              Recurring Class
            </Label>
          </div>

          {formData.isRecurring && (
            <div>
              <Label className="text-white mb-2 block">Recurring Pattern</Label>
              <Select 
                value={formData.recurringPattern} 
                onValueChange={(value) => setFormData({...formData, recurringPattern: value as 'weekly' | 'biweekly' | 'monthly'})}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <Label className="text-white mb-2 block">Notes</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Additional notes for this class session..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium"
          >
            {initialData ? 'Update Schedule' : 'Schedule Class'}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
};

export default ScheduleClassForm;

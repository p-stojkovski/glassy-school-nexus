import React, { useState } from 'react';
import { RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createAssessment,
  Assessment,
  AssessmentType,
} from '@/domains/grades/gradesSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import GlassCard from '@/components/common/GlassCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CreateAssessmentProps {
  classId: string;
}

const CreateAssessment: React.FC<CreateAssessmentProps> = ({ classId }) => {
  const dispatch = useAppDispatch();
  const { classes } = useAppSelector((state: RootState) => state.classes);
  const selectedClass = classes.find((c) => c.id === classId);

  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Test' as AssessmentType,
    totalPoints: 100,
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [customType, setCustomType] = useState('');
  const [assessmentTypes] = useState<AssessmentType[]>([
    'Homework',
    'Test',
    'Quiz',
    'Project',
    'Participation',
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Validate totalPoints
    if (name === 'totalPoints') {
      const points = parseInt(value);
      if (isNaN(points) || points < 0) {
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value as AssessmentType,
    }));
  };

  const handleSubmit = () => {
    if (!classId) {
      toast.error('Please select a class', {
        description: 'You must select a class before creating an assessment',
      });
      return;
    }

    if (!formData.title || !formData.type || !formData.date) {
      toast.error('Missing required fields', {
        description: 'Please fill in all required fields',
      });
      return;
    }

    setShowDialog(true);
  };

  const confirmCreate = () => {
    const selectedClassName = selectedClass?.name || 'Unknown Class';
    const newAssessment: Assessment = {
      id: `assessment-${Date.now()}`,
      classId,
      className: selectedClassName,
      title: formData.title,
      type: formData.type === 'Custom' ? customType : formData.type,
      totalPoints: formData.totalPoints,
      date: formData.date,
      description: formData.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(createAssessment(newAssessment));

    toast.success('Assessment Created', {
      description: `${newAssessment.title} has been created successfully.`,
    });

    // Clear form
    setFormData({
      title: '',
      type: 'Test' as AssessmentType,
      totalPoints: 100,
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setCustomType('');
    setShowDialog(false);
  };

  if (!classId) {
    return (
      <GlassCard className="p-6 text-white text-center">
        <h3 className="text-xl mb-4">Please Select a Class</h3>
        <p className="text-white/70">Select a class to create an assessment</p>
      </GlassCard>
    );
  }

  return (
    <>
      <GlassCard className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium text-white mb-2">
              Create New Assessment
              {selectedClass && (
                <span className="ml-2 text-white/70">
                  for {selectedClass.name}
                </span>
              )}
            </h3>
            <p className="text-white/70">Define the assessment details below</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Assessment Title *
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                placeholder="e.g., Midterm Exam"
              />
            </div>

            {/* Assessment Type */}
            <div className="space-y-2">
              <Label htmlFor="assessment-type" className="text-white">
                Assessment Type *
              </Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-white border-white/20">
                  {assessmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                  <SelectItem value="Custom">Custom Type</SelectItem>
                </SelectContent>
              </Select>
              {formData.type === 'Custom' && (
                <Input
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  placeholder="Enter custom assessment type"
                />
              )}
            </div>

            {/* Total Points */}
            <div className="space-y-2">
              <Label htmlFor="totalPoints" className="text-white">
                Total Points
              </Label>
              <Input
                id="totalPoints"
                name="totalPoints"
                type="number"
                value={formData.totalPoints}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                min="0"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-white">
                Assessment Date *
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
              placeholder="Enter assessment details (optional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSubmit}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium"
            >
              Create Assessment
            </Button>
          </div>
        </div>
      </GlassCard>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-900 text-white border-white/20">
          <DialogHeader>
            <DialogTitle>Confirm Assessment Creation</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to create this assessment?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <div>
              <strong>Title:</strong> {formData.title}
            </div>
            <div>
              <strong>Type:</strong>{' '}
              {formData.type === 'Custom' ? customType : formData.type}
            </div>
            <div>
              <strong>Class:</strong> {selectedClass?.name || 'Unknown'}
            </div>
            <div>
              <strong>Total Points:</strong> {formData.totalPoints}
            </div>
            <div>
              <strong>Date:</strong> {formData.date}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCreate}
              className="bg-yellow-500 hover:bg-yellow-400 text-black"
            >
              Create Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateAssessment;


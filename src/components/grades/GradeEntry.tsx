import React, { useState, useEffect } from 'react';
import { RootState } from '../../store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  Assessment,
  Grade,
  selectAssessmentsByClassId,
  addGradesBatch,
  selectGradesByAssessmentId,
  updateGrade
} from '../../store/slices/gradesSlice';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from '../../hooks/use-toast';
import GlassCard from '../common/GlassCard';
import { Textarea } from '../ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface GradeEntryProps {
  classId: string;
}

interface StudentGrade {
  studentId: string;
  studentName: string;
  grade: string;
  comments: string;
}

const GradeEntry: React.FC<GradeEntryProps> = ({ classId }) => {
  const dispatch = useAppDispatch();
  const { classes } = useAppSelector((state: RootState) => state.classes);
  const { students } = useAppSelector((state: RootState) => state.students);
  const assessments = useAppSelector((state: RootState) => selectAssessmentsByClassId(state, classId));
  // Move the selector outside the useEffect to follow the Rules of Hooks
  const allGrades = useAppSelector((state: RootState) => state.grades.grades);
  
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [gradeValidation, setGradeValidation] = useState<Record<string, boolean>>({});
  
  // Define validateGrade outside useEffect
  const validateGrade = React.useCallback((grade: string, pointLimit?: number): boolean => {
    if (!grade.trim()) {
      return true; // Empty grades are allowed (for now)
    }
    
    // If numeric assessment
    if (pointLimit !== undefined) {
      const numGrade = parseFloat(grade);
      if (isNaN(numGrade) || numGrade < 0 || numGrade > pointLimit) {
        return false;
      }
      return true;
    }
    
    // If letter grade
    const letterPattern = /^[A-F][+-]?$/;
    if (letterPattern.test(grade.toUpperCase())) {
      return true;
    }
    
    return false;
  }, []);
  
  // Define validateAllGrades for use in the component
  const validateAllGrades = React.useCallback((grades: StudentGrade[]) => {
    const validation: Record<string, boolean> = {};
    grades.forEach(entry => {
      validation[entry.studentId] = validateGrade(entry.grade, selectedAssessment?.totalPoints);
    });
    setGradeValidation(validation);
  }, [selectedAssessment, validateGrade]);
  
  // Get class students and check if assessment already has grades
  useEffect(() => {
    if (classId && selectedAssessment) {
      // For now, use all students since we don't have a proper class-student association
      const classStudents = students;
      
      // Filter grades directly instead of using the selector inside useEffect
      const existingGrades = allGrades.filter(grade => grade.assessmentId === selectedAssessment.id);
      
      // Map students to grade entries (with existing grades if present)
      const gradeEntries = classStudents.map(student => {
        const existingGrade = existingGrades.find(g => g.studentId === student.id);
        return {
          studentId: student.id,
          studentName: student.name,
          grade: existingGrade?.value.toString() || '',
          comments: existingGrade?.comments || ''
        };
      });
      
      setStudentGrades(gradeEntries);
      validateAllGrades(gradeEntries);
    } else {
      setStudentGrades([]);
      setGradeValidation({});
    }
  }, [classId, selectedAssessment, allGrades, students, validateAllGrades]);
    const handleGradeChange = (value: string, studentId: string) => {
    const updated = studentGrades.map(entry => 
      entry.studentId === studentId ? { ...entry, grade: value } : entry
    );
    setStudentGrades(updated);
    
    // Validate the changed grade
    setGradeValidation(prev => ({
      ...prev,
      [studentId]: validateGrade(value, selectedAssessment?.totalPoints)
    }));
  };
  
  const handleCommentsChange = (value: string, studentId: string) => {
    setStudentGrades(studentGrades.map(entry => 
      entry.studentId === studentId ? { ...entry, comments: value } : entry
    ));
  };
  
  const handleSubmit = () => {
    // Check if all grades are valid
    const allValid = Object.values(gradeValidation).every(valid => valid);
    if (!allValid) {
      toast({
        title: "Invalid Grades",
        description: "Please correct the invalid grades before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    setShowConfirmDialog(true);
  };
    const confirmSubmit = () => {
    if (!selectedAssessment) return;
    
    // Filter grades directly using the allGrades from the top-level useSelector
    const existingGrades = allGrades.filter(grade => grade.assessmentId === selectedAssessment.id);
    
    const gradesToSave = studentGrades
      .filter(entry => entry.grade !== '') // Only save non-empty grades
      .map(entry => {
        const existingGrade = existingGrades.find(g => g.studentId === entry.studentId);
        if (existingGrade) {
          // Update existing grade
          const updatedGrade: Grade = {
            ...existingGrade,
            value: entry.grade,
            comments: entry.comments,
            dateRecorded: new Date().toISOString(),
          };
          
          dispatch(updateGrade(updatedGrade));
          return null; // Don't add to batch
        } else {
          // Create new grade
          return {
            id: `grade-${Date.now()}-${entry.studentId}`,
            assessmentId: selectedAssessment.id,
            studentId: entry.studentId,
            studentName: entry.studentName,
            value: entry.grade,
            comments: entry.comments,
            dateRecorded: new Date().toISOString(),
          };
        }
      })
      .filter(grade => grade !== null) as Grade[];
    
    if (gradesToSave.length > 0) {
      dispatch(addGradesBatch(gradesToSave));
    }
    
    toast({
      title: "Grades Saved",
      description: `Grades for ${selectedAssessment.title} have been saved.`,
    });
    
    setShowConfirmDialog(false);
  };
  
  const getSelectedClass = () => classes.find(c => c.id === classId);
  
  if (!classId) {
    return (
      <GlassCard className="p-6 text-white text-center">
        <h3 className="text-xl mb-4">Please Select a Class</h3>
        <p className="text-white/70">Select a class to enter grades</p>
      </GlassCard>
    );
  }
  
  if (assessments.length === 0) {
    return (
      <GlassCard className="p-6 text-white text-center">
        <h3 className="text-xl mb-4">No Assessments Found</h3>
        <p className="text-white/70">
          Please create an assessment for {getSelectedClass()?.name} first
        </p>
      </GlassCard>
    );
  }
  
  return (
    <>
      <GlassCard className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-white">
              Enter Grades
              {getSelectedClass() && (
                <span className="ml-2 text-white/70">for {getSelectedClass()?.name}</span>
              )}
            </h3>
          </div>
          
          {/* Assessment Selection */}
          <div className="space-y-2 max-w-md">
            <Label htmlFor="assessment" className="text-white">Select Assessment</Label>
            <Select 
              value={selectedAssessment?.id || ''} 
              onValueChange={(value) => {
                const assessment = assessments.find(a => a.id === value);
                setSelectedAssessment(assessment || null);
              }}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select an assessment" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 text-white border-white/20">
                {assessments.map((assessment) => (
                  <SelectItem key={assessment.id} value={assessment.id}>
                    {assessment.title} ({assessment.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedAssessment && (
            <>
              <div className="bg-white/5 p-4 rounded-lg space-y-2">
                <div><strong className="text-white/80">Assessment:</strong> <span className="text-white">{selectedAssessment.title}</span></div>
                <div><strong className="text-white/80">Type:</strong> <span className="text-white">{selectedAssessment.type}</span></div>
                {selectedAssessment.totalPoints && (
                  <div><strong className="text-white/80">Total Points:</strong> <span className="text-white">{selectedAssessment.totalPoints}</span></div>
                )}
                <div><strong className="text-white/80">Date:</strong> <span className="text-white">{new Date(selectedAssessment.date).toLocaleDateString()}</span></div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-white">Student Grades</h4>
                  <div className="text-white/70 text-sm">
                    {selectedAssessment.totalPoints 
                      ? `Enter numeric grades (0-${selectedAssessment.totalPoints})` 
                      : 'Enter letter grades (A, B, C, D, F with optional + or -)'
                    }
                  </div>
                </div>
                
                {studentGrades.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table className="text-white w-full">
                      <TableHeader>
                        <TableRow className="hover:bg-white/5 border-white/20">
                          <TableHead className="text-white/70">Student</TableHead>
                          <TableHead className="text-white/70 w-32">Grade</TableHead>
                          <TableHead className="text-white/70">Comments</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentGrades.map((entry) => (
                          <TableRow key={entry.studentId} className="hover:bg-white/5 border-white/10">
                            <TableCell>{entry.studentName}</TableCell>
                            <TableCell>
                              <Input
                                value={entry.grade}
                                onChange={(e) => handleGradeChange(e.target.value, entry.studentId)}
                                className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 ${
                                  !gradeValidation[entry.studentId] ? 'border-red-500' : ''
                                }`}
                                placeholder={selectedAssessment.totalPoints ? "0-100" : "A-F"}
                              />
                              {!gradeValidation[entry.studentId] && (
                                <p className="text-red-500 text-xs mt-1">Invalid grade</p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                value={entry.comments}
                                onChange={(e) => handleCommentsChange(e.target.value, entry.studentId)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                                placeholder="Optional comments"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/70">
                    No students available for this class
                  </div>
                )}
                
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={studentGrades.length === 0}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium"
                  >
                    Save Grades
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </GlassCard>
      
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-gray-900 text-white border-white/20">
          <DialogHeader>
            <DialogTitle>Confirm Grade Submission</DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to save these grades? This will update any existing grades for the students.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSubmit}
              className="bg-yellow-500 hover:bg-yellow-400 text-black"
            >
              Save Grades
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GradeEntry;

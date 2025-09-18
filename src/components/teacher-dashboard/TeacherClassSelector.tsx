import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import TeachersDropdown from '@/components/common/TeachersDropdown';
import ClassDropdown from './ClassDropdown';
import { useTeachers } from '@/hooks/useTeachers';
import { TeacherResponse } from '@/types/api/teacher';
import { ClassResponse } from '@/types/api/class';

interface SelectionBridge {
  selectedTeacher: TeacherResponse | null;
  selectedClass: ClassResponse | null;
  availableClasses: ClassResponse[];
  isLoadingClasses: boolean;
  isSelectingTeacher: boolean;
  isSelectingClass: boolean;
  error: string | null;
  setSelectedTeacher: (teacher: TeacherResponse | null) => void;
  setSelectedClass: (classItem: ClassResponse | null) => void;
  clearSelection: () => void;
  hasValidSelection: () => boolean;
}

interface TeacherClassSelectorProps {
  selection: SelectionBridge;
  onSelectionComplete?: () => void;
  className?: string;
}

const TeacherClassSelector: React.FC<TeacherClassSelectorProps> = ({
  selection,
  onSelectionComplete,
  className = '',
}) => {
  const { teachers } = useTeachers();
  const {
    selectedTeacher,
    selectedClass,
    availableClasses,
    isLoadingClasses,
    isSelectingTeacher,
    isSelectingClass,
    error,
    setSelectedTeacher,
    setSelectedClass,
    clearSelection,
    hasValidSelection,
  } = selection;

  const handleTeacherChange = (teacherId: string) => {
    if (teacherId === '__error__' || teacherId === '__empty__') return;

    const teacher = teachers.find(t => t.id === teacherId);
    if (teacher) {
      setSelectedTeacher(teacher);
    }
  };

  const handleClassChange = (classId: string) => {
    if (classId === '__error__' || classId === '__empty__') return;

    const classItem = availableClasses.find(c => c.id === classId);
    if (classItem) {
      setSelectedClass(classItem);
    }
  };

  const handleViewDashboard = () => {
    if (selectedTeacher && selectedClass) {
      // State is owned by parent hook; after selection is valid, notify parent to switch view
      onSelectionComplete?.();
    }
  };

  const isLoading = isSelectingTeacher || isSelectingClass;

  return (
    <div className={`flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6 ${className}`}>
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            Welcome to ThinkEnglish
          </CardTitle>
          <CardDescription className="text-white/70">
            Select Teacher & Class to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Display */}
          {error && (
            <Alert className="bg-red-500/20 border-red-500/30 text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Teacher Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Teacher
            </label>
            <TeachersDropdown
              value={selectedTeacher?.id || ''}
              onValueChange={handleTeacherChange}
              placeholder="Select Teacher"
              showIcon={false}
              className="w-full"
              disabled={isLoading}
              includeSubjectInfo={true}
            />
          </div>

          {/* Class Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90 flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Class
            </label>
            <ClassDropdown
              value={selectedClass?.id || ''}
              onValueChange={handleClassChange}
              classes={availableClasses}
              isLoading={isLoadingClasses}
              error={selectedTeacher && !isLoadingClasses && availableClasses.length === 0 ? 'No classes found for this teacher' : null}
              placeholder={selectedTeacher ? 'Select Class' : 'Select a teacher first'}
              showIcon={false}
              className="w-full"
              disabled={!selectedTeacher || isLoading}
              showEnrollmentInfo={true}
            />
          </div>

          {/* Current Selection Display */}
          {selectedTeacher && selectedClass && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="text-sm text-white/70 mb-2">Selected:</div>
              <div className="space-y-1">
                <div className="text-white font-medium">
                  {selectedTeacher.name}
                </div>
                <div className="text-white/80 text-sm">
                  {selectedClass.name}
                </div>
                <div className="text-white/60 text-xs">
                  {selectedClass.subjectName} • {selectedClass.enrolledCount} students
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleViewDashboard}
              disabled={!hasValidSelection() || isLoading}
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              size="lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Dashboard
                </>
              )}
            </Button>

            {(selectedTeacher || selectedClass) && (
              <Button
                onClick={clearSelection}
                disabled={isLoading}
                variant="ghost"
                className="w-full text-white/70 hover:text-white hover:bg-white/10"
                size="sm"
              >
                Change Selection
              </Button>
            )}
          </div>

          {/* Helper Text */}
          <div className="text-center text-xs text-white/50">
            {!selectedTeacher && 'Start by selecting your name from the teacher list'}
            {selectedTeacher && !selectedClass && 'Now choose one of your assigned classes'}
            {hasValidSelection() && 'Ready to access your dashboard'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherClassSelector;
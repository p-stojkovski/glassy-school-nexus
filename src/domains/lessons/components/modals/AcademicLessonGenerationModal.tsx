import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Settings, BookOpen, AlertTriangle, CheckCircle, XCircle, Clock, Sparkles } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import YearsDropdown from '@/components/common/YearsDropdown';
import SemestersDropdown from '@/components/common/SemestersDropdown';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NativeDateInput } from '@/components/common';
import { useLessons } from '@/domains/lessons/hooks/useLessons';
import { AcademicYear } from '@/domains/settings/types/academicCalendarTypes';
import { AcademicSemesterResponse } from '@/types/api/academic-calendar';
import EnhancedLessonGenerationResults from '../EnhancedLessonGenerationResults';
import { 
  GenerationMode, 
  GenerateLessonsAcademicAwareRequest,
  AcademicAwareLessonGenerationResult,
  GeneratedLesson,
  SkippedLesson 
} from '@/types/api/lesson';
import { EnhancedLessonGenerationResult } from '@/types/api/lesson-generation-enhanced';

interface AcademicLessonGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  onSuccess?: (result: EnhancedLessonGenerationResult) => void;
}

interface FormData {
  generationMode: GenerationMode;
  startDate: string;
  endDate: string;
  academicYearId: string | null;
  semesterId: string | null;
  respectBreaks: boolean;
  respectHolidays: boolean;
}

const AcademicLessonGenerationModal: React.FC<AcademicLessonGenerationModalProps> = ({
  open,
  onOpenChange,
  classId,
  className,
  onSuccess,
}) => {
  const { generateLessonsAcademicAware } = useLessons();
  
  // Utility function to extract date from datetime string
  const extractDateFromDateTime = (dateTimeString: string): string => {
    if (!dateTimeString) return '';
    // Handle both ISO datetime (2025-09-01T00:00:00) and date (2025-09-01) formats
    return dateTimeString.split('T')[0];
  };

  // Utility function to format date for display
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      // Extract date part if it's a datetime string
      const datePart = dateString.split('T')[0];
      const date = new Date(datePart + 'T00:00:00');
      
      // Format as "Sep 1, 2025"
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      // Fallback to original string if parsing fails
      return dateString;
    }
  };
  
  // State
  const [formData, setFormData] = useState<FormData>({
    generationMode: 'CustomRange',
    startDate: '',
    endDate: '',
    academicYearId: null,
    semesterId: null,
    respectBreaks: true,
    respectHolidays: true,
  });
  
  // Academic years are provided by YearsDropdown; keep local copy for date auto-fill
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<AcademicSemesterResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EnhancedLessonGenerationResult | null>(null);
  const [step, setStep] = useState<'form' | 'generating' | 'results'>('form');
  const [datesManuallySet, setDatesManuallySet] = useState(false);
  
  // Academic years are loaded by YearsDropdown with caching and onLoaded callback

// Clear semesters when academic year changes; list will be provided by SemestersDropdown onLoaded
  useEffect(() => {
    if (!formData.academicYearId) {
      setSemesters([]);
      setFormData(prev => ({ ...prev, semesterId: null }));
    }
  }, [formData.academicYearId]);

  // Auto-set date ranges based on mode selection
  useEffect(() => {
    // Don't auto-set dates if they have been manually changed (except when generation mode changes)
    if (datesManuallySet) return;
    
    if (formData.generationMode === 'Semester' && formData.semesterId) {
      const semester = semesters.find(s => s.id === formData.semesterId);
      if (semester) {
        setFormData(prev => ({
          ...prev,
          startDate: extractDateFromDateTime(semester.startDate),
          endDate: extractDateFromDateTime(semester.endDate),
        }));
      }
    } else if (formData.generationMode === 'FullYear' && formData.academicYearId) {
      const year = academicYears.find(y => y.id === formData.academicYearId);
      if (year) {
        setFormData(prev => ({
          ...prev,
          startDate: extractDateFromDateTime(year.startDate),
          endDate: extractDateFromDateTime(year.endDate),
        }));
      }
    } else if (formData.generationMode === 'Month') {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setFormData(prev => ({
        ...prev,
        startDate: firstDay.toISOString().split('T')[0],
        endDate: lastDay.toISOString().split('T')[0],
      }));
    } else if (formData.generationMode === 'CustomRange') {
      // Clear dates for CustomRange mode so user can set them manually
      setFormData(prev => ({
        ...prev,
        startDate: '',
        endDate: '',
      }));
    } else {
      // For modes that require additional selections (like Semester without semester selected),
      // clear the dates until the required selections are made
      setFormData(prev => ({
        ...prev,
        startDate: '',
        endDate: '',
      }));
    }
  }, [formData.generationMode, formData.academicYearId, formData.semesterId, academicYears, semesters, datesManuallySet]);

  // Reset manual dates flag and clear dates when generation mode changes
  useEffect(() => {
    setDatesManuallySet(false);
    // This will trigger the date-setting logic in the other useEffect
  }, [formData.generationMode]);

  // Reset manual dates flag when semester selection changes (for Semester mode)
  useEffect(() => {
    if (formData.generationMode === 'Semester') {
      setDatesManuallySet(false);
    }
  }, [formData.semesterId, formData.generationMode]);

// Removed: loadAcademicYears handled by YearsDropdown

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    
    // Track when dates are manually changed
    if (field === 'startDate' || field === 'endDate') {
      setDatesManuallySet(true);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.startDate) return 'Start date is required';
    if (!formData.endDate) return 'End date is required';
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      return 'End date must be after start date';
    }
    if ((formData.generationMode === 'Semester' || formData.generationMode === 'FullYear') && !formData.academicYearId) {
      return 'Academic year is required for this generation mode';
    }
    if (formData.generationMode === 'Semester' && !formData.semesterId) {
      return 'Semester is required for semester generation mode';
    }
    return null;
  };

  const handleGenerate = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setStep('generating');
      setError(null);

      const request: GenerateLessonsAcademicAwareRequest = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        generationMode: formData.generationMode,
        academicYearId: formData.academicYearId,
        semesterId: formData.semesterId,
        respectBreaks: formData.respectBreaks,
        respectHolidays: formData.respectHolidays,
      };

      const generationResult = await generateLessonsAcademicAware(classId, request);
      
      // Convert AcademicAwareLessonGenerationResult to EnhancedLessonGenerationResult
      const enhancedResult: EnhancedLessonGenerationResult = {
        classId: generationResult.classId,
        generatedCount: generationResult.generatedCount,
        skippedCount: generationResult.skippedCount,
        conflictCount: generationResult.conflictCount,
        publicHolidaySkips: generationResult.publicHolidaySkips,
        teachingBreakSkips: generationResult.teachingBreakSkips,
        generationStartDate: formData.startDate, // Use form data since API doesn't return this
        generationEndDate: formData.endDate,     // Use form data since API doesn't return this
        generationMode: generationResult.generationMode,
        academicContext: generationResult.academicContext ? {
          academicYearId: generationResult.academicContext.academicYearId,
          academicYearName: generationResult.academicContext.academicYearName,
          semesterId: generationResult.academicContext.semesterId,
          semesterName: generationResult.academicContext.semesterName,
          teachingBreakDays: generationResult.academicContext.teachingBreakDays,
          publicHolidayDays: generationResult.academicContext.publicHolidayDays,
          totalNonTeachingDays: generationResult.academicContext.totalNonTeachingDays,
        } : null,
        generatedLessons: generationResult.generatedLessons.map(lesson => ({
          id: lesson.lessonId, // Map lessonId to id
          scheduledDate: lesson.scheduledDate,
          dayOfWeek: lesson.dayOfWeek,
          startTime: lesson.startTime,
          endTime: lesson.endTime,
          classId: generationResult.classId,
          className: className, // Use the className prop
          teacherId: '', // Not available in current API response
          teacherName: '', // Not available in current API response
          classroomId: '', // Not available in current API response
          classroomName: '', // Not available in current API response
        })),
        skippedLessons: generationResult.skippedLessons.map(skipped => ({
          scheduledDate: skipped.scheduledDate,
          dayOfWeek: skipped.dayOfWeek,
          startTime: skipped.startTime,
          endTime: skipped.endTime,
          skipReason: skipped.skipReason === 'scheduling_conflict' ? 'existing_lesson_conflict' : skipped.skipReason,
          skipDetails: null, // Current API doesn't provide detailed skip information
        })),
        errors: generationResult.errors.map(error => ({
          scheduledDate: error.scheduledDate,
          startTime: error.startTime,
          endTime: error.endTime,
          errorType: error.errorType,
          errorMessage: error.errorMessage,
        })),
      };
      
      setResult(enhancedResult);
      setStep('results');
      
      // Don't call onSuccess immediately - let user see the results first
      // onSuccess will be called when user clicks "Done"
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.message || 'Failed to generate lessons');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Call onSuccess when user closes after seeing results
    if (result && onSuccess) {
      onSuccess(result);
    }
    
    setFormData({
      generationMode: 'CustomRange',
      startDate: '',
      endDate: '',
      academicYearId: null,
      semesterId: null,
      respectBreaks: true,
      respectHolidays: true,
    });
    setResult(null);
    setError(null);
    setStep('form');
    setDatesManuallySet(false);
    onOpenChange(false);
  };

  const handleStartOver = () => {
    setResult(null);
    setError(null);
    setStep('form');
  };

  const isDateFieldDisabled = formData.generationMode === 'Semester' || formData.generationMode === 'FullYear' || formData.generationMode === 'Month';

  const renderFormStep = () => (
    <form id="lesson-generation-form" className="space-y-4">
      {/* Generation Mode Selection */}
      <div>
        <Label className="text-white text-sm font-medium flex items-center gap-2">
          <Settings className="w-4 h-4 text-purple-400" />
          Generation Mode
        </Label>
        <div className="mt-1">
          <Select
            value={formData.generationMode}
            onValueChange={(value: GenerationMode) => handleInputChange('generationMode', value)}
          >
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CustomRange">Custom Date Range</SelectItem>
              <SelectItem value="Month">Current Month</SelectItem>
              <SelectItem value="Semester">Semester</SelectItem>
              <SelectItem value="FullYear">Full Academic Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Academic Context */}
      {(formData.generationMode === 'Semester' || formData.generationMode === 'FullYear') && (
        <div className="space-y-4 p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <BookOpen className="w-4 h-4 text-green-400" />
            <span className="font-medium">Academic Context</span>
          </div>

          {/* Academic Year Selection */}
          <div>
            <Label className="text-white text-sm font-medium">Academic Year *</Label>
            <div className="mt-1">
              <YearsDropdown
                value={formData.academicYearId || ''}
                onValueChange={(value) => handleInputChange('academicYearId', value)}
                placeholder="Select academic year"
                disabled={loadingData}
                showActiveIndicator={true}
                onLoaded={(years) => {
                  setAcademicYears(years);
                  if (!formData.academicYearId && years && years.length > 0) {
                    const active = years.find(y => y.isActive);
                    const targetId = active?.id || years[0].id;
                    setFormData(prev => ({ ...prev, academicYearId: targetId }));
                  }
                }}
              />
            </div>
          </div>

          {/* Semester Selection */}
          {formData.generationMode === 'Semester' && (
            <div>
              <Label className="text-white text-sm font-medium">Semester *</Label>
              <div className="mt-1">
                <SemestersDropdown
                  academicYearId={formData.academicYearId}
                  value={formData.semesterId || ''}
                  onValueChange={(id) => handleInputChange('semesterId', id)}
                  disabled={loadingData || !formData.academicYearId}
                  placeholder="Select semester"
                  showDateRangeInfo={true}
                  onLoaded={(loaded) => {
                    // Filter out deleted semesters
                    const activeSemesters = loaded.filter((s) => !s.isDeleted);
                    setSemesters(activeSemesters);
                    if (formData.generationMode === 'Semester' && !formData.semesterId && activeSemesters.length > 0) {
                      const first = activeSemesters[0];
                      setFormData(prev => ({ ...prev, semesterId: first.id }));
                    }
                  }}
                  onError={(message) => {
                    setError(message);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Date Range */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-white text-sm font-medium flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-purple-400" />
            Date Range
          </Label>
          {isDateFieldDisabled && (
            <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400/50">
              Auto-set
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NativeDateInput
            label="Start Date"
            value={formData.startDate}
            onChange={(date) => handleInputChange('startDate', date)}
            min={new Date().toISOString().split('T')[0]}
            max={new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0]}
            disabled={isDateFieldDisabled}
            required
          />
          <NativeDateInput
            label="End Date"
            value={formData.endDate}
            onChange={(date) => handleInputChange('endDate', date)}
            min={formData.startDate || new Date().toISOString().split('T')[0]}
            max={new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0]}
            disabled={isDateFieldDisabled}
            required
          />
        </div>

        {/* Semester Info Helper Text */}
        {formData.generationMode === 'Semester' && formData.semesterId && formData.startDate && formData.endDate && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <BookOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="text-sm text-blue-200">
              Dates auto-filled from{' '}
              <span className="font-semibold">
                {semesters.find(s => s.id === formData.semesterId)?.name || 'selected semester'}
              </span>
              {' '}({formatDateForDisplay(formData.startDate)} - {formatDateForDisplay(formData.endDate)})
            </span>
          </div>
        )}
      </div>

      {/* Academic Calendar Options */}
      <div className="space-y-3 p-3 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <span className="font-medium">Calendar Options</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm font-medium">Respect Teaching Breaks</Label>
              <p className="text-white/50 text-xs mt-0.5">Skip during teaching breaks</p>
            </div>
            <Switch
              checked={formData.respectBreaks}
              onCheckedChange={(checked) => handleInputChange('respectBreaks', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm font-medium">Respect Public Holidays</Label>
              <p className="text-white/50 text-xs mt-0.5">Skip on public holidays</p>
            </div>
            <Switch
              checked={formData.respectHolidays}
              onCheckedChange={(checked) => handleInputChange('respectHolidays', checked)}
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="bg-red-500/10 border-red-500/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-300">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );

  const renderGeneratingStep = () => (
    <div className="text-center py-8">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Generating Lessons</h3>
      <p className="text-white/60 mb-4">
        Creating lessons with academic calendar awareness...
      </p>
      <Progress value={undefined} className="w-full max-w-xs mx-auto" />
    </div>
  );

  const renderResultsStep = () => {
    if (!result) return null;

    return (
      <div className="space-y-4">
        {/* Enhanced Results Component */}
        <EnhancedLessonGenerationResults result={result} />
      </div>
    );
  };

  // Render footer buttons based on current step
  const renderFooterButtons = () => {
    if (step === 'generating') {
      return null; // No footer during generation
    }

    if (step === 'results') {
      return (
        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleStartOver}
            className="flex-1 text-white hover:bg-white/10"
          >
            Generate More
          </Button>
          <Button
            type="button"
            onClick={handleClose}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Done
            </div>
          </Button>
        </div>
      );
    }

    // Form step
    return (
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={loading || loadingData}
          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Generating...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Lessons
            </div>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={handleClose}
          disabled={loading}
          className="flex-1 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={(newOpen) => {
      // Only allow closing if we're not in the generating step
      if (step === 'generating') {
        return; // Prevent closing during generation
      }
      onOpenChange(newOpen);
    }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 bg-white/10 backdrop-blur-md border border-white/20 text-white"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-4 py-4 border-b border-white/10">
            <SheetTitle className="flex items-center gap-2 text-white text-lg font-semibold">
              <Sparkles className="w-5 h-5 text-purple-400" />
              {step === 'results' ? 'Generation Results' : 'Generate Lessons'}
            </SheetTitle>
            <p className="text-white/60 text-sm mt-1">
              {step === 'results'
                ? `Successfully processed lessons for ${className}`
                : `Generate lessons for ${className} with calendar awareness`
              }
            </p>
          </SheetHeader>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {step === 'form' && renderFormStep()}
              {step === 'generating' && renderGeneratingStep()}
              {step === 'results' && renderResultsStep()}
            </div>
          </ScrollArea>

          {/* Footer Actions - Pinned at bottom */}
          {step !== 'generating' && (
            <div className="p-4 border-t border-white/10">
              {renderFooterButtons()}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AcademicLessonGenerationModal;


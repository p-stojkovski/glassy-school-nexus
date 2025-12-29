import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, BookOpen, User, Calendar } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentProgressChips, StudentLessonDetailsRow } from '@/domains/classes/detail-page/tabs/students';
import { StudentClassEnrollment } from '@/types/api/student';
import { StudentLessonDetail } from '@/types/api/class';
import { studentApiService } from '@/services/studentApiService';
import { classApiService } from '@/services/classApiService';

interface StudentClassesTabProps {
  studentId: string;
  currentClassId?: string;
}

/**
 * StudentClassesTab displays all class enrollments for a student, grouped by academic year.
 * Each class card shows summary progress (attendance/homework) and expands to show per-lesson details.
 */
const StudentClassesTab: React.FC<StudentClassesTabProps> = ({
  studentId,
  currentClassId,
}) => {
  const [classes, setClasses] = useState<StudentClassEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selected academic year filter (null = show all from response, which defaults to active year)
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  
  // Expanded class cards - track which ones are showing lesson details
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  
  // Cached lesson details per class
  const [lessonDetailsCache, setLessonDetailsCache] = useState<Record<string, StudentLessonDetail[]>>({});
  const [lessonDetailsLoading, setLessonDetailsLoading] = useState<Set<string>>(new Set());

  // Load classes on mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        setError(null);
        // Load all years so user can filter
        const data = await studentApiService.getStudentClasses(studentId, { includeAllYears: true });
        setClasses(data);
        
        // If student has a current class, find its year and select it
        if (currentClassId) {
          const currentClass = data.find(c => c.classId === currentClassId);
          if (currentClass) {
            setSelectedYearId(currentClass.academicYearId);
          }
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load classes';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    loadClasses();
  }, [studentId, currentClassId]);

  // Get unique academic years from classes
  const academicYears = React.useMemo(() => {
    const yearsMap = new Map<string, { id: string; name: string }>();
    classes.forEach(c => {
      if (!yearsMap.has(c.academicYearId)) {
        yearsMap.set(c.academicYearId, { id: c.academicYearId, name: c.academicYearName });
      }
    });
    return Array.from(yearsMap.values());
  }, [classes]);

  // Filter classes by selected year
  const filteredClasses = React.useMemo(() => {
    if (!selectedYearId) {
      // If no year selected and we have classes, default to first year's classes
      if (academicYears.length > 0) {
        return classes.filter(c => c.academicYearId === academicYears[0].id);
      }
      return classes;
    }
    return classes.filter(c => c.academicYearId === selectedYearId);
  }, [classes, selectedYearId, academicYears]);

  // Load lesson details for a class
  const loadLessonDetails = useCallback(async (classId: string) => {
    if (lessonDetailsLoading.has(classId)) return;
    
    setLessonDetailsLoading(prev => new Set(prev).add(classId));
    try {
      const details = await classApiService.getClassStudentLessons(classId, studentId);
      setLessonDetailsCache(prev => ({ ...prev, [classId]: details }));
    } catch (err) {
      console.error('Failed to load lesson details:', err);
      setLessonDetailsCache(prev => ({ ...prev, [classId]: [] }));
    } finally {
      setLessonDetailsLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(classId);
        return newSet;
      });
    }
  }, [studentId, lessonDetailsLoading]);

  // Toggle class expansion
  const toggleExpanded = useCallback(async (classId: string) => {
    setExpandedClasses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
        // Load lesson details if not cached
        if (!lessonDetailsCache[classId]) {
          loadLessonDetails(classId);
        }
      }
      return newSet;
    });
  }, [lessonDetailsCache, loadLessonDetails]);

  // Get enrollment status badge style
  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === 'active') {
      return (
        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs">
          Active
        </Badge>
      );
    }
    if (normalizedStatus === 'transferred') {
      return (
        <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-400/30 text-xs">
          Transferred
        </Badge>
      );
    }
    if (normalizedStatus === 'inactive') {
      return (
        <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-400/30 text-xs">
          Inactive
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-gray-500/20 text-gray-300 border-gray-400/30 text-xs">
        {status}
      </Badge>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white/60" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <GlassCard className="p-6">
        <div className="text-center text-red-300">
          <p className="font-medium">Error loading classes</p>
          <p className="text-sm text-white/50 mt-1">{error}</p>
        </div>
      </GlassCard>
    );
  }

  // Empty state
  if (classes.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <BookOpen className="w-12 h-12 mx-auto text-white/30 mb-4" />
        <h3 className="text-lg font-medium text-white/80 mb-2">No Classes Found</h3>
        <p className="text-white/50">This student is not enrolled in any classes yet.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Academic Year Filter */}
      {academicYears.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {academicYears.map(year => (
            <Button
              key={year.id}
              variant={selectedYearId === year.id || (!selectedYearId && year.id === academicYears[0]?.id) ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedYearId(year.id)}
              className={
                selectedYearId === year.id || (!selectedYearId && year.id === academicYears[0]?.id)
                  ? 'bg-white/20 text-white hover:bg-white/30 border-white/30'
                  : 'bg-transparent text-white/70 border-white/20 hover:bg-white/10'
              }
            >
              {year.name}
            </Button>
          ))}
        </div>
      )}

      {/* Class Cards */}
      <div className="space-y-4">
        {filteredClasses.map(enrollment => {
          const isExpanded = expandedClasses.has(enrollment.classId);
          const isCurrent = enrollment.classId === currentClassId;
          const isLoadingDetails = lessonDetailsLoading.has(enrollment.classId);
          const lessonDetails = lessonDetailsCache[enrollment.classId] || [];

          return (
            <GlassCard
              key={enrollment.classId}
              className={`overflow-hidden ${isCurrent ? 'ring-1 ring-emerald-400/30' : ''}`}
            >
              {/* Card Header */}
              <div 
                className="p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => toggleExpanded(enrollment.classId)}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Class info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        to={`/classes/${enrollment.classId}`}
                        onClick={e => e.stopPropagation()}
                        className="text-lg font-medium text-white/90 hover:text-white hover:underline truncate"
                      >
                        {enrollment.className}
                      </Link>
                      {isCurrent && (
                        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs">
                          Current
                        </Badge>
                      )}
                      {getStatusBadge(enrollment.enrollmentStatus)}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {enrollment.subjectName}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {enrollment.teacherName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Transfer info */}
                    {enrollment.transferredToClassId && (
                      <div className="mt-2 text-sm text-amber-400/80">
                        Transferred on {enrollment.transferredAt ? new Date(enrollment.transferredAt).toLocaleDateString() : 'N/A'}
                        {enrollment.transferReason && ` — ${enrollment.transferReason}`}
                      </div>
                    )}
                  </div>

                  {/* Right: Summary + expand toggle */}
                  <div className="flex items-center gap-4">
                    <StudentProgressChips
                      totalLessons={enrollment.totalLessons}
                      attendance={enrollment.attendance}
                      homework={enrollment.homework}
                    />
                    <div className="text-white/40">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded: Lesson Details */}
              {isExpanded && (
                <div className="border-t border-white/[0.08]">
                  <StudentLessonDetailsRow
                    lessons={lessonDetails}
                    loading={isLoadingDetails}
                  />
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(StudentClassesTab);

/**
 * Enhanced Lesson Student Data Hook with Offline Sync
 * 
 * Extends the existing useLessonStudentData hook to integrate with the global offline sync system.
 * Provides seamless offline/online experience for attendance management.
 * 
 * Features:
 * - Offline sync for attendance, homework, and comments
 * - Optimistic updates with rollback on failure
 * - Connection status monitoring
 * - Queue management for offline operations
 * - Bulk operations support
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import lessonStudentApiService from '@/services/lessonStudentApiService';
import {
  LessonStudentResponse,
  AttendanceStatus,
  HomeworkStatus,
  SaveStatus,
} from '@/types/api/lesson-students';
import { 
  useOfflineSync, 
  createSyncConfig, 
  SyncQueueItem,
  ConnectionStatus 
} from '@/hooks/useOfflineSync';

// Enhanced student data interface for card display
export interface StudentRowState extends LessonStudentResponse {
  attendanceSaveStatus: SaveStatus;
  homeworkSaveStatus: SaveStatus;
  commentsSaveStatus: SaveStatus;
  isOfflinePending: boolean; // Indicates if this student has pending offline changes
}

// Sync operation data types
interface AttendanceSyncData {
  studentId: string;
  status: AttendanceStatus;
}

interface HomeworkSyncData {
  studentId: string;
  status: HomeworkStatus;
}

interface CommentsSyncData {
  studentId: string;
  comments: string;
}

type LessonStudentSyncData = AttendanceSyncData | HomeworkSyncData | CommentsSyncData;

interface UseLessonStudentDataWithSyncReturn {
  // Student data
  students: StudentRowState[];
  loading: boolean;
  error: string | null;
  
  // Connection status
  connectionStatus: ConnectionStatus;
  queueSize: number;
  isOffline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  
  // Operations
  updateAttendance: (studentId: string, status: AttendanceStatus) => Promise<void>;
  updateHomework: (studentId: string, status: HomeworkStatus) => Promise<void>;
  updateComments: (studentId: string, comments: string) => void;
  bulkMarkPresent: () => Promise<void>;
  
  // Sync management
  syncNow: () => Promise<void>;
  clearQueue: () => void;
  refreshStudents: () => Promise<void>;
}

export const useLessonStudentDataWithSync = (lessonId: string): UseLessonStudentDataWithSyncReturn => {
  // State
  const [students, setStudents] = useState<StudentRowState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const commentTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const mounted = useRef(true);

  // Offline sync configuration for update operations
  const syncConfig = createSyncConfig<LessonStudentSyncData>(
    `lesson_students_${lessonId}`,
    async (items: SyncQueueItem<LessonStudentSyncData>[]) => {
      // Group items by operation type for efficient syncing
      const attendanceItems = items.filter(item => item.operation === 'update' && 'status' in item.data && typeof item.data.status === 'string' && ['present', 'absent', 'late', 'excused'].includes(item.data.status));
      const homeworkItems = items.filter(item => item.operation === 'update' && 'status' in item.data && typeof item.data.status === 'string' && ['complete', 'missing', 'partial'].includes(item.data.status));
      const commentItems = items.filter(item => item.operation === 'update' && 'comments' in item.data);

      // Sync attendance updates
      for (const item of attendanceItems) {
        const data = item.data as AttendanceSyncData;
        await lessonStudentApiService.updateAttendance(lessonId, data.studentId, { status: data.status });
      }

      // Sync homework updates
      for (const item of homeworkItems) {
        const data = item.data as HomeworkSyncData;
        await lessonStudentApiService.updateHomework(lessonId, data.studentId, { status: data.status });
      }

      // Sync comment updates
      for (const item of commentItems) {
        const data = item.data as CommentsSyncData;
        await lessonStudentApiService.updateComments(lessonId, data.studentId, { comments: data.comments });
      }
    },
    {
      maxQueueSize: 200, // Increased for student data
      maxRetries: 5,
      syncInterval: 45000, // 45 seconds
    }
  );

  // Initialize offline sync
  const offlineSync = useOfflineSync(syncConfig);

  // Separate caching functions for student data (not part of sync operations)
  const getCachedStudentsData = useCallback((): LessonStudentResponse[] | null => {
    try {
      const stored = localStorage.getItem(`lesson_students_cache_${lessonId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading cached student data:', error);
      return null;
    }
  }, [lessonId]);

  const setCachedStudentsData = useCallback((data: LessonStudentResponse[]): void => {
    try {
      localStorage.setItem(`lesson_students_cache_${lessonId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching student data:', error);
    }
  }, [lessonId]);

  // Cleanup function
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // Clear all pending comment timeouts
      commentTimeouts.current.forEach(timeout => clearTimeout(timeout));
      commentTimeouts.current.clear();
    };
  }, []);

  // Convert API response to internal state format
  const mapToStudentRowState = useCallback((student: LessonStudentResponse): StudentRowState => {
    const queue = offlineSync.getQueue();
    const hasPendingChanges = queue.some(item => item.entityId === student.studentId);
    
    return {
      ...student,
      attendanceSaveStatus: 'idle' as SaveStatus,
      homeworkSaveStatus: 'idle' as SaveStatus,
      commentsSaveStatus: 'idle' as SaveStatus,
      isOfflinePending: hasPendingChanges,
    };
  }, [offlineSync]);

  // Fetch students for the lesson
  const fetchStudents = useCallback(async () => {
    if (!lessonId) return;

    try {
      setLoading(true);
      setError(null);
      
      let studentsData: LessonStudentResponse[];
      
      if (offlineSync.isOffline) {
        // Try to get cached data when offline
        const cachedData = getCachedStudentsData();
        if (cachedData && Array.isArray(cachedData)) {
          studentsData = cachedData;
        } else {
          throw new Error('No offline data available');
        }
      } else {
        // Fetch from API when online
        studentsData = await lessonStudentApiService.getLessonStudents(lessonId);
        // Cache the data for offline use
        setCachedStudentsData(studentsData);
      }
      
      if (mounted.current) {
        setStudents(studentsData.map(mapToStudentRowState));
      }
    } catch (err: any) {
      if (mounted.current) {
        const errorMessage = err.message || 'Failed to load students';
        setError(errorMessage);
        
        if (!offlineSync.isOffline) {
          toast({
            title: 'Error loading students',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [lessonId, offlineSync, mapToStudentRowState]);

  // Initial load and reload on connection status change
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Update students when sync queue changes
  useEffect(() => {
    if (students.length > 0) {
      setStudents(prevStudents =>
        prevStudents.map(student => {
          const queue = offlineSync.getQueue();
          const hasPendingChanges = queue.some(item => item.entityId === student.studentId);
          return {
            ...student,
            isOfflinePending: hasPendingChanges,
          };
        })
      );
    }
  }, [offlineSync.queueSize, students.length]);

  // Update student in local state
  const updateStudentInState = useCallback((
    studentId: string, 
    updates: Partial<StudentRowState>
  ) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.studentId === studentId 
          ? { ...student, ...updates }
          : student
      )
    );
  }, []);

  // Update attendance status
  const updateAttendance = useCallback(async (studentId: string, status: AttendanceStatus) => {
    // Optimistic update
    updateStudentInState(studentId, {
      attendanceStatus: status,
      attendanceSaveStatus: 'saving',
    });

    try {
      if (offlineSync.isOffline) {
        // Queue for offline sync
        await offlineSync.queueOperation('update', studentId, { studentId, status } as AttendanceSyncData);
        
        updateStudentInState(studentId, {
          attendanceSaveStatus: 'saved',
          isOfflinePending: true,
        });

        // Reset save status after delay
        setTimeout(() => {
          if (mounted.current) {
            updateStudentInState(studentId, { attendanceSaveStatus: 'idle' });
          }
        }, 2000);
      } else {
        // Direct API call when online
        const updatedStudent = await lessonStudentApiService.updateAttendance(
          lessonId,
          studentId,
          { status }
        );

        if (mounted.current) {
          updateStudentInState(studentId, {
            ...mapToStudentRowState(updatedStudent),
            attendanceSaveStatus: 'saved',
          });

          // Reset save status after delay
          setTimeout(() => {
            if (mounted.current) {
              updateStudentInState(studentId, { attendanceSaveStatus: 'idle' });
            }
          }, 2000);
        }
      }
    } catch (err: any) {
      if (mounted.current) {
        // Revert optimistic update on error (only for online failures)
        if (!offlineSync.isOffline) {
          const originalStudent = students.find(s => s.studentId === studentId);
          updateStudentInState(studentId, {
            attendanceStatus: originalStudent?.attendanceStatus || null,
            attendanceSaveStatus: 'error',
          });

          toast({
            title: 'Failed to save attendance',
            description: err.message || 'Please try again',
            variant: 'destructive',
          });

          // Reset error status after delay
          setTimeout(() => {
            if (mounted.current) {
              updateStudentInState(studentId, { attendanceSaveStatus: 'idle' });
            }
          }, 3000);
        }
      }
    }
  }, [lessonId, students, updateStudentInState, offlineSync, mapToStudentRowState]);

  // Update homework status
  const updateHomework = useCallback(async (studentId: string, status: HomeworkStatus) => {
    // Similar implementation to updateAttendance but for homework
    updateStudentInState(studentId, {
      homeworkStatus: status,
      homeworkSaveStatus: 'saving',
    });

    try {
      if (offlineSync.isOffline) {
        await offlineSync.queueOperation('update', studentId, { studentId, status } as HomeworkSyncData);
        
        updateStudentInState(studentId, {
          homeworkSaveStatus: 'saved',
          isOfflinePending: true,
        });

        setTimeout(() => {
          if (mounted.current) {
            updateStudentInState(studentId, { homeworkSaveStatus: 'idle' });
          }
        }, 2000);
      } else {
        const updatedStudent = await lessonStudentApiService.updateHomework(
          lessonId,
          studentId,
          { status }
        );

        if (mounted.current) {
          updateStudentInState(studentId, {
            ...mapToStudentRowState(updatedStudent),
            homeworkSaveStatus: 'saved',
          });

          setTimeout(() => {
            if (mounted.current) {
              updateStudentInState(studentId, { homeworkSaveStatus: 'idle' });
            }
          }, 2000);
        }
      }
    } catch (err: any) {
      if (mounted.current && !offlineSync.isOffline) {
        const originalStudent = students.find(s => s.studentId === studentId);
        updateStudentInState(studentId, {
          homeworkStatus: originalStudent?.homeworkStatus || null,
          homeworkSaveStatus: 'error',
        });

        toast({
          title: 'Failed to save homework status',
          description: err.message || 'Please try again',
          variant: 'destructive',
        });

        setTimeout(() => {
          if (mounted.current) {
            updateStudentInState(studentId, { homeworkSaveStatus: 'idle' });
          }
        }, 3000);
      }
    }
  }, [lessonId, students, updateStudentInState, offlineSync, mapToStudentRowState]);

  // Update comments with debounced save
  const updateComments = useCallback((studentId: string, comments: string) => {
    // Immediate UI update
    updateStudentInState(studentId, {
      comments,
      commentsSaveStatus: comments.trim() ? 'saving' : 'idle',
    });

    // Clear existing timeout
    const existingTimeout = commentTimeouts.current.get(studentId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Don't save if comments are empty
    if (!comments.trim()) {
      updateStudentInState(studentId, { commentsSaveStatus: 'idle' });
      return;
    }

    // Set new debounced save timeout
    const timeoutId = setTimeout(async () => {
      if (!mounted.current) return;

      try {
        if (offlineSync.isOffline) {
          await offlineSync.queueOperation('update', studentId, { studentId, comments } as CommentsSyncData);
          
          updateStudentInState(studentId, {
            commentsSaveStatus: 'saved',
            isOfflinePending: true,
          });
        } else {
          const updatedStudent = await lessonStudentApiService.updateComments(
            lessonId,
            studentId,
            { comments }
          );

          if (mounted.current) {
            updateStudentInState(studentId, {
              ...mapToStudentRowState(updatedStudent),
              commentsSaveStatus: 'saved',
            });
          }
        }

        // Reset save status after delay
        setTimeout(() => {
          if (mounted.current) {
            updateStudentInState(studentId, { commentsSaveStatus: 'idle' });
          }
        }, 2000);
      } catch (err: any) {
        if (mounted.current) {
          updateStudentInState(studentId, { commentsSaveStatus: 'error' });
          
          if (!offlineSync.isOffline) {
            toast({
              title: 'Failed to save comment',
              description: err.message || 'Please try again',
              variant: 'destructive',
            });
          }

          setTimeout(() => {
            if (mounted.current) {
              updateStudentInState(studentId, { commentsSaveStatus: 'idle' });
            }
          }, 3000);
        }
      }

      commentTimeouts.current.delete(studentId);
    }, 2000);

    commentTimeouts.current.set(studentId, timeoutId);
  }, [lessonId, updateStudentInState, offlineSync, mapToStudentRowState]);

  // Bulk mark all present
  const bulkMarkPresent = useCallback(async () => {
    const studentsToUpdate = students.filter(student => student.attendanceStatus !== 'present');
    
    if (studentsToUpdate.length === 0) {
      toast({
        title: 'All students already marked present',
        description: 'No changes needed.',
        variant: 'default',
      });
      return;
    }

    // Update all students optimistically
    studentsToUpdate.forEach(student => {
      updateStudentInState(student.studentId, {
        attendanceStatus: 'present',
        attendanceSaveStatus: 'saving',
      });
    });

    try {
      // Process updates (either queue for offline or call API)
      for (const student of studentsToUpdate) {
        if (offlineSync.isOffline) {
          await offlineSync.queueOperation('update', student.studentId, { 
            studentId: student.studentId, 
            status: 'present' 
          } as AttendanceSyncData);
        } else {
          await lessonStudentApiService.updateAttendance(
            lessonId,
            student.studentId,
            { status: 'present' }
          );
        }

        // Update save status
        updateStudentInState(student.studentId, {
          attendanceSaveStatus: 'saved',
          isOfflinePending: offlineSync.isOffline,
        });
      }

      toast({
        title: 'Bulk Update Complete',
        description: `Marked ${studentsToUpdate.length} students as present.`,
        variant: 'default',
      });

      // Reset save statuses after delay
      setTimeout(() => {
        if (mounted.current) {
          studentsToUpdate.forEach(student => {
            updateStudentInState(student.studentId, { attendanceSaveStatus: 'idle' });
          });
        }
      }, 2000);

    } catch (err: any) {
      // Handle bulk operation failure
      if (!offlineSync.isOffline) {
        toast({
          title: 'Bulk Update Failed',
          description: err.message || 'Some students may not have been updated',
          variant: 'destructive',
        });
      }
    }
  }, [students, lessonId, updateStudentInState, offlineSync]);

  return {
    students,
    loading,
    error,
    
    connectionStatus: offlineSync.connectionStatus,
    queueSize: offlineSync.queueSize,
    isOffline: offlineSync.isOffline,
    isSyncing: offlineSync.isSyncing,
    lastSyncTime: offlineSync.lastSyncTime,
    
    updateAttendance,
    updateHomework,
    updateComments,
    bulkMarkPresent,
    
    syncNow: offlineSync.syncNow,
    clearQueue: offlineSync.clearQueue,
    refreshStudents: fetchStudents,
  };
};
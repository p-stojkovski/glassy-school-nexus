import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GlassCard from '@/components/common/GlassCard';
import { studentApiService } from '@/services/studentApiService';
import { StudentResponse } from '@/types/api/student';
import { AlertCircle, Mail, Phone, User, Loader2 } from 'lucide-react';

interface EnrolledStudentsListProps {
  studentIds: string[];
  enrolledCount: number;
}

// In-memory cache with size limit to avoid memory leaks
const MAX_CACHE_SIZE = 100;
const studentsCache = new Map<string, StudentResponse>();

const addToCache = (id: string, student: StudentResponse) => {
  if (studentsCache.size >= MAX_CACHE_SIZE && !studentsCache.has(id)) {
    const firstKey = studentsCache.keys().next().value;
    studentsCache.delete(firstKey);
  }
  studentsCache.set(id, student);
};

const EnrolledStudentsList: React.FC<EnrolledStudentsListProps> = ({ studentIds, enrolledCount }) => {
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partialLoadWarning, setPartialLoadWarning] = useState(false);
  const mountedRef = useRef(true);

  const toFetchIds = useMemo(
    () => studentIds.filter((id) => !studentsCache.has(id)),
    [studentIds]
  );

  const loadFromCache = useCallback(() => {
    const existing = studentIds
      .map((id) => studentsCache.get(id))
      .filter(Boolean) as StudentResponse[];
    setStudents(existing);
  }, [studentIds]);

  const fetchEnrolledStudents = useCallback(async () => {
    if (!studentIds?.length) {
      setStudents([]);
      setPartialLoadWarning(false);
      return;
    }
    setLoading(true);
    setError(null);
    setPartialLoadWarning(false);
    try {
      if (toFetchIds.length > 0) {
        const promises = toFetchIds.map((id) =>
          studentApiService
            .getStudentById(id)
            .then((s) => ({ ok: true as const, s }))
            .catch(() => ({ ok: false as const }))
        );
        const results = await Promise.all(promises);
        // Update cache with successful results
        const failures = results.filter((r) => !r.ok).length;
        for (const r of results) {
          if (r.ok) addToCache(r.s.id, r.s);
        }
        // Show warning if some students failed to load
        if (failures > 0 && mountedRef.current) {
          setPartialLoadWarning(true);
        }
      }
      if (mountedRef.current) loadFromCache();
    } catch (e) {
      if (mountedRef.current) setError('Failed to load student details');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [loadFromCache, toFetchIds, studentIds]);

  useEffect(() => {
    mountedRef.current = true;
    // Initial load: show whatever is cached, then fetch missing
    loadFromCache();
    fetchEnrolledStudents();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchEnrolledStudents, loadFromCache]);

  const content = useMemo(() => {
    if (loading && students.length === 0) {
      // Initial loading state with skeletons
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: Math.min(6, Math.max(1, enrolledCount)) }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10" />
                  <div className="flex-1">
                    <div className="h-3 w-32 bg-white/10 rounded mb-2" />
                    <div className="h-3 w-40 bg-white/10 rounded" />
                  </div>
                </div>
                <div className="mt-4 h-3 w-24 bg-white/10 rounded" />
              </div>
            ))}
          </div>
          {partialLoadWarning && (
            <div className="text-xs text-yellow-400 flex items-center gap-1">
              ⚠️ Some student data couldn't be loaded
            </div>
          )}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-between p-4 rounded-xl border border-red-400/30 bg-red-400/10">
          <div className="flex items-center gap-2 text-red-200">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchEnrolledStudents}
            aria-label="Retry loading students"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm"
          >
            <Loader2 className="w-4 h-4 animate-spin" /> Try again
          </button>
        </div>
      );
    }

    if (students.length === 0) {
      return <div className="text-center py-6 text-white/60">No students enrolled yet</div>;
    }

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[480px] overflow-y-auto pr-1">
          {students.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400/80 to-amber-600/80 flex items-center justify-center text-black/80">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-white font-medium">{s.fullName}</div>
                  <span
                    className={
                      'text-xs px-2 py-0.5 rounded-full border ' +
                      (s.isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20'
                        : 'bg-white/10 text-white/70 border-white/15')
                    }
                  >
                    {s.isActive ? 'Enrolled' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-white/70 truncate">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <a href={`mailto:${s.email}`} className="truncate hover:underline">{s.email}</a>
                </div>
                {s.phone && (
                  <div className="mt-1 flex items-center gap-2 text-white/70 truncate">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <a href={`tel:${s.phone}`} className="truncate hover:underline">{s.phone}</a>
                  </div>
                )}
                {s.enrollmentDate && (
                  <div className="mt-2 text-xs text-white/50">
                    Enrolled on: {new Date(s.enrollmentDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
          ))}
        </div>
        {partialLoadWarning && (
          <div className="text-xs text-yellow-400 flex items-center gap-1">
            ⚠️ Some student data couldn't be loaded
          </div>
        )}
      </div>
    );
  }, [loading, error, students, enrolledCount, fetchEnrolledStudents, partialLoadWarning]);

  return (
    <GlassCard className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/80">
          <User className="w-5 h-5" />
          <span className="font-medium">Enrolled Students ({students.length}/{enrolledCount})</span>
        </div>
        {loading && students.length > 0 && (
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading updates…
          </div>
        )}
      </div>
      {content}
    </GlassCard>
  );
};

export default React.memo(EnrolledStudentsList);
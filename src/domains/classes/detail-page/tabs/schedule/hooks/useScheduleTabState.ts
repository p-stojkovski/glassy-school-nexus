import { useReducer, useCallback, useMemo } from 'react';
import { scheduleTabReducer, initialState } from './scheduleTabReducer';
import type { ScheduleSlotDto } from '@/types/api/class';
import type { AcademicSemesterResponse } from '@/types/api/academic-calendar';

export function useScheduleTabState(initialSemesterId?: string) {
  const [state, dispatch] = useReducer(
    scheduleTabReducer,
    initialState,
    (init) => initialSemesterId
      ? { ...init, filter: { selectedSemesterId: initialSemesterId } }
      : init
  );

  // Memoized action creators
  const actions = useMemo(() => ({
    // Data actions
    fetchScheduleStart: () => dispatch({ type: 'FETCH_SCHEDULE_START' }),
    fetchScheduleSuccess: (schedule: ScheduleSlotDto[], classId: string) =>
      dispatch({ type: 'FETCH_SCHEDULE_SUCCESS', payload: { schedule, classId } }),
    fetchScheduleError: (error: string) =>
      dispatch({ type: 'FETCH_SCHEDULE_ERROR', payload: error }),
    fetchSemestersStart: () => dispatch({ type: 'FETCH_SEMESTERS_START' }),
    fetchSemestersSuccess: (semesters: AcademicSemesterResponse[], yearId: string) =>
      dispatch({ type: 'FETCH_SEMESTERS_SUCCESS', payload: { semesters, yearId } }),
    resetForClassChange: () => dispatch({ type: 'RESET_FOR_CLASS_CHANGE' }),

    // Dialog actions
    openAddDialog: () => dispatch({ type: 'OPEN_ADD_DIALOG' }),
    openEditDialog: (slot: ScheduleSlotDto) =>
      dispatch({ type: 'OPEN_EDIT_DIALOG', payload: slot }),
    openDeleteDialog: (slot: ScheduleSlotDto) =>
      dispatch({ type: 'OPEN_DELETE_DIALOG', payload: slot }),
    closeDialog: () => dispatch({ type: 'CLOSE_DIALOG' }),
    deleteStart: () => dispatch({ type: 'DELETE_START' }),
    deleteComplete: () => dispatch({ type: 'DELETE_COMPLETE' }),

    // Filter actions
    setSemesterFilter: (id: string) =>
      dispatch({ type: 'SET_SEMESTER_FILTER', payload: id }),
  }), []);

  // Computed values
  const hasFetchedSchedule = useCallback(
    (classId: string | undefined) => Boolean(classId && state.fetch.fetchedClassId === classId),
    [state.fetch.fetchedClassId]
  );

  const hasFetchedSemesters = useCallback(
    (yearId: string | undefined) => Boolean(yearId && state.fetch.fetchedYearId === yearId),
    [state.fetch.fetchedYearId]
  );

  // Type-safe dialog accessors
  const dialogHelpers = useMemo(() => ({
    isAddDialogOpen: state.dialog.activeDialog === 'add',
    isEditDialogOpen: state.dialog.activeDialog === 'edit',
    isDeleteDialogOpen: state.dialog.activeDialog === 'delete',
    selectedSlot: state.dialog.activeDialog === 'edit' || state.dialog.activeDialog === 'delete'
      ? state.dialog.selectedSlot
      : null,
    isDeleting: state.dialog.activeDialog === 'delete' ? state.dialog.isDeleting : false,
  }), [state.dialog]);

  return {
    state,
    actions,
    hasFetchedSchedule,
    hasFetchedSemesters,
    ...dialogHelpers,
  };
}

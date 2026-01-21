import type { ScheduleTabState, ScheduleTabAction } from './scheduleTabState.types';

export const initialState: ScheduleTabState = {
  data: {
    schedule: [],
    semesters: [],
    loading: true,
    loadingSemesters: false,
    error: null,
  },
  dialog: { activeDialog: 'none' },
  fetch: {
    fetchedClassId: null,
    fetchedYearId: null,
  },
  filter: {
    selectedSemesterId: 'all',
  },
};

export function scheduleTabReducer(
  state: ScheduleTabState,
  action: ScheduleTabAction
): ScheduleTabState {
  switch (action.type) {
    // Data actions
    case 'FETCH_SCHEDULE_START':
      return { ...state, data: { ...state.data, loading: true, error: null } };

    case 'FETCH_SCHEDULE_SUCCESS':
      return {
        ...state,
        data: { ...state.data, schedule: action.payload.schedule, loading: false },
        fetch: { ...state.fetch, fetchedClassId: action.payload.classId },
      };

    case 'FETCH_SCHEDULE_ERROR':
      return { ...state, data: { ...state.data, loading: false, error: action.payload } };

    case 'FETCH_SEMESTERS_START':
      return { ...state, data: { ...state.data, loadingSemesters: true } };

    case 'FETCH_SEMESTERS_SUCCESS':
      return {
        ...state,
        data: { ...state.data, semesters: action.payload.semesters, loadingSemesters: false },
        fetch: { ...state.fetch, fetchedYearId: action.payload.yearId },
      };

    case 'RESET_FOR_CLASS_CHANGE':
      return {
        ...state,
        data: { ...state.data, schedule: [], error: null, loading: true },
        fetch: { ...state.fetch, fetchedClassId: null },
      };

    // Dialog actions
    case 'OPEN_ADD_DIALOG':
      return { ...state, dialog: { activeDialog: 'add' } };

    case 'OPEN_EDIT_DIALOG':
      return { ...state, dialog: { activeDialog: 'edit', selectedSlot: action.payload } };

    case 'OPEN_DELETE_DIALOG':
      return { ...state, dialog: { activeDialog: 'delete', selectedSlot: action.payload, isDeleting: false } };

    case 'CLOSE_DIALOG':
      return { ...state, dialog: { activeDialog: 'none' } };

    case 'DELETE_START':
      if (state.dialog.activeDialog !== 'delete') return state;
      return { ...state, dialog: { ...state.dialog, isDeleting: true } };

    case 'DELETE_COMPLETE':
      return { ...state, dialog: { activeDialog: 'none' } };

    // Filter actions
    case 'SET_SEMESTER_FILTER':
      return { ...state, filter: { selectedSemesterId: action.payload } };

    default:
      return state;
  }
}

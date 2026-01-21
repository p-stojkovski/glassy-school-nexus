import type { ScheduleSlotDto } from '@/types/api/class';
import type { AcademicSemesterResponse } from '@/types/api/academic-calendar';

// Dialog state as discriminated union - compile-time safety
export type DialogState =
  | { activeDialog: 'none' }
  | { activeDialog: 'add' }
  | { activeDialog: 'edit'; selectedSlot: ScheduleSlotDto }
  | { activeDialog: 'delete'; selectedSlot: ScheduleSlotDto; isDeleting: boolean };

export interface DataState {
  schedule: ScheduleSlotDto[];
  semesters: AcademicSemesterResponse[];
  loading: boolean;
  loadingSemesters: boolean;
  error: string | null;
}

export interface FetchState {
  fetchedClassId: string | null;
  fetchedYearId: string | null;
}

export interface FilterState {
  selectedSemesterId: string;
}

export interface ScheduleTabState {
  data: DataState;
  dialog: DialogState;
  fetch: FetchState;
  filter: FilterState;
}

export type ScheduleTabAction =
  // Data actions
  | { type: 'FETCH_SCHEDULE_START' }
  | { type: 'FETCH_SCHEDULE_SUCCESS'; payload: { schedule: ScheduleSlotDto[]; classId: string } }
  | { type: 'FETCH_SCHEDULE_ERROR'; payload: string }
  | { type: 'FETCH_SEMESTERS_START' }
  | { type: 'FETCH_SEMESTERS_SUCCESS'; payload: { semesters: AcademicSemesterResponse[]; yearId: string } }
  | { type: 'RESET_FOR_CLASS_CHANGE' }

  // Dialog actions
  | { type: 'OPEN_ADD_DIALOG' }
  | { type: 'OPEN_EDIT_DIALOG'; payload: ScheduleSlotDto }
  | { type: 'OPEN_DELETE_DIALOG'; payload: ScheduleSlotDto }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'DELETE_START' }
  | { type: 'DELETE_COMPLETE' }

  // Filter actions
  | { type: 'SET_SEMESTER_FILTER'; payload: string };

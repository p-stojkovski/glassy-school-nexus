import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import {
  Classroom,
  setClassrooms,
  addClassroom,
  updateClassroom,
  deleteClassroom,
  setLoading,
  resetDemoClassrooms,
  loadFromStorage,
} from '../classroomsSlice';

export const useClassrooms = () => {
  const dispatch = useAppDispatch();
  const { classrooms, loading } = useAppSelector((state: RootState) => state.classrooms);

  return {
    classrooms,
    loading,
    loadFromStorage,
    setClassrooms: (data: Classroom[]) => dispatch(setClassrooms(data)),
    addClassroom: (data: Classroom) => dispatch(addClassroom(data)),
    updateClassroom: (data: Classroom) => dispatch(updateClassroom(data)),
    deleteClassroom: (id: string) => dispatch(deleteClassroom(id)),
    setLoading: (value: boolean) => dispatch(setLoading(value)),
    resetDemoClassrooms: (data: Classroom[]) => dispatch(resetDemoClassrooms(data)),
  };
};

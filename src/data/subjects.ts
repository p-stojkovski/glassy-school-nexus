export type SubjectId = string;

export interface Subject {
  id: SubjectId;
  key: 'english' | 'german';
  name: string; // Display name (English only for now)
  sortOrder: number;
}

export const SUBJECTS: Subject[] = [
  {
    id: '7d3b4b25-5f85-4f11-8f2a-7d5c6f9a0a11',
    key: 'english',
    name: 'English',
    sortOrder: 1,
  },
  {
    id: 'a5c0b8b1-3f16-49a0-be1d-2e5a7fb4d2f2',
    key: 'german',
    name: 'German',
    sortOrder: 2,
  },
];

export const SUBJECT_BY_ID = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, s])
);

export const SUBJECT_BY_KEY = Object.fromEntries(
  SUBJECTS.map((s) => [s.key, s])
);


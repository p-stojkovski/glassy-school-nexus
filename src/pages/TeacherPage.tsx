import React from 'react';
import { TeacherProfilePage } from '@/domains/teachers/detail-page';

/**
 * Teacher Details Page
 *
 * Wrapper component for the teacher detail view at /teachers/:teacherId
 * Future phases will add more functionality (create mode, etc.)
 */
const TeacherPage: React.FC = () => {
  return <TeacherProfilePage />;
};

export default TeacherPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ConfirmDialog } from '@/components/common/dialogs';
import StandardDemoNotice from '@/components/common/StandardDemoNotice';
import { DemoManager } from '@/data/components/DemoManager';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PrivateLessonHeader from './PrivateLessonHeader';
import PrivateLessonFilters from './PrivateLessonFilters';
import PrivateLessonCard from './PrivateLessonCard';
import PrivateLessonForm from './PrivateLessonForm';
import PrivateLessonEmptyState from './PrivateLessonEmptyState';
import { usePrivateLessonsManagement } from '../hooks/usePrivateLessonsManagement';
import { PrivateLesson } from '../privateLessonsSlice';

const PrivateLessonsManagementPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    // Data
    lessons,
    allLessons,
    loading,
    students,
    teachers,
    classrooms,
    classes,

    // Filter state
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    hasFilters,
    clearFilters,

    // UI state
    isFormOpen,
    setIsFormOpen,
    selectedLesson,
    lessonToCancel,
    setLessonToCancel,
    lessonToComplete,
    setLessonToComplete,

    // Handlers
    handleAddLesson,
    handleEditLesson,
    handleDeleteLesson,
    handleCompleteLesson,
    handleSubmitLesson,
    handleCloseForm,
    confirmCancelLesson,
    confirmDeleteLesson,
    confirmCompleteLesson,

    // Computed
    isEditing,
  } = usePrivateLessonsManagement();

  // Handler for viewing lesson details
  const handleViewDetails = (lesson: PrivateLesson) => {
    navigate(`/private-lessons/${lesson.id}`);
  };

  if (loading && allLessons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StandardDemoNotice
        title="Private Lessons Demo"
        message="Schedule and manage personalized one-on-one lessons. All data is stored locally and persists between sessions."
      />

      <PrivateLessonHeader onAddLesson={handleAddLesson} />

      <PrivateLessonFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        hasFilters={hasFilters}
        clearFilters={clearFilters}
        totalLessons={allLessons.length}
        filteredCount={lessons.length}
      />

      {/* Private Lessons Grid */}
      {lessons.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <PrivateLessonCard
              key={lesson.id}
              lesson={lesson}
              onEdit={handleEditLesson}
              onCancel={handleDeleteLesson}
              onComplete={handleCompleteLesson}
              onViewDetails={handleViewDetails} // Pass the handler to the card
            />
          ))}
        </div>
      ) : (
        <PrivateLessonEmptyState
          onAddLesson={handleAddLesson}
          hasFilters={hasFilters}
          onClearFilters={hasFilters ? clearFilters : undefined}
        />
      )}

      {/* Form Sidebar */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto glass-scrollbar"
        >
          <SheetHeader className="pb-6 border-b border-white/20">
            <SheetTitle className="text-2xl font-bold text-white">
              {isEditing ? 'Edit Private Lesson' : 'Add New Private Lesson'}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <PrivateLessonForm
              lesson={selectedLesson}
              students={students}
              teachers={teachers}
              classrooms={classrooms}
              classes={classes}
              onSubmit={handleSubmitLesson}
              onCancel={handleCloseForm}
              isLoading={loading}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Cancel/Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!lessonToCancel}
        onOpenChange={(open) => !open && setLessonToCancel(null)}
        intent={lessonToCancel?.status === 'scheduled' ? 'warning' : 'danger'}
        icon={lessonToCancel?.status === 'scheduled' ? XCircle : Trash2}
        title={
          lessonToCancel?.status === 'scheduled'
            ? 'Cancel Private Lesson'
            : 'Delete Private Lesson'
        }
        description={
          lessonToCancel?.status === 'scheduled'
            ? `Are you sure you want to cancel the private lesson with ${lessonToCancel?.studentName}? This action will mark the lesson as cancelled.`
            : `Are you sure you want to delete this private lesson with ${lessonToCancel?.studentName}? This action cannot be undone.`
        }
        confirmText={
          lessonToCancel?.status === 'scheduled'
            ? 'Cancel Lesson'
            : 'Delete Lesson'
        }
        cancelText="Keep Lesson"
        onConfirm={
          lessonToCancel?.status === 'scheduled'
            ? confirmCancelLesson
            : confirmDeleteLesson
        }
      />

      {/* Complete Confirmation Dialog */}
      <ConfirmDialog
        open={!!lessonToComplete}
        onOpenChange={(open) => !open && setLessonToComplete(null)}
        intent="success"
        icon={CheckCircle}
        title="Complete Private Lesson"
        description={`Are you sure you want to mark the private lesson with ${lessonToComplete?.studentName} as completed? This action will finalize the lesson.`}
        confirmText="Mark as Complete"
        cancelText="Cancel"
        onConfirm={confirmCompleteLesson}
      />
    </div>
  );
};

export default PrivateLessonsManagementPage;


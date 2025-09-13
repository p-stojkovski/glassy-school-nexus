import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import GlassCard from '@/components/common/GlassCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StandardConfirmDialog from '@/components/common/StandardConfirmDialog';
import { DemoManager } from '@/data/components/DemoManager';
import { usePrivateLessonsManagement } from '../hooks/usePrivateLessonsManagement';
import {
  PrivateLesson,
  PaymentObligation,
  PaymentRecord,
} from '../privateLessonsSlice';
import {
  PrivateLessonStatus,
  ObligationStatus,
  PaymentMethod,
} from '@/types/enums';
import PaymentRecordForm from './PaymentRecordForm';
import PaymentObligationForm from './PaymentObligationForm';

const PrivateLessonDetailPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const {
    allLessons,
    calculatePaymentStatus,
    handleCompleteLesson,
    handleDeleteLesson,
    confirmCompleteLesson,
    confirmDeleteLesson,
    lessonToComplete,
    setLessonToComplete,
    lessonToCancel,
    setLessonToCancel,
  } = usePrivateLessonsManagement();

  // Find the lesson
  const lesson = allLessons.find((l) => l.id === lessonId);

  // Navigate back to list if lesson is completed or cancelled from this page
  useEffect(() => {
    if (
      lesson &&
      (lesson.status === PrivateLessonStatus.Completed ||
        lesson.status === PrivateLessonStatus.Cancelled)
    ) {
      // Small delay to allow user to see the status change
      const timeout = setTimeout(() => {
        navigate('/private-lessons');
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [lesson, navigate]);

  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [isObligationFormOpen, setIsObligationFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedPaymentRecord, setSelectedPaymentRecord] =
    useState<PaymentRecord | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentRecord | null>(
    null
  );

  if (!lesson) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Lesson Not Found
          </h2>
          <p className="text-white/70 mb-6">
            The requested private lesson could not be found.
          </p>
          <Button
            onClick={() => navigate('/private-lessons')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Private Lessons
          </Button>
        </div>
      </div>
    );
  }

  // Ensure lesson has payment records array (for backward compatibility)
  const safeLesson = {
    ...lesson,
    paymentRecords: lesson.paymentRecords || [],
  };

  const paymentStatus = calculatePaymentStatus(safeLesson);

  const handleBack = () => {
    navigate('/private-lessons');
  };

  const handleEditPaymentRecord = (payment: PaymentRecord) => {
    setSelectedPaymentRecord(payment);
    setIsPaymentFormOpen(true);
  };

  const handleDeletePaymentRecord = (payment: PaymentRecord) => {
    setPaymentToDelete(payment);
  };

  const confirmDeletePayment = () => {
    if (paymentToDelete) {
      // TODO: Implement delete payment record
      console.log('Delete payment:', paymentToDelete.id);
      setPaymentToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getStatusColor = (status: PrivateLessonStatus): string => {
    switch (status) {
      case PrivateLessonStatus.Scheduled:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case PrivateLessonStatus.Completed:
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case PrivateLessonStatus.Cancelled:
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'overdue':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'partial':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <DemoManager
        showFullControls={true}
        title="Private Lesson Details Demo"
        description="View detailed lesson information and manage payments. All data is stored locally and persists between sessions."
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Private Lessons
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {safeLesson.subject}
            </h1>
            <p className="text-white/70">
              {safeLesson.studentName} • {formatDate(safeLesson.date)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Action Buttons */}
          {safeLesson.status === PrivateLessonStatus.Scheduled && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCompleteLesson(safeLesson)}
                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
              >
                Complete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteLesson(safeLesson)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                Cancel
              </Button>
            </>
          )}

          {/* Status Badge */}
          <Badge
            className={`${getStatusColor(safeLesson.status)} border font-medium text-sm px-3 py-1`}
          >
            {safeLesson.status.charAt(0).toUpperCase() +
              safeLesson.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white/10"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="data-[state=active]:bg-white/10"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Lesson Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/70">Student</label>
                  <p className="text-white font-medium">
                    {safeLesson.studentName}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-white/70">Teacher</label>
                  <p className="text-white font-medium">
                    {safeLesson.teacherName}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-white/70">Subject</label>
                  <p className="text-white font-medium">{safeLesson.subject}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/70">Date</label>
                  <p className="text-white font-medium">
                    {formatDate(safeLesson.date)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-white/70">Time</label>
                  <p className="text-white font-medium">
                    {formatTime(safeLesson.startTime)} -{' '}
                    {formatTime(safeLesson.endTime)}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-white/70">Classroom</label>
                  <p className="text-white font-medium">
                    {safeLesson.classroomName}
                  </p>
                </div>
              </div>
            </div>
            {safeLesson.notes && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <label className="text-sm text-white/70">Notes</label>
                <p className="text-white mt-1">{safeLesson.notes}</p>
              </div>
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          {/* Payment Summary */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                Payment Summary
              </h3>
              {!safeLesson.paymentObligation && (
                <Button
                  onClick={() => setIsObligationFormOpen(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Set Payment Obligation
                </Button>
              )}
            </div>

            {safeLesson.paymentObligation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge
                      className={getPaymentStatusColor(paymentStatus.status)}
                    >
                      {paymentStatus.status === ObligationStatus.Paid && 'Paid'}
                      {paymentStatus.status === ObligationStatus.Pending &&
                        'Pending'}
                      {paymentStatus.status === ObligationStatus.Overdue &&
                        'Overdue'}
                      {paymentStatus.status === ObligationStatus.Partial &&
                        'Partial'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsObligationFormOpen(true)}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-white/70">
                      Total Amount
                    </label>
                    <p className="text-white font-medium text-lg">
                      ${paymentStatus.obligationAmount}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Amount Paid</label>
                    <p className="text-green-400 font-medium text-lg">
                      ${paymentStatus.totalPaid}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Balance Due</label>
                    <p
                      className={`font-medium text-lg ${paymentStatus.balance > 0 ? 'text-red-400' : 'text-green-400'}`}
                    >
                      ${paymentStatus.balance}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70">Due Date</label>
                    <p className="text-white font-medium">
                      {formatDate(safeLesson.paymentObligation.dueDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">Created</label>
                    <p className="text-white font-medium">
                      {formatDate(safeLesson.paymentObligation.createdAt)}
                    </p>
                  </div>
                </div>

                {safeLesson.paymentObligation.notes && (
                  <div>
                    <label className="text-sm text-white/70">Notes</label>
                    <p className="text-white">
                      {safeLesson.paymentObligation.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-white mb-2">
                  No Payment Obligation Set
                </h4>
                <p className="text-white/60">
                  Set up a payment obligation to track payments for this lesson.
                </p>
              </div>
            )}
          </GlassCard>

          {/* Payment Records */}
          {safeLesson.paymentObligation && (
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">
                  Payment Records
                </h3>
                <Button
                  onClick={() => {
                    setSelectedPaymentRecord(null);
                    setIsPaymentFormOpen(true);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </div>

              {safeLesson.paymentRecords.length > 0 ? (
                <div className="space-y-4">
                  {safeLesson.paymentRecords.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-white font-medium">
                              ${payment.amount}
                            </p>
                            <p className="text-sm text-white/70">
                              {formatDate(payment.paymentDate)} •{' '}
                              {payment.method}
                            </p>
                          </div>
                          {payment.notes && (
                            <div className="flex-1">
                              <p className="text-sm text-white/70">
                                {payment.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPaymentRecord(payment)}
                          className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePaymentRecord(payment)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">
                    No Payments Recorded
                  </h4>
                  <p className="text-white/60">
                    Record payments as they are received for this lesson.
                  </p>
                </div>
              )}
            </GlassCard>
          )}
        </TabsContent>
      </Tabs>

      {/* Payment Obligation Form */}
      <Sheet open={isObligationFormOpen} onOpenChange={setIsObligationFormOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto"
        >
          <SheetHeader className="pb-6 border-b border-white/20">
            <SheetTitle className="text-2xl font-bold text-white">
              {safeLesson.paymentObligation
                ? 'Edit Payment Obligation'
                : 'Set Payment Obligation'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <PaymentObligationForm
              lesson={safeLesson}
              obligation={safeLesson.paymentObligation || undefined}
              onSubmit={() => {
                setIsObligationFormOpen(false);
                // The form will handle the Redux update
              }}
              onCancel={() => setIsObligationFormOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Payment Record Form */}
      <Sheet open={isPaymentFormOpen} onOpenChange={setIsPaymentFormOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto"
        >
          <SheetHeader className="pb-6 border-b border-white/20">
            <SheetTitle className="text-2xl font-bold text-white">
              {selectedPaymentRecord ? 'Edit Payment Record' : 'Record Payment'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <PaymentRecordForm
              lesson={safeLesson}
              paymentRecord={selectedPaymentRecord || undefined}
              onSubmit={() => {
                setIsPaymentFormOpen(false);
                setSelectedPaymentRecord(null);
                // The form will handle the Redux update
              }}
              onCancel={() => {
                setIsPaymentFormOpen(false);
                setSelectedPaymentRecord(null);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Payment Confirmation */}
      <AlertDialog
        open={!!paymentToDelete}
        onOpenChange={() => setPaymentToDelete(null)}
      >
        <AlertDialogContent className="bg-gray-900/95 border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Record</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete this payment record? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePayment}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Confirmation Dialog */}
      <StandardConfirmDialog
        isOpen={!!lessonToComplete}
        onClose={() => setLessonToComplete(null)}
        title="Complete Private Lesson"
        description={`Are you sure you want to mark the private lesson with ${lessonToComplete?.studentName} as completed? This action will finalize the lesson.`}
        confirmText="Mark as Complete"
        cancelText="Cancel"
        variant="default"
        onConfirm={confirmCompleteLesson}
      />

      {/* Cancel/Delete Confirmation Dialog */}
      <StandardConfirmDialog
        isOpen={!!lessonToCancel}
        onClose={() => setLessonToCancel(null)}
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
        variant="danger"
        onConfirm={confirmDeleteLesson}
      />
    </div>
  );
};

export default PrivateLessonDetailPage;


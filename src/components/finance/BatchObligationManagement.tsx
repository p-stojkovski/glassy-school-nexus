import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { PaymentObligation, createObligation } from '@/store/slices/financeSlice';
import RecentObligations from './RecentObligations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import StudentMultiSelection from './StudentMultiSelection';
import ObligationForm from './ObligationForm';
import { Student } from '@/store/slices/studentsSlice';

interface BatchObligationManagementProps {
  onComplete?: () => void;
}

const BatchObligationManagement: React.FC<BatchObligationManagementProps> = ({ onComplete }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const students = useSelector((state: RootState) => state.students.students);  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [obligationData, setObligationData] = useState<Partial<PaymentObligation>>({});
  const [recentlyCreated, setRecentlyCreated] = useState<PaymentObligation[]>([]);
  const [showRecent, setShowRecent] = useState(false);

  const handleStudentSelection = (selected: Student[]) => {
    setSelectedStudents(selected);
  };

  const handleObligationFormSubmit = (data: Omit<PaymentObligation, 'id' | 'studentId' | 'studentName' | 'status' | 'createdAt' | 'updatedAt'>) => {
    setObligationData(data);
    setPreviewMode(true);
  };

  const handleCancel = () => {
    if (previewMode) {
      setPreviewMode(false);
    } else {
      onComplete?.();
    }
  };
  const handleConfirmBatchCreate = () => {
    // Enhanced validation
    if (selectedStudents.length === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student for batch assignment.",
        variant: "destructive",
      });
      return;
    }
    
    if (!obligationData.type) {
      toast({
        title: "Missing information",
        description: "Please select an obligation type.",
        variant: "destructive",
      });
      return;
    }
    
    if (!obligationData.amount || obligationData.amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero.",
        variant: "destructive",
      });
      return;
    }
    
    if (!obligationData.dueDate) {
      toast({
        title: "Missing due date",
        description: "Please select a due date for the obligations.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const now = new Date().toISOString();    try {
      // Track successful and failed creations
      const results = {
        successful: 0,
        failed: 0,
        failedStudents: [] as string[],
        createdObligations: [] as PaymentObligation[]
      };
      
      // Create an obligation for each selected student
      for (const student of selectedStudents) {
        try {
          const newObligation: PaymentObligation = {
            id: uuidv4(),
            studentId: student.id,
            studentName: student.name,
            type: obligationData.type!,
            amount: obligationData.amount!,
            dueDate: obligationData.dueDate!,
            period: obligationData.period!,
            status: 'pending',
            notes: obligationData.notes,
            createdAt: now,
            updatedAt: now,
          };
          
          dispatch(createObligation(newObligation));
          results.successful++;
          results.createdObligations.push(newObligation);
        } catch (studentError) {
          results.failed++;
          results.failedStudents.push(student.name);
          console.error(`Error creating obligation for student ${student.name}:`, studentError);
        }
      }
      
      // Store the created obligations for display
      if (results.createdObligations.length > 0) {
        setRecentlyCreated(results.createdObligations);
        setShowRecent(true);
      }
      
      // Prepare a detailed success or partial success message
      const successDetails = {
        count: results.successful,
        type: obligationData.type!,
        amount: obligationData.amount!.toFixed(2),
        totalAmount: (obligationData.amount! * results.successful).toFixed(2),
        dueDate: format(new Date(obligationData.dueDate!), 'MMM d, yyyy')
      };      if (results.failed > 0) {
        // Partial success
        toast({
          title: "Partial Success",
          description: `Created ${results.successful} obligations, but failed for ${results.failed} student(s).`,
          variant: "warning", // Using our newly added warning variant
        });
      } else {
        // Complete success
        toast({
          title: "Success",
          description: `Created ${successDetails.count} ${successDetails.type} obligations totaling $${successDetails.totalAmount}`,
        });
      }
        // Reset form state but keep recently created for display
      setSelectedStudents([]);
      setObligationData({});
      setPreviewMode(false);
      
      // Don't complete yet, show the recent obligations first
      if (results.createdObligations.length > 0) {
        setShowRecent(true);
      } else {
        onComplete?.();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create obligations. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating batch obligations:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
    const handleCloseRecent = () => {
    setShowRecent(false);
    setRecentlyCreated([]);
    onComplete?.();
  };

  return (
    <div className="space-y-6">
      {showRecent ? (
        <>
          <RecentObligations 
            obligations={recentlyCreated} 
            title="Successfully Created Obligations" 
          />          <div className="flex justify-end">
            <Button 
              onClick={handleCloseRecent}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-md"
            >
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              Continue
            </Button>
          </div>
        </>
      ) : !previewMode ? (
        <>
          <Card className="bg-white/20 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle className="text-white">Student Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentMultiSelection
                students={students}
                selectedStudents={selectedStudents}
                onChange={handleStudentSelection}
              />
              
              {selectedStudents.length > 0 && (
                <div className="mt-4 p-3 bg-white/10 rounded-md text-white">
                  <p>
                    <span className="font-medium">{selectedStudents.length}</span> students selected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {selectedStudents.length > 0 && (
            <Card className="bg-white/20 backdrop-blur-sm border-white/30">
              <CardHeader>
                <CardTitle className="text-white">
                  Define Obligation Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ObligationForm 
                  batchMode={true}
                  onCancel={handleCancel}
                  onSubmitBatch={handleObligationFormSubmit}
                />
                
                {/* Add batch information summary */}
                {obligationData.amount && (
                  <div className="mt-4 p-3 bg-blue-900/30 rounded-md">
                    <div className="text-white">
                      <h4 className="text-sm font-semibold mb-1">Batch Summary</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Students:</div>
                        <div className="font-medium">{selectedStudents.length}</div>
                        
                        <div>Per student:</div>
                        <div className="font-medium">${obligationData.amount.toFixed(2)}</div>
                        
                        <div>Total batch amount:</div>
                        <div className="font-medium">${(obligationData.amount * selectedStudents.length).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>      ) : (
        <Card className="bg-white/20 backdrop-blur-sm border-white/30">
          <CardHeader>
            <CardTitle className="text-white">Confirm Batch Creation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-md">
                <h3 className="text-lg font-medium text-white mb-2">Summary</h3>
                
                <div className="space-y-2 text-white">
                  <p><span className="font-medium">Students:</span> {selectedStudents.length}</p>
                  <p><span className="font-medium">Obligation Type:</span> {obligationData.type}</p>
                  <p><span className="font-medium">Amount:</span> ${obligationData.amount?.toFixed(2)}</p>
                  <p><span className="font-medium">Due Date:</span> {obligationData.dueDate ? format(new Date(obligationData.dueDate), 'MMMM d, yyyy') : 'Not set'}</p>
                  <p><span className="font-medium">Period:</span> {obligationData.period}</p>
                  {obligationData.notes && (
                    <p><span className="font-medium">Notes:</span> {obligationData.notes}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-900/30 text-blue-100 p-4 rounded-md">
                <p>You are about to create {selectedStudents.length} payment obligation(s). This action cannot be easily undone and will need to be reversed manually if incorrect.</p>
              </div>
                <div className="flex justify-end space-x-3">                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  className="bg-white/50 backdrop-blur-sm border-white text-white font-medium hover:bg-white/60 shadow-sm"
                  disabled={isSubmitting}
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  Back
                </Button>                <Button 
                  onClick={handleConfirmBatchCreate}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      Confirm Creation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>        </Card>
      )}
    </div>
  );
};

export default BatchObligationManagement;

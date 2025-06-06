import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { 
  selectAllObligations, 
  selectSelectedPeriod, 
  selectSelectedStudentId, 
  setSelectedPeriod, 
  setSelectedStudent 
} from '@/store/slices/financeSlice';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ObligationTable from './ObligationTable';
import ObligationForm from './ObligationForm';
import BatchObligationManagement from './BatchObligationManagement';


const ObligationManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const obligations = useSelector(selectAllObligations);
  const selectedPeriod = useSelector(selectSelectedPeriod);
  const selectedStudentId = useSelector(selectSelectedStudentId);
  const [editingObligationId, setEditingObligationId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('view');

  const handleEditObligation = (id: string) => {
    setEditingObligationId(id);
    setCurrentTab('add');
  };

  const handleCancelEdit = () => {
    setEditingObligationId(null);
  };

  return (
    <Card className="p-6 bg-white/20 backdrop-blur-sm border-white/30">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/30">
          <TabsTrigger value="view" className="text-white">View Obligations</TabsTrigger>
          <TabsTrigger value="add" className="text-white">Add Individual</TabsTrigger>
          <TabsTrigger value="batch" className="text-white">Batch Assign</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          <ObligationTable
            onEdit={handleEditObligation}
          />
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <ObligationForm 
            editingId={editingObligationId} 
            onCancel={handleCancelEdit} 
          />
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <BatchObligationManagement 
            onComplete={() => setCurrentTab('view')}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ObligationManagement;

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


const ObligationManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const obligations = useSelector(selectAllObligations);
  const selectedPeriod = useSelector(selectSelectedPeriod);
  const selectedStudentId = useSelector(selectSelectedStudentId);
  const [editingObligationId, setEditingObligationId] = useState<string | null>(null);

  const handleEditObligation = (id: string) => {
    setEditingObligationId(id);
  };

  const handleCancelEdit = () => {
    setEditingObligationId(null);
  };
  return (
    <Card className="p-6 bg-white/20 backdrop-blur-sm border-white/30">
      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/30">
          <TabsTrigger value="view">View Obligations</TabsTrigger>
          <TabsTrigger value="add">Add New Obligation</TabsTrigger>
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
      </Tabs>
    </Card>
  );
};

export default ObligationManagement;

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ObligationTable from './ObligationTable';
import ObligationForm from './ObligationForm';
import BatchObligationForm from './BatchObligationForm';

const ObligationManagement: React.FC = () => {
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
    <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">        <TabsList className="flex w-full mb-6 bg-white/20 gap-2">
          <TabsTrigger value="view" className="flex-1 text-white">View Obligations</TabsTrigger>
          <TabsTrigger value="add" className="flex-1 text-white">Add Individual</TabsTrigger>
          <TabsTrigger value="batch" className="flex-1 text-white">Add Batch</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          <ObligationTable
            onEdit={handleEditObligation}
          />
        </TabsContent>        <TabsContent value="add" className="space-y-4">
          <ObligationForm 
            editingId={editingObligationId} 
            onCancel={handleCancelEdit} 
          />
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <BatchObligationForm 
            onCancel={() => setCurrentTab('view')} 
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ObligationManagement;

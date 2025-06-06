import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaymentHistory from './PaymentHistory';
import PaymentForm from './PaymentForm';


const PaymentManagement: React.FC = () => {
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);

  const handleEditPayment = (id: string) => {
    setEditingPaymentId(id);
  };

  const handleCancelEdit = () => {
    setEditingPaymentId(null);
  };  return (    <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
      <Tabs defaultValue="view" className="w-full">        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/20">
          <TabsTrigger value="view" className="text-white font-medium">Payment History</TabsTrigger>
          <TabsTrigger value="add" className="text-white font-medium">Record Payment</TabsTrigger>
        </TabsList>
  
        <TabsContent value="view" className="space-y-4">
          <PaymentHistory onEdit={handleEditPayment} />
        </TabsContent>
  
        <TabsContent value="add" className="space-y-4">
          <PaymentForm 
            editingId={editingPaymentId} 
            onCancel={handleCancelEdit} 
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default PaymentManagement;

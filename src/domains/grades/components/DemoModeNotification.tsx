import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DemoModeNotification: React.FC = () => {
  return (
    <Alert className="bg-blue-900/30 text-blue-100 border-blue-700 mb-6">
      <AlertTriangle className="h-4 w-4 mr-2" />
      <AlertDescription>
        <strong>Demo Mode:</strong> Grades and assessments are stored locally in your browser and not permanent.
      </AlertDescription>
    </Alert>
  );
};

export default DemoModeNotification;

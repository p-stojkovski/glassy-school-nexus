import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

const DemoModeNotification: React.FC = () => {
  return (
    <Alert className="bg-blue-900/30 text-blue-100 border-blue-700 mb-6">
      <AlertTriangle className="h-4 w-4 mr-2" />
      <AlertDescription>
        Demo Mode: Attendance data is stored locally in your browser. No backend available yet.
      </AlertDescription>
    </Alert>
  );
};

export default DemoModeNotification;

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface DemoModeNotificationProps {
  onResetDemo: () => void;
}

const DemoModeNotification: React.FC<DemoModeNotificationProps> = ({
  onResetDemo,
}) => {
  return (
    <Alert className="bg-blue-900/30 text-blue-100 border-blue-700 mb-6">
      <AlertTriangle className="h-4 w-4 mr-2" />
      <AlertDescription className="flex items-center justify-between w-full">
        <span>
          <strong>Demo Mode:</strong> This is a demo of the Classroom Management
          System. All data is saved locally in your browser and will persist
          between sessions. No data is sent to any server.
        </span>
        <Button
          size="sm"
          variant="outline"
          className="ml-4 border-blue-700 bg-blue-800/30 hover:bg-blue-700/50 text-blue-100"
          onClick={onResetDemo}
        >
          Reset Demo Data
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default DemoModeNotification;

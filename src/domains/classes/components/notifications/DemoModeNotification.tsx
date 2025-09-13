import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface DemoModeNotificationProps {
  onResetDemo?: () => void;
}

const DemoModeNotification: React.FC<DemoModeNotificationProps> = ({
  onResetDemo,
}) => {
  return (
    <Alert className="bg-blue-900/30 text-blue-100 border-blue-700 mb-6">
      <AlertTriangle className="h-4 w-4 mr-2" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          <strong>Demo Mode:</strong> This is a demo of the Classes Management
          System. All data is saved locally in your browser and will persist
          between sessions. No data is sent to any server.
        </span>
        {onResetDemo && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetDemo}
            className="ml-4 bg-blue-800/50 border-blue-600 text-blue-100 hover:bg-blue-700/50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Demo Data
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default DemoModeNotification;


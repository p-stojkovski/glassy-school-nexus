import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface StandardDemoNoticeProps {
  title?: string;
  message?: string;
  onResetDemo?: () => void;
  resetButtonText?: string;
  className?: string;
  showResetButton?: boolean;
}

const StandardDemoNotice: React.FC<StandardDemoNoticeProps> = ({
  title = 'Demo Mode',
  message = 'This is a demo version. All data is saved locally in your browser and will persist between sessions. No data is sent to any server.',
  onResetDemo,
  resetButtonText = 'Reset Demo Data',
  className = '',
  showResetButton = true,
}) => {
  return (
    <Alert
      className={`bg-blue-500/10 border-blue-400/30 text-blue-300 backdrop-blur-sm ${className}`}
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <span className="text-blue-300">
          <strong>{title}:</strong> {message}
        </span>
        {showResetButton && onResetDemo && (
          <Button
            size="sm"
            variant="outline"
            onClick={onResetDemo}
            className="ml-4 bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/50 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {resetButtonText}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default StandardDemoNotice;

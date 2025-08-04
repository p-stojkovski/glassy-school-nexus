import React from 'react';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DemoNoticeProps {
  message?: string;
  className?: string;
}

const DemoNotice: React.FC<DemoNoticeProps> = ({
  message = 'You are viewing demo data. Changes will be lost when the page is refreshed.',
  className = '',
}) => {
  return (
    <Alert
      className={`bg-blue-500/10 border-blue-500/30 text-blue-300 ${className}`}
    >
      <Info className="h-4 w-4" />
      <AlertDescription className="text-blue-300">{message}</AlertDescription>
    </Alert>
  );
};

export default DemoNotice;

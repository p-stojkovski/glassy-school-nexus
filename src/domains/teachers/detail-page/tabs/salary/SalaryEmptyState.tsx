import { Wallet, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SalaryEmptyStateProps {
  onSetupClick: () => void;
  yearName?: string;
}

export default function SalaryEmptyState({ onSetupClick, yearName }: SalaryEmptyStateProps) {
  const title = yearName ? `No Salary for ${yearName}` : 'No Salary Configuration';
  const description = yearName
    ? `This teacher doesn't have a salary configured for ${yearName}. Set up a monthly gross salary to start tracking salary breakdowns and contributions for this academic year.`
    : "This teacher doesn't have a salary configured yet. Set up a monthly gross salary to start tracking salary breakdowns and contributions.";
  const buttonText = yearName ? `Set Up Salary for ${yearName}` : 'Set Up Salary';

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/20 rounded-full mb-6">
        <Wallet className="h-12 w-12 text-white/40" />
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">
        {title}
      </h3>

      <p className="text-white/60 text-center max-w-md mb-8">
        {description}
      </p>

      <Button
        onClick={onSetupClick}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6"
      >
        <Settings className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    </div>
  );
}

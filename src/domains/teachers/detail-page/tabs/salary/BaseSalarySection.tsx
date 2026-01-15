import { useState } from 'react';
import { Calendar, History, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency } from '@/utils/formatters';
import { BaseSalaryHistoryDialog } from './BaseSalaryHistoryDialog';

interface BaseSalarySectionProps {
  teacherId: string;
  academicYearId: string;
  onSuccess?: () => void;
}

export function BaseSalarySection({ teacherId, academicYearId }: BaseSalarySectionProps) {
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  const baseSalary = useAppSelector((state) => state.teachers.baseSalary);
  const loading = useAppSelector((state) => state.teachers.loading.fetchingBaseSalary);

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-white/60" />
          <span className="ml-3 text-white/60">Loading base salary...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-yellow-400" />
            Base Net Salary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!baseSalary ? (
            <div className="text-center py-6">
              <p className="text-white/60">
                No base salary configured for this academic year.
              </p>
              <p className="text-sm text-white/40 mt-2">
                Use the Employment Settings menu to set a base salary.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/60 mb-1">Current Amount</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(baseSalary.baseNetSalary)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">Effective From</p>
                  <p className="text-sm text-white">
                    {new Date(baseSalary.effectiveFrom).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {baseSalary.changeReason && (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-white/60 mb-1">Reason for Change</p>
                  <p className="text-sm text-white/80">{baseSalary.changeReason}</p>
                </div>
              )}

              <div className="pt-3">
                <Button
                  variant="outline"
                  onClick={() => setShowHistoryDialog(true)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <History className="h-4 w-4 mr-2" />
                  View History
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* History Dialog */}
      <BaseSalaryHistoryDialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
        teacherId={teacherId}
        academicYearId={academicYearId}
      />
    </>
  );
}

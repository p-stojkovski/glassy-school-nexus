import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectTotalOutstandingBalance } from '@/domains/finance/financeSlice';
import { Calculator, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FinancialHeader: React.FC = () => {
  const totalOutstanding = useAppSelector(selectTotalOutstandingBalance);
  const handleExportData = () => {
    try {
      const store = window.localStorage;
      const obligations = JSON.parse(
        store.getItem('paymentObligations') || '[]'
      );
      const payments = JSON.parse(store.getItem('payments') || '[]');

      // Function to convert object array to CSV
      const convertToCSV = (objArray: Record<string, unknown>[]) => {
        if (objArray.length === 0) return '';

        const headers = Object.keys(objArray[0]);
        const headerString = headers.join(',');

        const rowStrings = objArray.map((obj) =>
          headers
            .map((header) => {
              let value = obj[header] ?? '';
              // Handle values with commas by wrapping in quotes
              if (typeof value === 'string' && value.includes(',')) {
                value = `"${value}"`;
              }
              return value;
            })
            .join(',')
        );

        return [headerString, ...rowStrings].join('\n');
      };

      // Create Blobs for each data set
      const obligationsCSV = convertToCSV(obligations);
      const paymentsCSV = convertToCSV(payments);

      // Create downloadable files
      const createDownload = (csv: string, filename: string) => {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      createDownload(obligationsCSV, 'payment_obligations.csv');
      createDownload(paymentsCSV, 'payments.csv');

      // Show success message
      alert(
        'Files downloaded successfully:\n- payment_obligations.csv\n- payments.csv'
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div className="text-white">
        <h1 className="text-3xl font-bold tracking-tight">
          Financial Management
        </h1>
        <p className="text-white/70">
          Manage payment obligations and track student payments
        </p>
      </div>{' '}
      <Card className="w-full md:w-auto bg-white/20 backdrop-blur-sm border-white/30">
        <CardContent className="flex items-center p-4">
          <div className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-white" />
            <div className="text-white">
              <p className="text-sm font-medium leading-none">
                Total Outstanding
              </p>
              <p className="text-2xl font-bold">
                ${totalOutstanding.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialHeader;

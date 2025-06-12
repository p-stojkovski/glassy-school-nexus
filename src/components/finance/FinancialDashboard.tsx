import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { 
  selectAllObligations, 
  selectAllPayments,
  selectTotalOutstandingBalance 
} from '@/store/slices/financeSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { format, parseISO } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const FinancialDashboard: React.FC = () => {
  const obligations = useAppSelector(selectAllObligations);
  const payments = useAppSelector(selectAllPayments);
  const totalOutstanding = useAppSelector(selectTotalOutstandingBalance);

  // Calculate total amount of obligations and payments
  const totalObligations = obligations.reduce((sum, obligation) => sum + obligation.amount, 0);
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const paymentPercentage = totalObligations > 0 
    ? Math.round((totalPayments / totalObligations) * 100)
    : 0;

  // Group obligations by status
  const obligationsByStatus = obligations.reduce((acc, obligation) => {
    if (!acc[obligation.status]) {
      acc[obligation.status] = { count: 0, amount: 0 };
    }
    acc[obligation.status].count += 1;
    acc[obligation.status].amount += obligation.amount;
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);
  const statusData = [
    { name: 'Paid', value: obligationsByStatus.paid?.amount || 0, count: obligationsByStatus.paid?.count || 0, color: '#10B981' },
    { name: 'Partial', value: obligationsByStatus.partial?.amount || 0, count: obligationsByStatus.partial?.count || 0, color: '#3B82F6' },
    { name: 'Pending', value: obligationsByStatus.pending?.amount || 0, count: obligationsByStatus.pending?.count || 0, color: '#D97706' },
    { name: 'Overdue', value: obligationsByStatus.overdue?.amount || 0, count: obligationsByStatus.overdue?.count || 0, color: '#EF4444' }
  ];

  // Group payments by month for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  
  const paymentsByMonth = payments
    .filter(payment => {
      const paymentDate = parseISO(payment.date);
      return paymentDate >= sixMonthsAgo;
    })
    .reduce((acc, payment) => {
      const month = format(parseISO(payment.date), 'MMM yyyy');
      
      if (!acc[month]) {
        acc[month] = 0;
      }
      
      acc[month] += payment.amount;
      return acc;
    }, {} as Record<string, number>);
  
  // Create an array of all months in the past 6 months
  const months = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.unshift(format(date, 'MMM yyyy'));
  }
  
  // Create chart data with all months (even if no payments)
  const monthlyPaymentData = months.map(month => ({
    month,
    amount: paymentsByMonth[month] || 0
  }));

  // Recent payments (last 5)
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Upcoming obligations (next 5 due dates)
  const today = new Date().toISOString().split('T')[0];
  const upcomingObligations = obligations
    .filter(obligation => obligation.status !== 'paid' && obligation.dueDate >= today)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">      {/* Summary Cards */}      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">        <Card className="bg-white/5 backdrop-blur-sm border-white/15">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Obligations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${totalObligations.toFixed(2)}</div>
            <p className="text-xs text-white/70">Across {obligations.length} obligations</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-sm border-white/15">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${totalPayments.toFixed(2)}</div>
            <p className="text-xs text-white/70">Across {payments.length} payments</p>
          </CardContent>
        </Card>        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Outstanding Balance</CardTitle>
          </CardHeader><CardContent>
            <div className="text-2xl font-bold text-white">${totalOutstanding.toFixed(2)}</div>
            <Progress value={paymentPercentage} className="mt-2 bg-white/30 [&>div]:bg-cyan-400" />
            <p className="text-xs text-white/70 mt-2">{paymentPercentage}% collected</p>
          </CardContent>
        </Card>        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Overdue Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-300">
              ${(obligationsByStatus.overdue?.amount || 0).toFixed(2)}
            </div>
            <p className="text-xs text-white/70">
              {obligationsByStatus.overdue?.count || 0} overdue obligations
            </p>
          </CardContent>
        </Card>
      </div>      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">        <Card className="col-span-1 bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => {
                      // Only display label if percent is greater than 1%
                      if (percent < 0.01) return '';
                      return `${name}: ${Math.round(percent * 100)}%`;
                    }}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px' }}
                  />
                  <Legend formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>        </Card>        <Card className="col-span-1 bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Monthly Payments (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart
                  data={monthlyPaymentData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="month" stroke="#ffffff" />
                  <YAxis stroke="#ffffff" />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toFixed(2)}`} 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px' }}
                  />
                  <Legend formatter={(value) => <span style={{ color: '#fff' }}>{value}</span>} />
                  <Bar dataKey="amount" name="Payment Amount" fill="#38bdf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>      {/* Recent Transactions and Upcoming Due */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">        <Card className="col-span-1 bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.length === 0 ? (
                <p className="text-center text-white/70 py-4">No recent payments</p>
              ) : (
                recentPayments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center border-b border-white/20 pb-2">
                    <div>
                      <p className="font-medium text-white">{payment.studentName}</p>
                      <p className="text-sm text-white/70">
                        {format(parseISO(payment.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-white/70">{payment.method}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>        </Card>        <Card className="col-span-1 bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Upcoming Due Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingObligations.length === 0 ? (
                <p className="text-center text-white/70 py-4">No upcoming obligations</p>
              ) : (
                upcomingObligations.map((obligation) => (
                  <div key={obligation.id} className="flex justify-between items-center border-b border-white/20 pb-2">
                    <div>
                      <p className="font-medium text-white">{obligation.studentName}</p>
                      <p className="text-sm text-white/70">{obligation.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">${obligation.amount.toFixed(2)}</p>
                      <p className="text-sm text-white/70">
                        Due: {format(parseISO(obligation.dueDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialDashboard;

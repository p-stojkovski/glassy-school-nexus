import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  Building,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  BookOpen,
  UserCheck,
  UserX,
  Timer,
  Plus,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  BookOpen as PrivateLessonIcon,
  Activity,
  Target,
  Zap,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  format,
  isToday,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import GlassCard from '../components/common/GlassCard';
import StandardDemoNotice from '../components/common/StandardDemoNotice';
import { Button } from '../components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AttendanceStatus,
  PrivateLessonStatus,
  ObligationStatus,
} from '@/types/enums';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Redux selectors
  const students = useSelector((state: RootState) => state.students.students);
  const teachers = useSelector((state: RootState) => state.teachers.teachers);
  const classes = useSelector((state: RootState) => state.classes.classes);
  const classrooms = useSelector(
    (state: RootState) => state.classrooms.classrooms
  );
  const attendanceRecords = useSelector(
    (state: RootState) => state.attendance.attendanceRecords
  );
  const payments = useSelector((state: RootState) => state.finance.payments);
  const obligations = useSelector(
    (state: RootState) => state.finance.obligations
  );
  const privateLessons = useSelector(
    (state: RootState) => state.privateLessons.lessons
  );

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Calculate today's and this week's data
  const dashboardData = useMemo(() => {
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday

    // Classes data
    const todayClasses = classes.filter((cls) =>
      cls.schedule.some((sch) => sch.day === format(today, 'EEEE'))
    );

    const weeklyClasses = classes.filter((cls) =>
      cls.schedule.some((sch) => {
        const daysOfWeek = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        const dayIndex = daysOfWeek.indexOf(sch.day);
        if (dayIndex === -1) return false;
        const classDate = new Date(weekStart);
        classDate.setDate(weekStart.getDate() + dayIndex);
        return isWithinInterval(classDate, { start: weekStart, end: weekEnd });
      })
    );

    // Attendance data for today
    const todayAttendance = attendanceRecords.filter(
      (record) => record.sessionDate === todayString
    );
    let totalPresent = 0,
      totalAbsent = 0,
      totalLate = 0,
      totalStudentsToday = 0;

    todayAttendance.forEach((record) => {
      record.studentRecords.forEach((student) => {
        totalStudentsToday++;
        if (student.status === AttendanceStatus.Present) totalPresent++;
        else if (student.status === AttendanceStatus.Absent) totalAbsent++;
        else if (student.status === AttendanceStatus.Late) totalLate++;
      });
    });

    // Financial data for current month
    const currentMonth = format(today, 'yyyy-MM');
    const monthlyPayments = payments.filter((payment) =>
      payment.date.startsWith(currentMonth)
    );
    const monthlyRevenue = monthlyPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const outstandingObligations = obligations.filter(
      (obligation) =>
        obligation.status === ObligationStatus.Pending ||
        obligation.status === ObligationStatus.Overdue
    );
    const totalOutstanding = outstandingObligations.reduce(
      (sum, obligation) => sum + obligation.amount,
      0
    );

    // Private lessons data
    const todayPrivateLessons = privateLessons.filter(
      (lesson) => lesson.date === todayString
    );
    const weeklyPrivateLessons = privateLessons.filter((lesson) => {
      const lessonDate = parseISO(lesson.date);
      return isWithinInterval(lessonDate, { start: weekStart, end: weekEnd });
    });

    const privateLessonPaymentStatus = privateLessons.reduce(
      (acc, lesson) => {
        if (lesson.paymentObligation) {
          if (lesson.paymentObligation.status === ObligationStatus.Paid)
            acc.paid++;
          else if (lesson.paymentObligation.status === ObligationStatus.Pending)
            acc.pending++;
          else if (lesson.paymentObligation.status === ObligationStatus.Overdue)
            acc.overdue++;
        }
        return acc;
      },
      { paid: 0, pending: 0, overdue: 0 }
    );

    return {
      students: {
        total: students.length,
        active: students.filter((s) => s.status === 'active').length,
      },
      teachers: {
        total: teachers.length,
        active: teachers.length, // All teachers are considered active since there's no status field
      },
      classes: {
        total: classes.length,
        today: todayClasses.length,
        thisWeek: weeklyClasses.length,
      },
      classrooms: {
        total: classrooms.length,
        available: classrooms.length, // All classrooms are considered available since there's no status field
      },
      attendance: {
        today: {
          total: totalStudentsToday,
          present: totalPresent,
          absent: totalAbsent,
          late: totalLate,
          presentPercentage:
            totalStudentsToday > 0
              ? Math.round((totalPresent / totalStudentsToday) * 100)
              : 0,
          absentPercentage:
            totalStudentsToday > 0
              ? Math.round((totalAbsent / totalStudentsToday) * 100)
              : 0,
          latePercentage:
            totalStudentsToday > 0
              ? Math.round((totalLate / totalStudentsToday) * 100)
              : 0,
        },
      },
      finance: {
        monthlyRevenue,
        totalOutstanding,
        paidObligations: obligations.filter(
          (o) => o.status === ObligationStatus.Paid
        ).length,
        pendingObligations: obligations.filter(
          (o) => o.status === ObligationStatus.Pending
        ).length,
        overdueObligations: obligations.filter(
          (o) => o.status === ObligationStatus.Overdue
        ).length,
      },
      privateLessons: {
        today: todayPrivateLessons.length,
        thisWeek: weeklyPrivateLessons.length,
        paymentStatus: privateLessonPaymentStatus,
      },
    };
  }, [
    students,
    teachers,
    classes,
    classrooms,
    attendanceRecords,
    payments,
    obligations,
    privateLessons,
  ]);

  // Quick actions
  const quickActions = [
    {
      label: 'Mark Attendance',
      icon: UserCheck,
      onClick: () => navigate('/attendance'),
      color: 'bg-green-500/20 hover:bg-green-500/30 text-green-300',
    },
    {
      label: 'Record Payment',
      icon: CreditCard,
      onClick: () => navigate('/finance'),
      color: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300',
    },
    {
      label: 'Add Student',
      icon: Plus,
      onClick: () => navigate('/students'),
      color: 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300',
    },
    {
      label: 'Schedule Class',
      icon: Calendar,
      onClick: () => navigate('/classes'),
      color: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Notice */}
      <StandardDemoNotice
        title="Admin Dashboard Demo"
        message="All data is stored locally and persists between sessions. This dashboard provides real-time insights from your demo data."
      />

      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-white/70">
            Welcome back! Here's what's happening at your school today.
          </p>
        </div>

        {/* Search Field */}
        <div className="w-full sm:w-96">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <Input
              placeholder="Search students, classes, teachers..."
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
            />
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Students Metric */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">
                Total Students
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {dashboardData.students.total}
              </p>
              <div className="flex items-center mt-2">
                <Activity className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm font-medium">
                  {dashboardData.students.active} Active
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </GlassCard>

        {/* Teachers Metric */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">
                Active Teachers
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {dashboardData.teachers.active}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm font-medium">
                  All Active
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-500/20">
              <GraduationCap className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </GlassCard>

        {/* Classes Today */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">Classes Today</p>
              <p className="text-2xl font-bold text-white mt-1">
                {dashboardData.classes.today}
              </p>
              <div className="flex items-center mt-2">
                <Calendar className="w-4 h-4 text-blue-400 mr-1" />
                <span className="text-blue-400 text-sm font-medium">
                  {dashboardData.classes.thisWeek} This Week
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20">
              <BookOpen className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </GlassCard>

        {/* Monthly Revenue */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">
                Monthly Revenue
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                ${dashboardData.finance.monthlyRevenue.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-yellow-400 text-sm font-medium">
                  ${dashboardData.finance.totalOutstanding.toLocaleString()}{' '}
                  Outstanding
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/20">
              <DollarSign className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Attendance & Financial Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Attendance Widget */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Today's Attendance
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/attendance')}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              View Details
            </Button>
          </div>

          {dashboardData.attendance.today.total > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-lg bg-green-500/20">
                    <UserCheck className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {dashboardData.attendance.today.present}
                  </p>
                  <p className="text-green-400 text-sm">
                    Present ({dashboardData.attendance.today.presentPercentage}
                    %)
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-lg bg-red-500/20">
                    <UserX className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {dashboardData.attendance.today.absent}
                  </p>
                  <p className="text-red-400 text-sm">
                    Absent ({dashboardData.attendance.today.absentPercentage}%)
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-lg bg-yellow-500/20">
                    <Timer className="w-6 h-6 text-yellow-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {dashboardData.attendance.today.late}
                  </p>
                  <p className="text-yellow-400 text-sm">
                    Late ({dashboardData.attendance.today.latePercentage}%)
                  </p>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/70 text-sm">
                  Total students tracked today:{' '}
                  <span className="text-white font-medium">
                    {dashboardData.attendance.today.total}
                  </span>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <UserCheck className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">
                No Attendance Recorded
              </h4>
              <p className="text-white/60 mb-4">
                Start marking attendance for today's classes.
              </p>
              <Button
                onClick={() => navigate('/attendance')}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              >
                Mark Attendance
              </Button>
            </div>
          )}
        </GlassCard>

        {/* Financial Summary Widget */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Financial Summary
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/finance')}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              View Details
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Paid Obligations</p>
                  <p className="text-green-400 text-sm">
                    {dashboardData.finance.paidObligations} completed
                  </p>
                </div>
              </div>
              <p className="text-xl font-bold text-green-400">
                ${dashboardData.finance.monthlyRevenue.toLocaleString()}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Pending Payments</p>
                  <p className="text-yellow-400 text-sm">
                    {dashboardData.finance.pendingObligations} awaiting
                  </p>
                </div>
              </div>
              <p className="text-xl font-bold text-yellow-400">
                ${dashboardData.finance.totalOutstanding.toLocaleString()}
              </p>
            </div>

            {dashboardData.finance.overdueObligations > 0 && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Overdue Payments</p>
                    <p className="text-red-400 text-sm">
                      {dashboardData.finance.overdueObligations} overdue
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-red-400">Action Needed</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Private Lessons & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Private Lessons Widget */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Private Lessons
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/private-lessons')}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-white/5">
              <p className="text-2xl font-bold text-white">
                {dashboardData.privateLessons.today}
              </p>
              <p className="text-white/70 text-sm">Today</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/5">
              <p className="text-2xl font-bold text-white">
                {dashboardData.privateLessons.thisWeek}
              </p>
              <p className="text-white/70 text-sm">This Week</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Paid Lessons</span>
              <span className="text-green-400 font-medium">
                {dashboardData.privateLessons.paymentStatus.paid}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Pending Payment</span>
              <span className="text-yellow-400 font-medium">
                {dashboardData.privateLessons.paymentStatus.pending}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Overdue Payment</span>
              <span className="text-red-400 font-medium">
                {dashboardData.privateLessons.paymentStatus.overdue}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions Widget */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            Quick Actions
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`h-auto p-4 flex-col space-y-2 ${action.color} transition-all duration-200`}
                onClick={action.onClick}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center justify-center space-x-2 text-white/60">
              <Zap className="w-4 h-4" />
              <span className="text-sm">Quick access to frequent tasks</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;

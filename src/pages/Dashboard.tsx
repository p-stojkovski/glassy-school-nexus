import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Building,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  BookOpen,
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
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

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  const statsData = [
    {
      title: 'Total Students',
      value: '342',
      icon: Users,
      change: '+12%',
      color: 'bg-blue-500',
    },
    {
      title: 'Active Teachers',
      value: '28',
      icon: GraduationCap,
      change: '+3%',
      color: 'bg-green-500',
    },
    {
      title: 'Classrooms',
      value: '15',
      icon: Building,
      change: '0%',
      color: 'bg-purple-500',
    },
    {
      title: 'Monthly Revenue',
      value: '$24,580',
      icon: DollarSign,
      change: '+8%',
      color: 'bg-amber-600',
    },
  ];

  const enrollmentData = [
    { month: 'Jan', students: 280 },
    { month: 'Feb', students: 295 },
    { month: 'Mar', students: 310 },
    { month: 'Apr', students: 325 },
    { month: 'May', students: 340 },
    { month: 'Jun', students: 342 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 18500 },
    { month: 'Feb', revenue: 19200 },
    { month: 'Mar', revenue: 20100 },
    { month: 'Apr', revenue: 21800 },
    { month: 'May', revenue: 23200 },
    { month: 'Jun', revenue: 24580 },
  ];
  const classDistribution = [
    { name: 'Beginner', value: 45, color: '#3B82F6' },
    { name: 'Intermediate', value: 35, color: '#10B981' },
    { name: 'Advanced', value: 20, color: '#D97706' },
  ];

  const recentActivities = [
    {
      id: 1,
      activity: 'New student Sarah Johnson enrolled',
      time: '2 hours ago',
      icon: Users,
    },
    {
      id: 2,
      activity: 'Teacher meeting scheduled for tomorrow',
      time: '4 hours ago',
      icon: Calendar,
    },
    {
      id: 3,
      activity: 'Classroom A-101 maintenance completed',
      time: '6 hours ago',
      icon: Building,
    },
    {
      id: 4,
      activity: 'Monthly report generated',
      time: '1 day ago',
      icon: BookOpen,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/70">
            Welcome back! Here's what's happening at Think English today.
          </p>
        </div>

        {/* Search Field */}
        <div className="w-full sm:w-96">
          <div className="relative">
            {' '}
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />{' '}
            <Input
              placeholder="Search students, classes, teachers..."
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60 focus:border-yellow-400 focus:ring-yellow-400"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <GlassCard key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm font-medium">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-20`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Enrollment Chart */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            Student Enrollment Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
              <Line
                type="monotone"
                dataKey="students"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Revenue Chart */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            Monthly Revenue
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
              <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Distribution */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            Class Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={classDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {classDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Recent Activities */}
        <GlassCard className="p-6 lg:col-span-2">
          <h3 className="text-xl font-semibold text-white mb-6">
            Recent Activities
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <activity.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.activity}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-4 h-4 text-white/50 mr-1" />
                    <span className="text-white/50 text-sm">
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;

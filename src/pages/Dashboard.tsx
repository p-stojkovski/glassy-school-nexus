
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Users, BookOpen, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { RootState } from '../store';
import { setClasses } from '../store/slices/classesSlice';
import { setStudents } from '../store/slices/studentsSlice';
import classService from '../services/classService';
import studentService from '../services/studentService';
import GlassCard from '../components/common/GlassCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { classes } = useSelector((state: RootState) => state.classes);
  const { students } = useSelector((state: RootState) => state.students);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [classesData, studentsData] = await Promise.all([
          classService.getClasses(),
          studentService.getStudents(),
        ]);
        dispatch(setClasses(classesData));
        dispatch(setStudents(studentsData));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadData();
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Students',
      value: students.length.toString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
    },
    {
      title: 'Active Classes',
      value: classes.filter(c => c.status === 'active').length.toString(),
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      change: '+5%',
    },
    {
      title: 'Attendance Rate',
      value: '94.2%',
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      change: '+2.1%',
    },
    {
      title: 'Revenue',
      value: '$24,580',
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600',
      change: '+18%',
    },
  ];

  const upcomingClasses = classes.slice(0, 3);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/70">Welcome back! Here's what's happening at your school.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="p-6" hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-green-400 text-sm">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Classes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Upcoming Classes</h2>
            {upcomingClasses.length > 0 ? (
              <div className="space-y-4">
                {upcomingClasses.map((classItem, index) => (
                  <motion.div
                    key={classItem.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: classItem.color }}
                      />
                      <div>
                        <h3 className="font-medium text-white">{classItem.name}</h3>
                        <p className="text-white/70 text-sm">{classItem.teacher.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm">{classItem.room}</p>
                      <div className="flex items-center text-white/70 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>9:00 AM</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <LoadingSpinner />
            )}
          </GlassCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { label: 'Add New Student', color: 'from-blue-500 to-blue-600' },
                { label: 'Schedule Class', color: 'from-green-500 to-green-600' },
                { label: 'Mark Attendance', color: 'from-purple-500 to-purple-600' },
                { label: 'Send Message', color: 'from-yellow-500 to-yellow-600' },
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`w-full p-3 rounded-xl bg-gradient-to-r ${action.color} text-white font-medium hover:shadow-lg transition-all`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {action.label}
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;


import React, { useState } from 'react';
import { Calendar } from '../components/ui/calendar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, CalendarDays, Clock, Users, MapPin } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';

const Scheduling: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  // Mock data for scheduled classes
  const scheduledClasses = [
    {
      id: '1',
      title: 'English Conversation',
      time: '09:00 - 10:30',
      teacher: 'Sarah Johnson',
      students: 12,
      classroom: 'Room A1',
      status: 'scheduled',
    },
    {
      id: '2',
      title: 'German Grammar',
      time: '11:00 - 12:30',
      teacher: 'Michael Schmidt',
      students: 8,
      classroom: 'Room B2',
      status: 'scheduled',
    },
    {
      id: '3',
      title: 'English Writing',
      time: '14:00 - 15:30',
      teacher: 'Emma Davis',
      students: 10,
      classroom: 'Room A1',
      status: 'canceled',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Scheduling & Planning</h1>
          <p className="text-white/70 mt-2">
            Plan, schedule, and manage classes efficiently
          </p>
        </div>
        <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-medium">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Class
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Calendar</h2>
                <div className="flex gap-2">
                  {(['day', 'week', 'month'] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant={viewMode === mode ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode(mode)}
                      className={
                        viewMode === mode
                          ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border border-white/10 bg-white/5"
              />
            </div>
          </GlassCard>
        </div>

        {/* Schedule Overview */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Today's Schedule
                </h2>
                <Badge variant="secondary" className="bg-white/10 text-white">
                  {scheduledClasses.length} Classes
                </Badge>
              </div>

              <div className="space-y-4">
                {scheduledClasses.map((classItem) => (
                  <Card key={classItem.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-white">
                              {classItem.title}
                            </h3>
                            <Badge
                              variant={
                                classItem.status === 'scheduled'
                                  ? 'default'
                                  : 'destructive'
                              }
                              className={
                                classItem.status === 'scheduled'
                                  ? 'bg-green-500/20 text-green-300'
                                  : 'bg-red-500/20 text-red-300'
                              }
                            >
                              {classItem.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {classItem.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {classItem.students} students
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {classItem.classroom}
                            </div>
                          </div>
                          <p className="text-sm text-white/70">
                            Teacher: {classItem.teacher}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white/70 hover:text-white hover:bg-white/10"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <CalendarDays className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Schedule Recurring</h3>
              <p className="text-sm text-white/60">Set up repeating classes</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Bulk Schedule</h3>
              <p className="text-sm text-white/60">Schedule multiple classes</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Time Conflicts</h3>
              <p className="text-sm text-white/60">Check for conflicts</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Scheduling;

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Users, MapPin, Edit, X } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { ScheduledClass } from '@/domains/scheduling/schedulingSlice';
import { ScheduledClassStatus } from '@/types/enums';

interface SchedulingOverviewProps {
  scheduledClasses: ScheduledClass[];
  onEdit: (schedule: ScheduledClass) => void;
  onCancel: (schedule: ScheduledClass) => void;
}

const SchedulingOverview: React.FC<SchedulingOverviewProps> = ({
  scheduledClasses,
  onEdit,
  onCancel,
}) => {
  return (
    <GlassCard className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Scheduled Classes
          </h2>
          <Badge variant="secondary" className="bg-white/10 text-white">
            {scheduledClasses.length} Classes
          </Badge>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {scheduledClasses.map((schedule) => (
            <Card key={schedule.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-white">
                        {schedule.className}
                      </h3>
                      <Badge
                        variant={
                          schedule.status === ScheduledClassStatus.Scheduled
                            ? 'default'
                            : schedule.status === ScheduledClassStatus.Canceled
                              ? 'destructive'
                              : 'secondary'
                        }
                        className={
                          schedule.status === ScheduledClassStatus.Scheduled
                            ? 'bg-green-500/20 text-green-300'
                            : schedule.status === ScheduledClassStatus.Canceled
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-blue-500/20 text-blue-300'
                        }
                      >
                        {schedule.status}
                      </Badge>
                      {schedule.isRecurring && (
                        <Badge
                          variant="outline"
                          className="border-yellow-500/50 text-yellow-300"
                        >
                          Recurring
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {schedule.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {schedule.studentIds.length} students
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {schedule.classroomName}
                      </div>
                    </div>
                    <p className="text-sm text-white/70">
                      Teacher: {schedule.teacherName}
                    </p>
                    {schedule.cancelReason && (
                      <p className="text-sm text-red-300">
                        Canceled: {schedule.cancelReason}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {schedule.status === ScheduledClassStatus.Scheduled && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(schedule)}
                          className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCancel(schedule)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default SchedulingOverview;

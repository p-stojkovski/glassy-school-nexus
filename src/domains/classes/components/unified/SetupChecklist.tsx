import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Users, 
  Calendar, 
  FileText, 
  ChevronRight,
  Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/common/GlassCard';
import { ClassBasicInfoResponse } from '@/types/api/class';

interface SetupChecklistProps {
  classData: ClassBasicInfoResponse;
  scheduleCount: number;
  onNavigateToStudents: () => void;
  onNavigateToSchedule: () => void;
  onNavigateToInfo: () => void;
  onDismiss?: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  isComplete: boolean;
  icon: React.ReactNode;
  action: () => void;
  actionLabel: string;
  optional?: boolean;
}

const SetupChecklist: React.FC<SetupChecklistProps> = ({
  classData,
  scheduleCount,
  onNavigateToStudents,
  onNavigateToSchedule,
  onNavigateToInfo,
  onDismiss,
}) => {
  const items: ChecklistItem[] = [
    {
      id: 'basic-info',
      label: 'Basic information configured',
      description: 'Name, subject, teacher, and classroom',
      isComplete: true, // Always complete if class exists
      icon: <CheckCircle2 className="w-5 h-5" />,
      action: () => {},
      actionLabel: 'Done',
    },
    {
      id: 'schedule',
      label: 'Weekly schedule',
      description: scheduleCount > 0 
        ? `${scheduleCount} time slot${scheduleCount !== 1 ? 's' : ''} configured`
        : 'Required to generate lessons',
      isComplete: scheduleCount > 0,
      icon: <Calendar className="w-5 h-5" />,
      action: onNavigateToSchedule,
      actionLabel: scheduleCount > 0 ? 'Manage' : 'Add schedule',
    },
    {
      id: 'students',
      label: 'Students enrolled',
      description: classData.enrolledCount > 0
        ? `${classData.enrolledCount} student${classData.enrolledCount !== 1 ? 's' : ''} enrolled`
        : 'Enroll students in this class',
      isComplete: classData.enrolledCount > 0,
      icon: <Users className="w-5 h-5" />,
      action: onNavigateToStudents,
      actionLabel: classData.enrolledCount > 0 ? 'Manage' : 'Add students',
    },
    {
      id: 'details',
      label: 'Learning objectives & materials',
      description: 'Add objectives, requirements, and materials',
      isComplete: false, // We don't have this info in basic response, assume incomplete
      icon: <FileText className="w-5 h-5" />,
      action: onNavigateToInfo,
      actionLabel: 'Add details',
      optional: true,
    },
  ];

  const completedCount = items.filter(item => item.isComplete).length;
  const totalRequired = items.filter(item => !item.optional).length;
  const requiredComplete = items.filter(item => !item.optional && item.isComplete).length;
  const allRequiredComplete = requiredComplete === totalRequired;

  // Don't show if all items are complete
  if (allRequiredComplete && completedCount === items.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <GlassCard className="p-5 border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Setup Checklist</h3>
              <p className="text-sm text-white/60">
                {allRequiredComplete 
                  ? 'Great job! Your class is ready to go.'
                  : 'Complete these steps to get your class ready'}
              </p>
            </div>
          </div>
          {onDismiss && allRequiredComplete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-white/50 hover:text-white hover:bg-white/10"
            >
              Dismiss
            </Button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/70">{completedCount} of {items.length} complete</span>
            <span className="text-white/50">{Math.round((completedCount / items.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / items.length) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </div>
        </div>

        {/* Checklist items */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-colors
                ${item.isComplete 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }
              `}
            >
              {/* Status icon */}
              <div className={`
                flex-shrink-0
                ${item.isComplete ? 'text-green-400' : 'text-white/40'}
              `}>
                {item.isComplete ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${item.isComplete ? 'text-white' : 'text-white/90'}`}>
                    {item.label}
                  </span>
                  {item.optional && (
                    <span className="text-xs text-white/40 bg-white/10 px-1.5 py-0.5 rounded">
                      Optional
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/50 truncate">{item.description}</p>
              </div>

              {/* Action button */}
              {!item.isComplete || item.id !== 'basic-info' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={item.action}
                  className={`
                    flex-shrink-0 gap-1
                    ${item.isComplete 
                      ? 'text-white/50 hover:text-white' 
                      : 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10'
                    }
                  `}
                >
                  {item.actionLabel}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <span className="text-sm text-green-400 flex-shrink-0">✓ Done</span>
              )}
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default SetupChecklist;

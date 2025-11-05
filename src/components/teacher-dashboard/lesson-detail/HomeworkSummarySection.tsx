import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BookCheck } from 'lucide-react';
import { LessonStudentResponse, HomeworkCompletionSummaryResponse } from '@/types/api/lesson-students';

interface HomeworkSummarySectionProps {
  homeworkSummary: HomeworkCompletionSummaryResponse | null;
  students: LessonStudentResponse[];
}

const HomeworkSummarySection: React.FC<HomeworkSummarySectionProps> = ({ homeworkSummary, students }) => {
  if (!homeworkSummary) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BookCheck className="w-5 h-5 text-purple-400" />
          Homework Summary
        </h3>
        <p className="text-white/70 italic">No homework data available</p>
      </div>
    );
  }

  const { completionStats, completionRate, totalStudents } = homeworkSummary;
  const completedCount = completionStats.complete + completionStats.partial;
  
  const getCompletionColor = (rate: number) => {
    if (rate >= 85) return 'text-green-400';
    if (rate >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getBadgeColor = (rate: number) => {
    if (rate >= 85) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (rate >= 70) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-red-500/20 text-red-300 border-red-500/30';
  };
  
  const getCompletionLabel = (rate: number) => {
    if (rate >= 85) return 'Excellent completion';
    if (rate >= 70) return 'Good completion';
    return 'Poor completion';
  };

  // Get student lists by homework status
  const completeStudents = students.filter(s => s.homeworkStatus === 'complete');
  const partialStudents = students.filter(s => s.homeworkStatus === 'partial');
  const missingStudents = students.filter(s => s.homeworkStatus === 'missing');
  const notCheckedStudents = students.filter(s => !s.homeworkStatus);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BookCheck className="w-5 h-5 text-purple-400" />
        Homework Summary
      </h3>
      
      {/* Homework Overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70">Completion Rate</span>
          <Badge className={getBadgeColor(completionRate)}>
            {getCompletionLabel(completionRate)}
          </Badge>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${getCompletionColor(completionRate)}`}>
            {completedCount}/{totalStudents}
          </span>
          <span className={`text-lg ${getCompletionColor(completionRate)}`}>
            ({completionRate}%)
          </span>
        </div>
      </div>
      
      {/* Student Lists by Homework Status */}
      <div className="space-y-4">
        {completeStudents.length > 0 && (
          <HomeworkStatusList
            title="Complete"
            count={completeStudents.length}
            students={completeStudents}
            colorClass="green"
          />
        )}
        
        {partialStudents.length > 0 && (
          <HomeworkStatusList
            title="Partial"
            count={partialStudents.length}
            students={partialStudents}
            colorClass="orange"
          />
        )}
        
        {missingStudents.length > 0 && (
          <HomeworkStatusList
            title="Missing"
            count={missingStudents.length}
            students={missingStudents}
            colorClass="red"
          />
        )}
        
        {notCheckedStudents.length > 0 && (
          <HomeworkStatusList
            title="Not Checked"
            count={notCheckedStudents.length}
            students={notCheckedStudents}
            colorClass="gray"
          />
        )}
      </div>
    </div>
  );
};

interface HomeworkStatusListProps {
  title: string;
  count: number;
  students: LessonStudentResponse[];
  colorClass: 'green' | 'orange' | 'red' | 'gray';
}

const HomeworkStatusList: React.FC<HomeworkStatusListProps> = ({ title, count, students, colorClass }) => {
  const colorMap = {
    green: 'text-green-400 bg-green-500/20 border-green-500/30',
    orange: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    red: 'text-red-400 bg-red-500/20 border-red-500/30',
    gray: 'text-gray-400 bg-gray-500/20 border-gray-500/30'
  };

  return (
    <div>
      <h4 className={`text-sm font-medium ${colorMap[colorClass].split(' ')[0]} mb-2 flex items-center gap-1`}>
        <span className={`w-2 h-2 bg-${colorClass}-400 rounded-full`}></span>
        {title} ({count})
      </h4>
      <div className="flex flex-wrap gap-2">
        {students.map(student => (
          <Badge key={student.studentId} className={colorMap[colorClass]}>
            {student.studentName}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default HomeworkSummarySection;
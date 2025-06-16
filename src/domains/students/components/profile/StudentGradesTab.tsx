import React from 'react';
import { GraduationCap } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import GlassCard from '@/components/common/GlassCard';

interface GradeAssessment {
  id: string;
  value: string | number;
  comments?: string;
  assessment?: {
    title: string;
    type: string;
    date: string;
  };
}

interface StudentGradesTabProps {
  gradeAssessments: GradeAssessment[];
}

const StudentGradesTab: React.FC<StudentGradesTabProps> = ({
  gradeAssessments,
}) => {
  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Grade Records</h3>
      {gradeAssessments.length === 0 ? (
        <div className="text-center py-8 text-white/60">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 text-white/40" />
          <p>No grades recorded</p>
          <p className="text-sm">
            Grades will appear here once assessments are completed
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="text-white">
            <TableHeader>
              <TableRow className="border-white/20 hover:bg-white/5">
                <TableHead className="text-white/90">Assessment</TableHead>
                <TableHead className="text-white/90">Type</TableHead>
                <TableHead className="text-white/90">Date</TableHead>
                <TableHead className="text-white/90">Grade</TableHead>
                <TableHead className="text-white/90">Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gradeAssessments.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-white/10 hover:bg-white/5"
                >
                  <TableCell className="font-medium">
                    {item.assessment?.title}
                  </TableCell>
                  <TableCell>{item.assessment?.type}</TableCell>
                  <TableCell>
                    {item.assessment
                      ? new Date(item.assessment.date).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell className="font-semibold text-green-300">
                    {item.value}
                  </TableCell>
                  <TableCell>{item.comments || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </GlassCard>
  );
};

export default StudentGradesTab;

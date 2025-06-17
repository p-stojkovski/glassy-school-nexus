import React, { useState, useEffect } from 'react';
import { RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  Assessment,
  Grade,
  selectAssessmentsByClassId,
  selectGradesByClassId,
} from '@/domains/grades/gradesSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import GlassCard from '@/components/common/GlassCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Download, Filter } from 'lucide-react';

interface GradebookProps {
  classId: string;
}

interface StudentGradeRow {
  studentId: string;
  studentName: string;
  grades: {
    [assessmentId: string]: {
      value: string | number;
      comments?: string;
    };
  };
}

const Gradebook: React.FC<GradebookProps> = ({ classId }) => {
  const dispatch = useAppDispatch();
  const { classes } = useAppSelector((state: RootState) => state.classes);
  const { students } = useAppSelector((state: RootState) => state.students);
  // Move the selectors to the top level to follow the Rules of Hooks
  const allAssessments = useAppSelector(
    (state: RootState) => state.grades.assessments
  );
  const allGrades = useAppSelector((state: RootState) => state.grades.grades);

  const selectedClass = classes.find((c) => c.id === classId);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [gradebookData, setGradebookData] = useState<StudentGradeRow[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  // Fetch assessments and grades for the selected class
  useEffect(() => {
    if (classId) {
      // Filter assessments directly
      const classAssessments = allAssessments.filter(
        (assessment) => assessment.classId === classId
      );
      setAssessments(classAssessments);

      // Filter grades directly
      const assessmentIds = classAssessments.map((assessment) => assessment.id);
      const classGrades = allGrades.filter((grade) =>
        assessmentIds.includes(grade.assessmentId)
      );

      // Group grades by student
      const gradebookRows: StudentGradeRow[] = students.map((student) => {
        const studentGrades = classGrades.filter(
          (grade) => grade.studentId === student.id
        );
        const gradesMap: {
          [assessmentId: string]: { value: string | number; comments?: string };
        } = {};

        studentGrades.forEach((grade) => {
          gradesMap[grade.assessmentId] = {
            value: grade.value,
            comments: grade.comments,
          };
        });

        return {
          studentId: student.id,
          studentName: student.name,
          grades: gradesMap,
        };
      });
      setGradebookData(gradebookRows);
    } else {
      setAssessments([]);
      setGradebookData([]);
    }
  }, [classId, allAssessments, allGrades, students]);

  // Filter assessments by type
  const filteredAssessments =
    filterType === 'all'
      ? assessments
      : assessments.filter((a) => a.type === filterType);

  // Filter students by search term
  const filteredGradebook = gradebookData.filter((row) =>
    row.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unique assessment types
  const assessmentTypes = Array.from(new Set(assessments.map((a) => a.type)));

  // Export gradebook to CSV
  const exportToCSV = () => {
    // Create header row
    let csv = `Student,${filteredAssessments.map((a) => `"${a.title} (${a.type})"`).join(',')}\n`;

    // Add data rows
    filteredGradebook.forEach((row) => {
      const studentRow = [
        `"${row.studentName}"`,
        ...filteredAssessments.map((assessment) => {
          const grade = row.grades[assessment.id];
          return grade ? `"${grade.value}"` : '';
        }),
      ];
      csv += studentRow.join(',') + '\n';
    });

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${selectedClass?.name || 'class'}_gradebook.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Export Successful', {
      description: 'The gradebook has been exported to CSV.',
    });
  };

  if (!classId) {
    return (
      <GlassCard className="p-6 text-white text-center">
        <h3 className="text-xl mb-4">Please Select a Class</h3>
        <p className="text-white/70">Select a class to view its gradebook</p>
      </GlassCard>
    );
  }

  if (assessments.length === 0) {
    return (
      <GlassCard className="p-6 text-white text-center">
        <h3 className="text-xl mb-4">No Assessments Found</h3>
        <p className="text-white/70">
          Please create assessments for {selectedClass?.name || 'this class'}{' '}
          first
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">
            Gradebook
            {selectedClass && (
              <span className="ml-2 text-white/70">
                for {selectedClass.name}
              </span>
            )}
          </h3>

          <div>
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="bg-transparent border-white/20 text-white hover:bg-white/10 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export to CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>

          <div className="w-full md:w-64">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Filter by type" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-gray-900 text-white border-white/20">
                <SelectItem value="all">All Assessment Types</SelectItem>
                {assessmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredGradebook.length > 0 ? (
            <Table className="text-white w-full">
              <TableHeader>
                <TableRow className="hover:bg-white/5 border-white/20">
                  <TableHead className="text-white/70 sticky left-0 bg-gray-900">
                    Student
                  </TableHead>
                  {filteredAssessments.map((assessment) => (
                    <TableHead
                      key={assessment.id}
                      className="text-white/70 min-w-[120px]"
                    >
                      <div>{assessment.title}</div>
                      <div className="text-xs text-white/60">
                        {assessment.type}
                      </div>
                      <div className="text-xs text-white/60">
                        {new Date(assessment.date).toLocaleDateString()}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGradebook.map((row) => (
                  <TableRow
                    key={row.studentId}
                    className="hover:bg-white/5 border-white/10"
                  >
                    <TableCell className="font-medium sticky left-0 bg-gray-900">
                      {row.studentName}
                    </TableCell>
                    {filteredAssessments.map((assessment) => {
                      const grade = row.grades[assessment.id];
                      return (
                        <TableCell
                          key={`${row.studentId}-${assessment.id}`}
                          className="relative"
                        >
                          <div className="font-medium">
                            {grade ? grade.value : '-'}
                          </div>
                          {grade && grade.comments && (
                            <div
                              className="text-xs text-white/60 truncate max-w-[120px]"
                              title={grade.comments}
                            >
                              {grade.comments}
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-white/70">
              No students match your search criteria
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default Gradebook;

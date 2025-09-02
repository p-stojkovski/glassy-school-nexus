import React from 'react';
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  BookOpen,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import GlassCard from '@/components/common/GlassCard';
import { ClassResponse } from '@/types/api/class';

interface Props {
  classes: ClassResponse[];
  onEdit: (c: ClassResponse) => void;
  onDelete: (c: ClassResponse) => void;
  onView: (c: ClassResponse) => void;
}



const ClassTable: React.FC<Props> = React.memo(({ classes, onEdit, onDelete, onView }) => {
  return (
    <div className="space-y-4">
      <GlassCard className="overflow-hidden" animate={false}>
        <Table>
          <TableHeader>
            <TableRow className="border-white/20 hover:bg-white/5">
              <TableHead className="text-white/90 font-semibold">
                Class Details
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Teacher
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Enrollment
              </TableHead>
              <TableHead className="text-white/90 font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((classItem) => (
              <TableRow
                key={classItem.id}
                className="border-white/10 hover:bg-white/5"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-white">
                          {classItem.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                        <BookOpen className="w-3 h-3" />
                        <span>{classItem.subjectName}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <User className="w-3 h-3 text-white/60" />
                    <span>{classItem.teacherName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/60" />
                    <div className="text-sm">
                      <div className="font-medium text-white">
                        {classItem.enrolledCount}
                      </div>
                      <div className="text-white/50 text-xs">
                        enrolled
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-gray-900/95 border-white/20 text-white"
                      >
                        <DropdownMenuItem
                          onClick={() => onView(classItem)}
                          className="text-blue-400 focus:text-blue-300 focus:bg-blue-500/10 cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onEdit(classItem)}
                          className="text-white/70 focus:text-white focus:bg-white/10 cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Class
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-white/20" />

                        <DropdownMenuItem
                          onClick={() => onDelete(classItem)}
                          className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Class
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassCard>
    </div>
  );
});

ClassTable.displayName = 'ClassTable';

export default ClassTable;

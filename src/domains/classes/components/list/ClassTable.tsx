import React from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import GlassCard from '@/components/common/GlassCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Clock,
  MapPin,
  Users,
  Book,
} from 'lucide-react';
import { Class } from '../../classesSlice';

interface ClassTableProps {
  classes: Class[];
  onEdit: (classItem: Class) => void;
  onDelete: (classItem: Class) => void;
  onView: (classItem: Class) => void;
  loading?: boolean;
}

const ClassTable: React.FC<ClassTableProps> = ({
  classes,
  onEdit,
  onDelete,
  onView,
  loading = false,
}) => {
  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <GlassCard className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/20 hover:bg-white/5">
              <TableHead className="text-white/90 font-semibold">
                Class Details
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Teacher & Subject
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Schedule & Location
              </TableHead>
              <TableHead className="text-white/90 font-semibold">
                Students
              </TableHead>
              <TableHead className="text-white/90 font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((classItem, index) => (
              <motion.tr
                key={classItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="border-white/10 hover:bg-white/5"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-white">
                          {classItem.name}
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs">
                          Active
                        </Badge>
                      </div>
                      <div className="text-sm text-white/60 mt-1">
                        {classItem.description || 'No description available'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-white/80">
                      <div className="font-medium">{classItem.teacher.name}</div>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <Book className="w-3 h-3" />
                      <span className="text-sm">{classItem.subject}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-white/80">
                      <Clock className="w-3 h-3" />
                      <span className="text-sm">
                        {classItem.schedule ? 
                          `${classItem.schedule.dayOfWeek} ${classItem.schedule.startTime}-${classItem.schedule.endTime}` 
                          : 'Not scheduled'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <MapPin className="w-3 h-3" />
                      <span className="text-sm">{classItem.room || 'No room assigned'}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-400" />
                    <div className="text-sm">
                      <div className="text-green-400 font-medium">
                        {classItem.students} enrolled
                      </div>
                      <div className="text-white/60 text-xs">
                        Active students
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
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </GlassCard>

      <div className="text-center text-white/60 text-sm">
        Showing {classes.length} classes
      </div>
    </motion.div>
  );
};

export default ClassTable;

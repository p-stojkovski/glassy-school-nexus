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
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  MapPin,
  Users,
  Book,
  ChevronRight,
} from 'lucide-react';
import { Class } from '../../classesSlice';
import { formatSchedule } from '@/utils/scheduleFormatter';

interface ClassTableProps {
  classes: Class[];
  onView: (classItem: Class) => void;
  loading?: boolean;
}

const ClassTable: React.FC<ClassTableProps> = ({
  classes,
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
              <TableHead className="text-white/90 font-semibold w-12">
                {/* Navigation indicator column */}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((classItem, index) => (
              <TableRow
                key={classItem.id}
                onClick={() => onView(classItem)}
                className="border-white/10 hover:bg-white/10 cursor-pointer transition-colors group"
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
                        {classItem.schedule.length > 0 ? 
                          formatSchedule(classItem.schedule)
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
                    <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white/70 transition-colors" />
                  </div>
                </TableCell>
              </TableRow>
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


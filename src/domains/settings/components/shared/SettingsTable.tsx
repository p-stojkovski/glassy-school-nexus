import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import GlassCard from '@/components/common/GlassCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export interface SettingsTableColumn {
  key: string;
  label: string;
  width?: string;
  render?: (value: any, row: any) => ReactNode;
}

export interface SettingsTableProps {
  title: string;
  description: string;
  columns: SettingsTableColumn[];
  data: any[];
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  addButtonText?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  isLoading?: boolean;
}

const SettingsTable: React.FC<SettingsTableProps> = ({
  title,
  description,
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  addButtonText = "Add New",
  emptyStateTitle = "No Items Found",
  emptyStateDescription = "Start by adding your first item to the system.",
  isLoading = false,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-white/70">{description}</p>
          </div>
          <Button
            disabled
            className="bg-yellow-500/50 text-black/50 font-semibold cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            {addButtonText}
          </Button>
        </div>

        <GlassCard className="overflow-hidden">
          <LoadingSpinner size="lg" className="min-h-[200px]" />
        </GlassCard>
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-white/70">{description}</p>
          </div>
          <Button
            onClick={onAdd}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            {addButtonText}
          </Button>
        </div>

        <GlassCard className="p-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            {emptyStateTitle}
          </h3>
          <p className="text-white/60 mb-6">{emptyStateDescription}</p>
          <Button
            onClick={onAdd}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Item
          </Button>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-white/70">{description}</p>
        </div>
        <Button
          onClick={onAdd}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          {addButtonText}
        </Button>
      </div>

      <GlassCard className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/20 hover:bg-white/5">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="text-white font-semibold"
                  style={{ width: column.width }}
                >
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="text-white font-semibold w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={row.id || index}
                className="border-white/10 hover:bg-white/5"
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className="text-white/90">
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key] || '-'}
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(row)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-2 h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(row)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassCard>
    </motion.div>
  );
};

export default SettingsTable;

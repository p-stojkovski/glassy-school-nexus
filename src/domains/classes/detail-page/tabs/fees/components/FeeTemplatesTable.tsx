import React from 'react';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Amount } from '@/components/ui/amount';
import type { ClassFeeTemplate, FeeType } from '@/types/api/classFees';

interface FeeTemplatesTableProps {
  templates: ClassFeeTemplate[];
  onEdit: (template: ClassFeeTemplate) => void;
  onDelete: (template: ClassFeeTemplate) => void;
}

// Fee type display configuration
const FEE_TYPE_CONFIG: Record<FeeType, { label: string; icon: string }> = {
  tuition: { label: 'Tuition', icon: '📚' },
  material: { label: 'Material', icon: '📖' },
  exam: { label: 'Exam', icon: '📝' },
  activity: { label: 'Activity', icon: '🎯' },
  other: { label: 'Other', icon: '📌' },
};

export function FeeTemplatesTable({
  templates,
  onEdit,
  onDelete,
}: FeeTemplatesTableProps) {
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Sort templates by sortOrder, then by name
  const sortedTemplates = [...templates].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="py-2 text-white/70">Type</TableHead>
          <TableHead className="py-2 text-white/70">Name</TableHead>
          <TableHead className="py-2 text-white/70 text-right">Amount</TableHead>
          <TableHead className="py-2 text-white/70">Recurring</TableHead>
          <TableHead className="py-2 text-white/70">Optional</TableHead>
          <TableHead className="py-2 text-white/70">Effective From</TableHead>
          <TableHead className="py-2 text-white/70 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedTemplates.map((template) => {
          const typeConfig = FEE_TYPE_CONFIG[template.feeType];
          return (
            <TableRow key={template.id}>
              <TableCell className="py-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{typeConfig.icon}</span>
                  <span className="text-white/80">{typeConfig.label}</span>
                </div>
              </TableCell>
              <TableCell className="py-2 text-white font-medium">
                {template.name}
              </TableCell>
              <TableCell className="py-2 text-right">
                <Amount value={template.amount} weight="medium" className="text-white" />
              </TableCell>
              <TableCell className="py-2">
                {template.isRecurring ? (
                  <Badge
                    variant="default"
                    className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                  >
                    Monthly
                  </Badge>
                ) : (
                  <span className="text-white/50">One-time</span>
                )}
              </TableCell>
              <TableCell className="py-2">
                {template.isOptional ? (
                  <Badge
                    variant="secondary"
                    className="bg-amber-500/20 text-amber-300 border-amber-500/30"
                  >
                    Optional
                  </Badge>
                ) : (
                  <span className="text-white/50">Required</span>
                )}
              </TableCell>
              <TableCell className="py-2 text-white/80">
                {formatDate(template.effectiveFrom)}
              </TableCell>
              <TableCell className="py-2 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-white/10"
                      aria-label="Fee template actions"
                    >
                      <MoreVertical className="h-4 w-4 text-white/70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => onEdit(template)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4 text-blue-400" />
                      Edit template...
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(template)}
                      className="cursor-pointer text-red-400"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete template...
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

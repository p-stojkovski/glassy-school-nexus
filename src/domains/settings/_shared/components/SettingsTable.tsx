import React, { ReactNode, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';
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
import SearchInput from '@/components/common/SearchInput';

export interface SettingsTableColumn {
  key: string;
  label: string;
  width?: string;
  render?: (value: any, row: any) => ReactNode;
}

export interface SettingsTableProps {
  title?: string;
  description?: string;
  columns: SettingsTableColumn[];
  data: any[];
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  /** Callback when a row is clicked (for navigation) */
  onRowClick?: (item: any) => void;
  addButtonText?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  isLoading?: boolean;
  hideAddButton?: boolean;
  hideDeleteButton?: boolean;
  /** Hide the entire Actions column (edit/delete buttons) */
  hideActionsColumn?: boolean;
  /** Hide the title and description header */
  hideHeader?: boolean;
  /** Show a navigation chevron arrow when rows are clickable */
  showNavigationArrow?: boolean;
  /** Search term for filtering (controlled by parent) */
  searchTerm?: string;
  /** Callback when search term changes */
  onSearchChange?: (term: string) => void;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
  /** Keys to search in (defaults to ['name']) */
  searchKeys?: string[];
}

const SettingsTable: React.FC<SettingsTableProps> = ({
  title,
  description,
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  onRowClick,
  addButtonText = "Add New",
  emptyStateTitle = "No Items Found",
  emptyStateDescription = "Start by adding your first item to the system.",
  isLoading = false,
  hideAddButton = false,
  hideDeleteButton = false,
  hideActionsColumn = false,
  hideHeader = false,
  showNavigationArrow = false,
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Search by name...',
  searchKeys = ['name'],
}) => {
  // Filter data based on search term (client-side filtering)
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return data.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerSearchTerm);
        }
        if (typeof value === 'number') {
          return value.toString().includes(lowerSearchTerm);
        }
        return false;
      })
    );
  }, [data, searchTerm, searchKeys]);

  // Check if search is enabled
  const isSearchEnabled = onSearchChange !== undefined;

  // Determine if we're showing "no results" vs "no data"
  const hasNoData = data.length === 0;
  const hasNoResults = !hasNoData && filteredData.length === 0 && searchTerm.trim() !== '';

  // Render the header row with search and add button
  const renderHeader = (disabled = false) => (
    <div className="flex flex-col gap-4">
      {/* Title and description */}
      {!hideHeader && (title || description) && (
        <div>
          {title && <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>}
          {description && <p className="text-white/70">{description}</p>}
        </div>
      )}

      {/* Search and Add button row - matching Students list page layout */}
      {(isSearchEnabled || (!hideAddButton && onAdd)) && (
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Search Input */}
          {isSearchEnabled && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Search:
              </label>
              <SearchInput
                value={searchTerm}
                onChange={onSearchChange!}
                placeholder={searchPlaceholder}
                disabled={disabled}
                clearable
                showStatusText={false}
                className="h-9"
              />
            </div>
          )}

          {/* Add Button */}
          {!hideAddButton && onAdd && (
            <div className="flex-shrink-0">
              <Button
                onClick={onAdd}
                disabled={disabled}
                variant="outline"
                className={disabled
                  ? "border-white/20 bg-white/5 text-white/50 font-medium cursor-not-allowed h-9"
                  : "border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium h-9"
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                {addButtonText}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {renderHeader(true)}
        <GlassCard className="overflow-hidden">
          <LoadingSpinner size="lg" className="min-h-[200px]" />
        </GlassCard>
      </div>
    );
  }
  // Empty data state (no items at all)
  if (hasNoData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {renderHeader(false)}

        <GlassCard className="p-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            {emptyStateTitle}
          </h3>
          <p className="text-white/60 mb-6">{emptyStateDescription}</p>
          {!hideAddButton && onAdd && (
            <Button
              onClick={onAdd}
              variant="outline"
              className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          )}
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
      {renderHeader(false)}

      <GlassCard className="overflow-hidden">
        {/* No results from search */}
        {hasNoResults ? (
          <div className="p-8 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              No results found
            </h3>
            <p className="text-white/60">
              No items match your search "{searchTerm}". Try a different search term.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/20 hover:bg-white/5">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className="text-white/90 font-semibold py-2"
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </TableHead>
                ))}
                {!hideActionsColumn && (
                  <TableHead className="text-white/90 font-semibold w-24 py-2">Actions</TableHead>
                )}
                {showNavigationArrow && (
                  <TableHead className="w-12">
                    {/* Navigation indicator column */}
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-white/10 hover:bg-white/10 transition-colors ${onRowClick ? 'cursor-pointer group' : ''}`}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className="text-white/90 py-2">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] || '-'}
                    </TableCell>
                  ))}
                  {!hideActionsColumn && (
                    <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center space-x-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(row)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-2 h-8 w-8"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        {!hideDeleteButton && onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(row)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {showNavigationArrow && (
                    <TableCell>
                      <div className="flex justify-end">
                        <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white/70 transition-colors" />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default SettingsTable;


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Power, 
  PowerOff,
  Percent,
  AlertCircle,
  Users,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Student } from '@/domains/students/studentsSlice';
import { useCanViewFinance } from '@/hooks/usePermissions';

// Flexible class info type for display
interface ClassInfo {
  id?: string;
  name: string;
  teacher?: { name: string };
}

interface StudentPageHeaderProps {
  student: Student;
  studentClass?: ClassInfo;
  outstandingBalance?: number;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  canDelete?: boolean;
  deleteDisabledReason?: string;
}

const StudentPageHeader: React.FC<StudentPageHeaderProps> = ({
  student,
  studentClass,
  outstandingBalance = 0,
  onEdit,
  onToggleStatus,
  onDelete,
  isDeleting = false,
  canDelete = true,
  deleteDisabledReason,
}) => {
  const navigate = useNavigate();
  const canViewFinance = useCanViewFinance();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const handleBack = () => {
    navigate('/students');
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    onDelete();
  };

  const handleStatusClick = () => {
    setShowStatusDialog(true);
  };

  const handleConfirmStatus = () => {
    setShowStatusDialog(false);
    onToggleStatus();
  };

  const statusText = student.isActive ? 'Active' : 'Inactive';
  const statusColor = student.isActive 
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
    : 'bg-gray-500/20 text-gray-400 border-gray-500/30';

  // Build discount label
  const discountLabel = student.hasDiscount
    ? `${student.discountTypeName ?? 'Discount'}${
        student.discountAmount && student.discountAmount > 0
          ? ` (${student.discountAmount} MKD)`
          : ''
      }`
    : null;

  return (
    <>
      <div className="space-y-3">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList className="text-white/70">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/50" />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/students" className="hover:text-white transition-colors">
                  Students
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/50" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white font-medium">
                {student.fullName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Strip - Unified compact bar consistent with ClassPageHeader */}
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            
            {/* Left: Back button + Student Name + Status */}
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-7 px-2 text-white/60 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-2 min-w-0">
                <User className="w-4 h-4 text-white/50" />
                <span className="text-sm font-medium text-white truncate">
                  {student.fullName}
                </span>
                <Badge className={`${statusColor} border text-xs`}>
                  {statusText}
                </Badge>
              </div>
            </div>

            {/* Separator */}
            <span className="hidden lg:block text-white/20">|</span>

            {/* Center: Context info (Class, Teacher, Discount, Balance) */}
            <div className="flex flex-wrap items-center gap-3 flex-1 text-sm text-white/70">
              {/* Class info */}
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-white/50" />
                <span>
                  {studentClass ? (
                    <Link 
                      to={`/classes/${studentClass.id}`}
                      className="text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      {studentClass.name}
                    </Link>
                  ) : (
                    <span className="text-white/40">Unassigned</span>
                  )}
                </span>
              </div>
              
              {/* Teacher info */}
              {studentClass && (
                <>
                  <span className="text-white/20">|</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/40">Teacher:</span>
                    <span>{studentClass.teacher?.name || student.currentTeacherName || 'N/A'}</span>
                  </div>
                </>
              )}
              
              {/* Discount badge */}
              {discountLabel && (
                <>
                  <span className="text-white/20">|</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-500/15 border border-yellow-500/20 rounded-md">
                    <Percent className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-yellow-300 font-medium text-xs">{discountLabel}</span>
                  </div>
                </>
              )}
              
              {/* Outstanding balance - only show for users with finance permissions */}
              {canViewFinance && outstandingBalance > 0 && (
                <>
                  <span className="text-white/20">|</span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/15 border border-red-500/20 rounded-md">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-red-300 font-medium text-xs">
                      Balance: ${outstandingBalance.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Right: Actions dropdown */}
            <div className="flex items-center shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl p-1.5"
                >
                  {/* Edit Option */}
                  <DropdownMenuItem
                    onClick={onEdit}
                    className="gap-2.5 cursor-pointer text-white hover:text-white focus:text-white focus:bg-white/10 rounded-lg px-3 py-2.5 transition-all duration-200"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="font-medium">Edit Student</span>
                  </DropdownMenuItem>

                  {/* Activate/Deactivate Option */}
                  <DropdownMenuItem
                    onClick={handleStatusClick}
                    className={`gap-2.5 cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200 ${
                      student.isActive 
                        ? 'text-amber-400 hover:text-amber-300 focus:text-amber-300 focus:bg-amber-500/10' 
                        : 'text-emerald-400 hover:text-emerald-300 focus:text-emerald-300 focus:bg-emerald-500/10'
                    }`}
                  >
                    {student.isActive ? (
                      <>
                        <PowerOff className="w-4 h-4" />
                        <span className="font-medium">Deactivate Student</span>
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4" />
                        <span className="font-medium">Activate Student</span>
                      </>
                    )}
                  </DropdownMenuItem>

                  {/* Delete Option */}
                  {canDelete ? (
                    <DropdownMenuItem
                      onClick={handleDeleteClick}
                      className="gap-2.5 text-rose-400 hover:text-rose-300 focus:text-rose-300 focus:bg-rose-500/10 cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="font-medium">Delete Student</span>
                    </DropdownMenuItem>
                  ) : (
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <div>
                            <DropdownMenuItem disabled className="gap-2.5 rounded-lg px-3 py-2.5 text-white/40">
                              <Trash2 className="w-4 h-4" />
                              <span className="font-medium">Delete Student</span>
                            </DropdownMenuItem>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          align="center"
                          className="z-[100] bg-gray-900/95 backdrop-blur-xl border border-white/10 text-white max-w-xs shadow-2xl rounded-xl p-3"
                          sideOffset={8}
                        >
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-amber-400 mb-1">Cannot delete this student</p>
                              <p className="text-white/80 text-sm">
                                {deleteDisabledReason || 'Student has existing dependencies that must be removed first.'}
                              </p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        description={`Are you sure you want to delete "${student.fullName}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Student'}
        cancelText="Cancel"
        variant="danger"
      />

      {/* Status Toggle Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        onConfirm={handleConfirmStatus}
        title={student.isActive ? 'Deactivate Student' : 'Activate Student'}
        description={
          student.isActive
            ? `Are you sure you want to deactivate "${student.fullName}"? They will no longer be counted as an active student.`
            : `Are you sure you want to activate "${student.fullName}"? They will be marked as an active student.`
        }
        confirmText={student.isActive ? 'Deactivate' : 'Activate'}
        cancelText="Cancel"
        variant={student.isActive ? 'danger' : 'info'}
      />
    </>
  );
};

export default StudentPageHeader;

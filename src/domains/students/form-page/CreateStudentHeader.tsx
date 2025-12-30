import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

interface CreateStudentHeaderProps {
  onOpenCreateSheet?: () => void;
}

const CreateStudentHeader: React.FC<CreateStudentHeaderProps> = ({
  onOpenCreateSheet,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/students');
  };

  return (
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
              Add New Student
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Strip */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-7 px-2 text-white/60 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-white/50" />
              <span className="text-sm font-medium text-white">
                Add New Student
              </span>
            </div>
          </div>

          {onOpenCreateSheet && (
            <Button
              size="sm"
              onClick={onOpenCreateSheet}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Open Form
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateStudentHeader;

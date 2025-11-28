import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, BookOpen, User, MapPin, Users, Home, GraduationCap, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClassResponse } from '@/types/api/class';
import { EditClassInfoDialog } from '@/domains/classes/components/dialogs/EditClassInfoDialog';

interface ClassPageHeaderProps {
  classData: ClassResponse | null;
  onBack: () => void;
  onUpdate?: () => void;
}

const ClassPageHeader: React.FC<ClassPageHeaderProps> = ({
  classData,
  onBack,
  onUpdate,
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);

  if (!classData) {
    return null;
  }

  const handleEditSuccess = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li>
              <Link
                to="/"
                className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 text-white/40 mx-1" />
              <Link
                to="/classes"
                className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Classes</span>
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 text-white/40 mx-1" />
              <span className="text-white font-medium truncate max-w-[200px]">
                {classData.name}
              </span>
            </li>
          </ol>
        </nav>

        {/* Class Metadata Bar - Always visible */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* Class Name */}
            <h1 className="text-xl font-bold text-white truncate">
              {classData.name}
            </h1>
            
            {/* Metadata Items */}
            <div className="flex flex-wrap items-center gap-4 text-sm flex-1">
              {/* Subject */}
              <div className="flex items-center gap-1.5 text-white/70">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>{classData.subjectName}</span>
              </div>
              
              {/* Teacher */}
              <div className="flex items-center gap-1.5 text-white/70">
                <User className="w-4 h-4 text-green-400" />
                <span>{classData.teacherName}</span>
              </div>
              
              {/* Classroom */}
              <div className="flex items-center gap-1.5 text-white/70">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>{classData.classroomName}</span>
              </div>
              
              {/* Capacity */}
              <div className="flex items-center gap-1.5 text-white/70">
                <Users className="w-4 h-4 text-orange-400" />
                <span>
                  {classData.enrolledCount}/{classData.classroomCapacity}
                  {classData.availableSlots > 0 && (
                    <span className="text-white/50 ml-1">
                      ({classData.availableSlots} available)
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              size="sm"
              onClick={() => setShowEditDialog(true)}
              className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium shrink-0"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Class Info Dialog */}
      <EditClassInfoDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        classData={classData}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default ClassPageHeader;

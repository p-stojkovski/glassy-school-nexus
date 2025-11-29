import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home, GraduationCap, Sparkles } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';

interface CreateClassHeaderProps {
  onOpenCreateSheet: () => void;
}

const CreateClassHeader: React.FC<CreateClassHeaderProps> = ({
  onOpenCreateSheet,
}) => {
  return (
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
            <span className="text-white font-medium">New Class</span>
          </li>
        </ol>
      </nav>

      {/* Welcome Card for Create Mode */}
      <GlassCard className="p-6 border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-500/20 rounded-xl">
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">Create a New Class</h1>
            <p className="text-white/70">
              Let's get started! Fill in the essentials and you'll be managing your class in no time.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default CreateClassHeader;

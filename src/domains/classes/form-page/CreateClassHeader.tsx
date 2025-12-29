import React from 'react';
import { Sparkles } from 'lucide-react';
import GlassCard from '@/components/common/GlassCard';
import { AppBreadcrumb } from '@/components/navigation';
import { buildClassBreadcrumbs } from '@/domains/classes/_shared/utils/classBreadcrumbs';

interface CreateClassHeaderProps {
  onOpenCreateSheet: () => void;
}

const CreateClassHeader: React.FC<CreateClassHeaderProps> = ({
  onOpenCreateSheet,
}) => {
  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <AppBreadcrumb
        items={buildClassBreadcrumbs({ pageType: 'create' })}
      />

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

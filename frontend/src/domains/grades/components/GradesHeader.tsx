import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ActiveTab = 'create' | 'grades' | 'gradebook';

interface GradesHeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const GradesHeader: React.FC<GradesHeaderProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Grades & Assessments</h1>
        <p className="text-white/70">
          Manage student assessments and track academic progress
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => onTabChange(value as ActiveTab)}
      >
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger
            value="create"
            className={`data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 ${activeTab === 'create' ? 'bg-white/20 text-white' : ''}`}
          >
            Create Assessment
          </TabsTrigger>
          <TabsTrigger
            value="grades"
            className={`data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 ${activeTab === 'grades' ? 'bg-white/20 text-white' : ''}`}
          >
            Enter Grades
          </TabsTrigger>
          <TabsTrigger
            value="gradebook"
            className={`data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 ${activeTab === 'gradebook' ? 'bg-white/20 text-white' : ''}`}
          >
            Gradebook
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default GradesHeader;

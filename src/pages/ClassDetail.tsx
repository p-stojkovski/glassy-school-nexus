import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GlassCard from '@/components/common/GlassCard';
import { classApiService } from '@/services/classApiService';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const ClassDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { (async () => { try { if (id) setData(await classApiService.getClassById(id)); } catch (e: any) { setError(e?.message || 'Failed to load'); } })(); }, [id]);

  if (error) return <div className="text-white">{error}</div>;
  if (!data) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Class Details</h1>
        <Button variant="ghost" className="text-white/80" onClick={() => navigate('/classes')}>Back</Button>
      </div>
      <GlassCard className="p-6 space-y-2">
        <div className="text-white text-xl">{data.name}</div>
        <div className="text-white/80">Subject: {data.subjectName}</div>
        <div className="text-white/80">Teacher: {data.teacherName}</div>
        <div className="text-white/80">Classroom: {data.classroomName}</div>
        <div className="text-white/80">Status: {data.status}</div>
        <div className="text-white/80">Enrolled: {data.enrolledCount}</div>
      </GlassCard>
    </div>
  );
};

export default ClassDetail;

import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { SaveStatus } from '@/types/api/lesson-students';

interface CommentsCellProps {
  studentId: string;
  currentComments: string | null;
  saveStatus: SaveStatus;
  onCommentsChange: (studentId: string, comments: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const CommentsCell: React.FC<CommentsCellProps> = ({
  studentId,
  currentComments,
  saveStatus,
  onCommentsChange,
  disabled = false,
  placeholder = "Add comments...",
}) => {
  // Local state for immediate UI updates
  const [localValue, setLocalValue] = useState(currentComments || '');

  // Sync with external changes
  useEffect(() => {
    setLocalValue(currentComments || '');
  }, [currentComments]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setLocalValue(newValue);
    
    // Call the debounced save function
    onCommentsChange(studentId, newValue);
  };


  return (
    <Textarea
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={2}
      className={`
        bg-white/10 border-white/20 text-white placeholder:text-white/60 
        resize-none min-h-[60px] text-sm
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${saveStatus === 'saving' ? 'border-blue-500/50' : ''}
        ${saveStatus === 'error' ? 'border-red-500/50' : ''}
        ${saveStatus === 'saved' ? 'border-green-500/50' : ''}
      `}
    />
  );
};
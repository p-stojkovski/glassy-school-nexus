import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { SaveStatus } from '@/types/api/lesson-students';
import { MessageSquarePlus } from 'lucide-react';

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
  // Expanded state - default to true if comments exist, false otherwise
  const [isExpanded, setIsExpanded] = useState(!!currentComments);

  // Sync with external changes
  useEffect(() => {
    setLocalValue(currentComments || '');
    // Auto-expand if comments are added externally
    if (currentComments && !isExpanded) {
      setIsExpanded(true);
    }
  }, [currentComments]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setLocalValue(newValue);
    
    // Call the debounced save function
    onCommentsChange(studentId, newValue);
  };

  // Collapsed view
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        disabled={disabled}
        className="flex items-center gap-2 text-white/60 hover:text-white/80 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MessageSquarePlus className="w-4 h-4" />
        Add comment
      </button>
    );
  }

  // Expanded view with textarea
  return (
    <Textarea
      value={localValue}
      onChange={handleChange}
      onBlur={() => {
        // Auto-collapse if empty on blur
        if (!localValue.trim()) {
          setIsExpanded(false);
        }
      }}
      placeholder={placeholder}
      disabled={disabled}
      rows={1}
      autoFocus
      className={`
        bg-white/10 border-white/20 text-white placeholder:text-white/60
        resize-none min-h-[36px] text-sm
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${saveStatus === 'saving' ? 'border-blue-500/50' : ''}
        ${saveStatus === 'error' ? 'border-red-500/50' : ''}
        ${saveStatus === 'saved' ? 'border-green-500/50' : ''}
      `}
    />
  );
};

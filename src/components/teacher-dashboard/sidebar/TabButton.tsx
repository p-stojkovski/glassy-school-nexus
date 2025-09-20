import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  className?: string;
  children?: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({
  active,
  onClick,
  icon: Icon,
  label,
  className = '',
  children
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md 
        transition-all duration-200 text-sm font-medium
        ${active 
          ? 'bg-white/20 text-white border border-white/30' 
          : 'text-white/70 hover:text-white hover:bg-white/10'
        }
        ${className}
      `}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      {children}
    </button>
  );
};

export default TabButton;
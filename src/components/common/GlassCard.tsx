
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  hover = false,
  onClick 
}) => {
  return (
    <motion.div
      className={cn(
        // Base glass card styles
        "backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-xl",
        // Hover styles
        hover && "hover:bg-white/10 hover:shadow-2xl transition-all duration-300 cursor-pointer",
        // Clickable styles
        onClick && "cursor-pointer",
        className
      )}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;

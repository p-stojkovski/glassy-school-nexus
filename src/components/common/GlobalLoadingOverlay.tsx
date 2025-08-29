import React from 'react';
import { useSelector } from 'react-redux';
import { selectIsGlobalLoading } from '@/store/slices/loadingSlice';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalLoadingOverlay: React.FC = () => {
  const isLoading = useSelector(selectIsGlobalLoading);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          {/* Spinner */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-6"
          />
          
          {/* Loading text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            className="text-center"
          >
            <p className="text-white font-medium text-lg mb-2">Loading...</p>
            <p className="text-white/70 text-sm">Please wait a moment</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoadingOverlay;

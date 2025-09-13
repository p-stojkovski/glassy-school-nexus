import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { RootState } from '../../store';
import { removeNotification } from '../../store/slices/uiSlice';

const NotificationToast: React.FC = () => {
  const { notifications } = useAppSelector((state: RootState) => state.ui);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (notifications.length > 0) {
        dispatch(removeNotification(notifications[0].id));
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [notifications, dispatch]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-400/30 bg-green-500/20';
      case 'error':
        return 'border-red-400/30 bg-red-500/20';
      case 'warning':
        return 'border-yellow-400/30 bg-yellow-500/20';
      default:
        return 'border-blue-400/30 bg-blue-500/20';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.slice(0, 3).map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            className={`backdrop-blur-md border rounded-xl p-4 shadow-xl min-w-80 ${getColorClasses(notification.type)}`}
          >
            <div className="flex items-start space-x-3">
              {getIcon(notification.type)}
              <div className="flex-1">
                <p className="text-white font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => dispatch(removeNotification(notification.id))}
                className="text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginAsync, clearError } from '@/domains/auth/authSlice';
import { addNotification } from '@/store/slices/uiSlice';
import GlassCard from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationType } from '@/types/enums';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();

  const { loginLoading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (error) {
      dispatch(clearError());
    }

    try {
      const result = await dispatch(loginAsync({ email, password }));
      
      if (loginAsync.fulfilled.match(result)) {
        dispatch(
          addNotification({
            type: NotificationType.Success,
            message: 'Welcome back! Login successful.',
          })
        );
      } else if (loginAsync.rejected.match(result)) {
        // Error is already stored in Redux state, and will be displayed in the form
        // Also show notification for additional feedback
        const errorMessage = result.payload as string || 'Login failed. Please try again.';
        dispatch(
          addNotification({
            type: NotificationType.Error,
            message: errorMessage,
          })
        );
      }
    } catch (error) {
      dispatch(
        addNotification({
          type: NotificationType.Error,
          message: 'An unexpected error occurred. Please try again.',
        })
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <GlassCard className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center overflow-hidden"
            >
              <img
                src="/lovable-uploads/0a12f78e-1752-49f8-8f2d-a8b7c70871ab.png"
                alt="Think English"
                className="w-full h-full object-cover"
              />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/70">Sign in to Think English</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-200 text-sm text-center">{error}</p>
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />{' '}
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) dispatch(clearError());
                }}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/60"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) dispatch(clearError());
                }}
                className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/60"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold py-3 rounded-xl"
            >
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default LoginForm;

import React, { useState, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FriendlyTimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  onConfirm?: (time: string) => void;  // New callback for when user confirms time
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
  format?: '12h' | '24h';
  minuteStep?: number;
  minTime?: string;
  maxTime?: string;
}

const FriendlyTimePicker: React.FC<FriendlyTimePickerProps> = ({
  value,
  onChange,
  onConfirm,
  placeholder = 'Select time',
  className,
  label,
  required = false,
  error,
  format = '24h',
  minuteStep = 15,
  minTime,
  maxTime,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      if (format === '12h') {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        setSelectedHour(displayHour);
        setSelectedPeriod(period);
      } else {
        setSelectedHour(hours);
      }
      setSelectedMinute(minutes);
    }
  }, [value, format]);

  // Generate time options
  const generateHours = () => {
    if (format === '12h') {
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }
    return Array.from({ length: 24 }, (_, i) => i);
  };

  const generateMinutes = () => {
    return Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep);
  };

  const formatDisplayTime = () => {
    if (selectedHour === null || selectedMinute === null) return placeholder;
    
    const hourStr = selectedHour.toString().padStart(2, '0');
    const minuteStr = selectedMinute.toString().padStart(2, '0');
    
    if (format === '12h') {
      return `${hourStr}:${minuteStr} ${selectedPeriod}`;
    }
    return `${hourStr}:${minuteStr}`;
  };

  const handleTimeSelect = (hour: number, minute: number, period?: 'AM' | 'PM', autoClose: boolean = true) => {
    let finalHour = hour;
    
    if (format === '12h' && period) {
      if (period === 'PM' && hour !== 12) finalHour += 12;
      if (period === 'AM' && hour === 12) finalHour = 0;
    }
    
    const timeString = `${finalHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Check time constraints
    if (minTime && timeString < minTime) return;
    if (maxTime && timeString > maxTime) return;
    
    setSelectedHour(hour);
    setSelectedMinute(minute);
    if (format === '12h' && period) setSelectedPeriod(period);
    
    onChange(timeString);
    if (autoClose) {
      setIsOpen(false);
    }
  };

  const isTimeDisabled = (hour: number, minute: number, period?: 'AM' | 'PM') => {
    let finalHour = hour;
    if (format === '12h' && period) {
      if (period === 'PM' && hour !== 12) finalHour += 12;
      if (period === 'AM' && hour === 12) finalHour = 0;
    }
    
    const timeString = `${finalHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    if (minTime && timeString < minTime) return true;
    if (maxTime && timeString > maxTime) return true;
    
    return false;
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-white font-semibold mb-2">
          {label} {required && '*'}
        </label>
      )}
      
      {/* Time Input Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3 py-2 rounded-lg text-left flex items-center justify-between",
          "bg-white/10 border border-white/20 text-white text-sm",
          "hover:bg-white/15 hover:border-yellow-400/50",
          "focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400",
          "transition-all duration-200 h-10",
          error && "border-red-400 focus:ring-red-400/50",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span className={cn(
            selectedHour !== null && selectedMinute !== null ? "text-white" : "text-white/60"
          )}>
            {formatDisplayTime()}
          </span>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-white/60 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}

      {/* Time Picker Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Picker */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute z-50 mt-2 p-4 rounded-xl",
                "bg-gradient-to-br from-blue-900/95 to-purple-900/95",
                "backdrop-blur-xl border border-white/20",
                "shadow-2xl shadow-purple-900/50"
              )}
              style={{ 
                minWidth: format === '12h' ? '320px' : '280px',
                maxWidth: format === '12h' ? '320px' : '280px'
              }}
            >
              <div className="flex items-start justify-center gap-6 overflow-hidden w-full max-w-none">
                <div className="flex items-start justify-center gap-6 mx-auto">
                {/* Hours Column */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <label className="text-white/60 text-xs font-medium mb-3">
                    {format === '12h' ? 'Hour' : 'Hours'}
                  </label>
                  <div className="relative">
                    <div className="flex flex-col h-40 overflow-y-auto overflow-x-hidden scrollbar-thin no-horizontal-scroll">
                      <div className="flex flex-col gap-1 px-1">
                        {generateHours().map((hour) => (
                          <button
                            key={hour}
                            type="button"
                            onClick={() => {
                              setSelectedHour(hour);
                              // Auto-select 00 minutes only if no minutes are selected yet
                              if (selectedMinute === null) {
                                const autoMinute = 0;
                                setSelectedMinute(autoMinute);
                                handleTimeSelect(hour, autoMinute, selectedPeriod, false);
                              } else {
                                // Use already selected minutes
                                handleTimeSelect(hour, selectedMinute, selectedPeriod, false);
                              }
                            }}
                            className={cn(
                              "w-12 h-9 text-sm font-medium rounded-md transition-all duration-150 flex-shrink-0",
                              "hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400/50",
                              selectedHour === hour 
                                ? "bg-yellow-400/20 text-yellow-400 font-semibold" 
                                : "text-white hover:text-white",
                              isTimeDisabled(hour, selectedMinute || 0, selectedPeriod) &&
                                "opacity-30 cursor-not-allowed hover:bg-transparent"
                            )}
                            disabled={isTimeDisabled(hour, selectedMinute || 0, selectedPeriod)}
                          >
                            {hour.toString().padStart(2, '0')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-white/60 text-xl font-bold self-center mt-8">:</div>

                {/* Minutes Column */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <label className="text-white/60 text-xs font-medium mb-3">Minutes</label>
                  <div className="relative">
                    <div className="flex flex-col h-40 overflow-y-auto overflow-x-hidden scrollbar-thin no-horizontal-scroll">
                      <div className="flex flex-col gap-1 px-1">
                        {generateMinutes().map((minute) => (
                          <button
                            key={minute}
                            type="button"
                            onClick={() => {
                              setSelectedMinute(minute);
                              if (selectedHour !== null) {
                                handleTimeSelect(selectedHour, minute, selectedPeriod, false);
                              }
                            }}
                            className={cn(
                              "w-12 h-9 text-sm font-medium rounded-md transition-all duration-150 flex-shrink-0",
                              "hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400/50",
                              selectedMinute === minute 
                                ? "bg-yellow-400/20 text-yellow-400 font-semibold" 
                                : "text-white hover:text-white",
                              isTimeDisabled(selectedHour || 0, minute, selectedPeriod) &&
                                "opacity-30 cursor-not-allowed hover:bg-transparent"
                            )}
                            disabled={isTimeDisabled(selectedHour || 0, minute, selectedPeriod)}
                          >
                            {minute.toString().padStart(2, '0')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Period Column (12h format) */}
                {format === '12h' && (
                  <>
                    <div className="text-white/60 text-xl font-bold self-center mt-8">|</div>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <label className="text-white/60 text-xs font-medium mb-3">Period</label>
                      <div className="flex flex-col gap-2">
                        {['AM', 'PM'].map((period) => (
                          <button
                            key={period}
                            type="button"
                            onClick={() => {
                              setSelectedPeriod(period as 'AM' | 'PM');
                              if (selectedHour !== null && selectedMinute !== null) {
                                handleTimeSelect(selectedHour, selectedMinute, period as 'AM' | 'PM', false);
                              }
                            }}
                            className={cn(
                              "w-12 h-9 text-sm font-medium rounded-md transition-all duration-150",
                              "hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400/50",
                              selectedPeriod === period 
                                ? "bg-yellow-400/20 text-yellow-400 font-semibold" 
                                : "text-white hover:text-white"
                            )}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                </div>
              </div>

              {/* Quick Time Actions */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const currentHour = format === '12h' 
                      ? (now.getHours() === 0 ? 12 : now.getHours() > 12 ? now.getHours() - 12 : now.getHours())
                      : now.getHours();
                    const currentMinute = Math.floor(now.getMinutes() / minuteStep) * minuteStep;
                    const currentPeriod = now.getHours() >= 12 ? 'PM' : 'AM';
                    
                    handleTimeSelect(currentHour, currentMinute, currentPeriod);
                  }}
                  className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1"
                >
                  <Clock className="w-3 h-3" />
                  Now
                </button>
                
                <div className="flex items-center gap-2">
                  {selectedHour !== null && selectedMinute !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        if (onConfirm && value) {
                          onConfirm(value);
                        }
                      }}
                      className="px-3 py-1 text-sm bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 rounded-md transition-colors"
                    >
                      Confirm
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FriendlyTimePicker;

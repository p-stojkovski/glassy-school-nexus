import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FriendlyDatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
}

const FriendlyDatePicker: React.FC<FriendlyDatePickerProps> = ({
  value,
  onChange,
  minDate = new Date('1900-01-01'),
  maxDate = new Date(),
  placeholder = 'Select a date',
  className,
  label,
  required = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setCurrentMonth(new Date(value));
    }
  }, [value]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange(date.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth.getMonth() - 1);
    } else {
      newDate.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newDate);
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
    setViewMode('months');
  };

  const handleMonthSelect = (month: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(month);
    setCurrentMonth(newDate);
    setViewMode('days');
  };

  const isDateDisabled = (date: Date) => {
    return date < minDate || date > maxDate;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getYearRange = () => {
    const currentYear = currentMonth.getFullYear();
    const startYear = Math.floor(currentYear / 10) * 10;
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push(startYear + i);
    }
    return years;
  };

  const handleYearNavigation = (direction: 'prev' | 'next') => {
    const currentYear = currentMonth.getFullYear();
    const newYear = direction === 'prev' ? currentYear - 10 : currentYear + 10;
    const newDate = new Date(currentMonth);
    newDate.setFullYear(newYear);
    setCurrentMonth(newDate);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-white font-semibold mb-2">
          {label} {required && '*'}
        </label>
      )}
      
      {/* Date Input Trigger */}
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
          <Calendar className="w-4 h-4 text-yellow-400" />
          <span className={cn(selectedDate ? "text-white" : "text-white/60")}>
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </span>
        </div>
        {selectedDate && (
          <div className="flex items-center gap-1 text-yellow-400 text-xs">
            <Clock className="w-3 h-3" />
            <span>{selectedDate.toLocaleDateString()}</span>
          </div>
        )}
      </button>

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}

      {/* Date Picker Dropdown */}
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
              style={{ minWidth: '320px' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => handleMonthChange('prev')}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  disabled={viewMode !== 'days'}
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('months')}
                    className={cn(
                      "px-3 py-1 rounded-lg font-medium transition-all",
                      "hover:bg-white/10",
                      viewMode === 'months' && "bg-yellow-400/20 text-yellow-400"
                    )}
                  >
                    {months[currentMonth.getMonth()]}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setViewMode('years')}
                    className={cn(
                      "px-3 py-1 rounded-lg font-medium transition-all",
                      "hover:bg-white/10",
                      viewMode === 'years' && "bg-yellow-400/20 text-yellow-400"
                    )}
                  >
                    {currentMonth.getFullYear()}
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleMonthChange('next')}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  disabled={viewMode !== 'days'}
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Calendar Content */}
              <AnimatePresence mode="wait">
                {viewMode === 'days' && (
                  <motion.div
                    key="days"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Week days */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {weekDays.map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-medium text-white/60 py-2"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(currentMonth).map((date, index) => (
                        <div key={index} className="aspect-square">
                          {date ? (
                            <button
                              type="button"
                              onClick={() => handleDateSelect(date)}
                              onMouseEnter={() => setHoveredDate(date)}
                              onMouseLeave={() => setHoveredDate(null)}
                              disabled={isDateDisabled(date)}
                              className={cn(
                                "w-full h-full rounded-lg flex items-center justify-center",
                                "text-sm font-medium transition-all duration-200",
                                "hover:bg-white/20 hover:scale-110",
                                isDateDisabled(date) && "opacity-30 cursor-not-allowed",
                                selectedDate?.toDateString() === date.toDateString() &&
                                  "bg-yellow-400 text-gray-900 hover:bg-yellow-300",
                                isToday(date) && !selectedDate?.toDateString() === date.toDateString() &&
                                  "border-2 border-yellow-400/50",
                                hoveredDate?.toDateString() === date.toDateString() &&
                                  "ring-2 ring-yellow-400/50"
                              )}
                            >
                              {date.getDate()}
                              {isToday(date) && (
                                <Sparkles className="absolute w-3 h-3 text-yellow-400 -top-1 -right-1" />
                              )}
                            </button>
                          ) : (
                            <div />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {viewMode === 'months' && (
                  <motion.div
                    key="months"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-3 gap-2"
                  >
                    {months.map((month, index) => (
                      <button
                        key={month}
                        type="button"
                        onClick={() => handleMonthSelect(index)}
                        className={cn(
                          "px-4 py-3 rounded-lg text-sm font-medium",
                          "hover:bg-white/20 transition-all duration-200",
                          "hover:scale-105",
                          currentMonth.getMonth() === index &&
                            "bg-yellow-400/20 text-yellow-400"
                        )}
                      >
                        {month.slice(0, 3)}
                      </button>
                    ))}
                  </motion.div>
                )}

                {viewMode === 'years' && (
                  <motion.div
                    key="years"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Year Navigation */}
                    <div className="flex items-center justify-between mb-3">
                      <button
                        type="button"
                        onClick={() => handleYearNavigation('prev')}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        disabled={getYearRange()[0] <= minDate.getFullYear()}
                      >
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </button>
                      <span className="text-white/60 text-sm font-medium">
                        {getYearRange()[0]} - {getYearRange()[9]}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleYearNavigation('next')}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        disabled={getYearRange()[9] >= maxDate.getFullYear()}
                      >
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    
                    {/* Years Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {getYearRange().map((year) => (
                        <button
                          key={year}
                          type="button"
                          onClick={() => handleYearChange(year)}
                          disabled={year < minDate.getFullYear() || year > maxDate.getFullYear()}
                          className={cn(
                            "px-4 py-3 rounded-lg text-sm font-medium",
                            "hover:bg-white/20 transition-all duration-200",
                            "hover:scale-105",
                            currentMonth.getFullYear() === year &&
                              "bg-yellow-400/20 text-yellow-400",
                            (year < minDate.getFullYear() || year > maxDate.getFullYear()) &&
                              "opacity-30 cursor-not-allowed"
                          )}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    handleDateSelect(today);
                  }}
                  className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Today
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FriendlyDatePicker;

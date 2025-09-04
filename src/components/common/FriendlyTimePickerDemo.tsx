import React, { useState } from 'react';
import FriendlyTimePicker from './FriendlyTimePicker';

const FriendlyTimePickerDemo: React.FC = () => {
  const [time24h, setTime24h] = useState('');
  const [time12h, setTime12h] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  return (
    <div className="space-y-8 p-6 max-w-md">
      <h2 className="text-2xl font-bold text-white mb-6">Time Picker Examples</h2>
      
      {/* Basic 24h format */}
      <FriendlyTimePicker
        label="24-Hour Format"
        value={time24h}
        onChange={setTime24h}
        placeholder="Select time"
        format="24h"
        minuteStep={15}
      />
      
      {/* 12h format with constraints */}
      <FriendlyTimePicker
        label="12-Hour Format"
        value={time12h}
        onChange={setTime12h}
        placeholder="Select time"
        format="12h"
        minuteStep={30}
        minTime="08:00"
        maxTime="18:00"
      />
      
      {/* Start time */}
      <FriendlyTimePicker
        label="Start Time"
        value={startTime}
        onChange={setStartTime}
        placeholder="Select start time"
        format="24h"
        minuteStep={15}
        required
      />
      
      {/* End time with dynamic minimum */}
      <FriendlyTimePicker
        label="End Time"
        value={endTime}
        onChange={setEndTime}
        placeholder="Select end time"
        format="24h"
        minuteStep={15}
        minTime={startTime}
        required
      />
      
      {/* Display selected values */}
      <div className="mt-8 p-4 bg-white/5 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-3">Selected Values:</h3>
        <div className="space-y-2 text-sm text-white/80">
          <div>24h Format: <span className="text-yellow-400">{time24h || 'None'}</span></div>
          <div>12h Format: <span className="text-yellow-400">{time12h || 'None'}</span></div>
          <div>Start Time: <span className="text-yellow-400">{startTime || 'None'}</span></div>
          <div>End Time: <span className="text-yellow-400">{endTime || 'None'}</span></div>
        </div>
      </div>
    </div>
  );
};

export default FriendlyTimePickerDemo;

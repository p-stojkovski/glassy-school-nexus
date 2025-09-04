import { formatSchedule } from './scheduleFormatter';

// Test cases for schedule formatting
const testCases = [
  {
    name: 'Same time slots across multiple days',
    schedule: [
      { day: 'Monday', startTime: '09:00', endTime: '12:45' },
      { day: 'Tuesday', startTime: '09:00', endTime: '12:45' },
      { day: 'Wednesday', startTime: '09:00', endTime: '12:45' }
    ],
    expected: 'Mon, Tue, Wed - 9:00-12:45'
  },
  {
    name: 'Different time slots',
    schedule: [
      { day: 'Monday', startTime: '09:00', endTime: '10:30' },
      { day: 'Tuesday', startTime: '14:00', endTime: '15:30' },
      { day: 'Wednesday', startTime: '09:00', endTime: '10:30' }
    ],
    expected: 'Mon, Wed - 9:00-10:30 | Tue - 14:00-15:30'
  },
  {
    name: 'Single day schedule',
    schedule: [
      { day: 'Friday', startTime: '10:00', endTime: '11:30' }
    ],
    expected: 'Fri - 10:00-11:30'
  },
  {
    name: 'Empty schedule',
    schedule: [],
    expected: 'No schedule'
  }
];

// Run tests
console.log('Testing schedule formatter...\n');

testCases.forEach(testCase => {
  const result = formatSchedule(testCase.schedule);
  const passed = result === testCase.expected;
  
  console.log(`Test: ${testCase.name}`);
  console.log(`Expected: ${testCase.expected}`);
  console.log(`Got:      ${result}`);
  console.log(`Status:   ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log('---');
});

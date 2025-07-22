import React, { useState } from 'react';
import DatePopover from './DatePopover';

const CalendarDemo: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const today = new Date();
  
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>
        Airbnb-Style Calendar Demo
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <DatePopover
          value={selectedDate}
          onChange={setSelectedDate}
          minDate={today}
          placeholder="Check-in date"
        />
      </div>
      
      {selectedDate && (
        <div style={{ textAlign: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
          <strong>Selected Date:</strong> {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarDemo;
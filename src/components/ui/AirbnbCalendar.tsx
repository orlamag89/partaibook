import React, { useState } from 'react';

interface AirbnbCalendarProps {
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
}

const AirbnbCalendar: React.FC<AirbnbCalendarProps> = ({ value, onChange, minDate }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(value || new Date());
  const today = new Date();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };
  
  const isDateSelected = (date: Date | null): boolean => {
    if (!value || !date) return false;
    return date.toDateString() === value.toDateString();
  };
  
  const isDateToday = (date: Date | null): boolean => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };
  
  const isDateDisabled = (date: Date | null): boolean => {
    if (!date || !minDate) return false;
    return date < minDate;
  };
  
  const handleDateClick = (date: Date | null): void => {
    if (date && !isDateDisabled(date)) {
      onChange(date);
    }
  };
  
  const navigateMonth = (direction: number): void => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };
  
  const renderMonth = (monthOffset: number = 0): React.ReactElement => {
    const monthDate = new Date(currentMonth);
    monthDate.setMonth(monthDate.getMonth() + monthOffset);
    const days = getDaysInMonth(monthDate);
    
    return (
      <div className="calendar-month">
        <div className="month-header">
          <h3 className="month-title">
            {monthNames[monthDate.getMonth()]} {monthDate.getFullYear()}
          </h3>
        </div>
        
        <div className="weekdays">
          {dayNames.map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>
        
        <div className="days-grid">
          {days.map((date, index) => (
            <div
              key={index}
              className={`day-cell ${date ? 'has-date' : ''} ${
                date && isDateSelected(date) ? 'selected' : ''
              } ${date && isDateToday(date) ? 'today' : ''} ${
                date && isDateDisabled(date) ? 'disabled' : ''
              }`}
              onClick={() => handleDateClick(date)}
            >
              {date && (
                <span className="day-number">
                  {date.getDate()}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <>
      <style>{`
        .airbnb-calendar {
          position: relative;
        }
        
        .calendar-header {
          position: relative;
          margin-bottom: 16px;
        }
        
        .nav-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #333;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }
        
        .nav-button:hover {
          background-color: #f5f5f5;
        }
        
        .nav-button.prev {
          left: -16px;
        }
        
        .nav-button.next {
          right: -16px;
        }
        
        .calendar-months {
          display: flex;
          gap: 40px;
          justify-content: center;
        }
        
        .calendar-month {
          width: 280px;
        }
        
        .month-header {
          margin-bottom: 16px;
        }
        
        .month-title {
          text-align: center;
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }
        
        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 8px;
          padding: 0 8px;
        }
        
        .weekday {
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: #666;
          padding: 8px 0;
        }
        
        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          padding: 0 8px;
        }
        
        .day-cell {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .day-cell.has-date {
          cursor: pointer;
        }
        
        .day-cell.disabled {
          cursor: not-allowed;
          opacity: 0.3;
        }
        
        .day-number {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .day-cell.has-date:not(.disabled) .day-number:hover {
          background-color: #f5f5f5;
        }
        
        .day-cell.today .day-number {
          font-weight: 600;
          background-color: #000;
          color: white;
        }
        
        .day-cell.selected .day-number {
          background-color: #000;
          color: white;
        }
        
        .day-cell.disabled .day-number {
          color: #ccc;
        }
      `}</style>
      
      <div className="airbnb-calendar">
        <div className="calendar-header">
          <button
            className="nav-button prev"
            onClick={() => navigateMonth(-1)}
            type="button"
          >
            ‹
          </button>
          <button
            className="nav-button next"
            onClick={() => navigateMonth(1)}
            type="button"
          >
            ›
          </button>
        </div>
        
        <div className="calendar-months">
          {renderMonth(0)}
          {renderMonth(1)}
        </div>
      </div>
    </>
  );
};

export default AirbnbCalendar;
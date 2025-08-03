import React, { useState, useRef, useEffect } from 'react';
import AirbnbCalendar from './AirbnbCalendar';

interface DatePopoverProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  placeholder?: string;
}

const DatePopover: React.FC<DatePopoverProps> = ({ 
  value, 
  onChange, 
  minDate, 
  placeholder = "Select a date" 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const formatDate = (date: Date | null): string => {
    if (!date) return placeholder;
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <>
      <style>{`
        .date-popover-container {
          position: relative;
          width: 100%;
        }
        
        .date-input-button {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 12px;
          background: #f8f9fa;
          color: #333;
          font-size: 14px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .date-input-button:hover {
          background: #e9ecef;
        }
        
        .date-input-button:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
        }
        
        .calendar-popover {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 8px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          padding: 24px;
          min-width: 600px;
        }
        
        @media (max-width: 768px) {
          .calendar-popover {
            min-width: 90vw;
            left: 0;
            transform: none;
            margin-left: 0;
            margin-right: 0;
          }
        }
      `}</style>
      
      <div className="date-popover-container" ref={containerRef}>
        <button
          type="button"
          className="date-input-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          {formatDate(value)}
        </button>
        
        {isOpen && (
          <div className="calendar-popover">
            <AirbnbCalendar
              value={value ? [value] : []}
              onChange={(dates: Date[]) => {
                const date = dates.length > 0 ? dates[0] : null;
                onChange(date);
                // Keep calendar open for better UX - user can close by clicking outside
              }}
              minDate={minDate}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default DatePopover;
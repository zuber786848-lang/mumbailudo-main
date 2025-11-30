import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const DateRangePicker = ({ onDateRangeChange }) => {
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      onDateRangeChange(dateRange);
    }
  }, [dateRange, onDateRangeChange]);

  const handleSelect = (date) => {
    if (!dateRange.from) {
      setDateRange({ from: date, to: null });
    } else if (dateRange.from && !dateRange.to) {
      if (date < dateRange.from) {
        setDateRange({ from: date, to: dateRange.from });
      } else {
        setDateRange({ ...dateRange, to: date });
      }
    } else {
      setDateRange({ from: date, to: null });
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const generateCalendar = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isSelected = (date) => {
    if (!date) return false;
    return (
      (dateRange.from && date.toDateString() === dateRange.from.toDateString()) ||
      (dateRange.to && date.toDateString() === dateRange.to.toDateString())
    );
  };

  const isInRange = (date) => {
    if (!date || !dateRange.from || !dateRange.to) return false;
    return date > dateRange.from && date < dateRange.to;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const setToday = () => {
    const today = new Date();
    setDateRange({ from: today, to: today });
    setIsOpen(false);
  };

  const calendarDays = generateCalendar(currentMonth.getFullYear(), currentMonth.getMonth());

  return (
    <div className="xl:w-1/3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <span className="flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2 text-gray-400" />
          {dateRange.from ? (
            dateRange.to ? ( 
              <>
                {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
              </>
            ) : (
              formatDate(dateRange.from)
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="flex justify-between items-center p-2 border-b">
            <button onClick={prevMonth} className="p-1">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={nextMonth} className="p-1">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="p-2">
            <div className="grid grid-cols-7 gap-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-center text-gray-600 text-sm">
                  {day}
                </div>
              ))}
              {calendarDays.map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && handleSelect(date)}
                  className={`
                    p-2 text-sm rounded-full
                    ${!date ? 'invisible' : ''}
                    ${isSelected(date) ? 'bg-indigo-600 text-white' : ''}
                    ${isInRange(date) ? 'bg-indigo-100' : ''}
                    ${date && !isSelected(date) && !isInRange(date) ? 'hover:bg-gray-100' : ''}
                  `}
                  disabled={!date}
                >
                  {date ? date.getDate() : ''}
                </button>
              ))}
            </div>
          </div>
          <div className="p-2 border-t flex justify-between">
            <button
              onClick={setToday}
              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Today
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
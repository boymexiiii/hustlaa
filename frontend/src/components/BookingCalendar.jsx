import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { bookingsAPI } from '../services/api';

export default function BookingCalendar({ artisanId, onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [currentDate, artisanId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getUpcomingRecurringBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const hasBooking = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split('T')[0];
    return bookings.some(b => b.booking_date.startsWith(dateStr));
  };

  const getBookingsForDay = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split('T')[0];
    return bookings.filter(b => b.booking_date.startsWith(dateStr));
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar size={28} className="text-primary-600" />
          Booking Calendar
        </h2>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronLeft size={24} />
        </button>
        <h3 className="text-xl font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          const dayBookings = day ? getBookingsForDay(day) : [];
          const hasEvent = day && dayBookings.length > 0;

          return (
            <div
              key={index}
              onClick={() => day && onSelectDate && onSelectDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
              className={`p-2 rounded-lg text-center cursor-pointer transition ${
                day
                  ? hasEvent
                    ? 'bg-primary-100 border-2 border-primary-600 font-semibold text-primary-900'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  : 'bg-gray-50'
              }`}
            >
              {day && (
                <>
                  <div className="text-sm font-medium">{day}</div>
                  {hasEvent && (
                    <div className="text-xs text-primary-600 mt-1">
                      {dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-100 border-2 border-primary-600 rounded"></div>
          <span>Has Bookings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 rounded"></div>
          <span>No Bookings</span>
        </div>
      </div>
    </div>
  );
}

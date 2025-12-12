import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { bookingsAPI } from '../services/api';

export default function BookingTimeline({ bookingId }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [bookingId]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getBookingTimeline(bookingId);
      setTimeline(response.data);
    } catch (error) {
      console.error('Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    const icons = {
      created: '📝',
      confirmed: '✅',
      started: '🚀',
      paused: '⏸️',
      resumed: '▶️',
      completed: '🎉',
      cancelled: '❌'
    };
    return icons[eventType] || '📌';
  };

  const getEventColor = (eventType) => {
    const colors = {
      created: 'bg-blue-50 border-blue-200',
      confirmed: 'bg-green-50 border-green-200',
      started: 'bg-purple-50 border-purple-200',
      paused: 'bg-yellow-50 border-yellow-200',
      resumed: 'bg-purple-50 border-purple-200',
      completed: 'bg-green-50 border-green-200',
      cancelled: 'bg-red-50 border-red-200'
    };
    return colors[eventType] || 'bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Clock size={28} className="text-primary-600" />
        Booking Timeline
      </h2>

      {timeline.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No timeline events yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {timeline.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline line */}
              {index < timeline.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
              )}

              {/* Event */}
              <div className={`border-l-4 rounded-lg p-4 ${getEventColor(event.event_type)}`}>
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0">{getEventIcon(event.event_type)}</div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {event.event_type.replace('_', ' ')}
                    </h3>
                    {event.description && (
                      <p className="text-gray-700 text-sm mt-1">{event.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span>{new Date(event.created_at).toLocaleString()}</span>
                      {event.first_name && (
                        <span>by {event.first_name} {event.last_name}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

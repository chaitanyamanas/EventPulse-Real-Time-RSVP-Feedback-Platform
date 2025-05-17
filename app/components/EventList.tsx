'use client';

import { useState, useEffect } from 'react';

interface Event {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
}

export function EventList({ userId }: { userId: string }) {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // TODO: Implement actual event fetching logic
    // For now, we'll use a mock event
    const mockEvent: Event = {
      id: '1',
      title: 'Test Event',
      description: 'This is a test event',
      dateTime: new Date().toISOString(),
      location: 'Test Location'
    };
    setEvents([mockEvent]);
  }, [userId]);

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
          <p className="text-gray-600 mb-2">{event.description}</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">{new Date(event.dateTime).toLocaleString()}</p>
              <p className="text-sm text-gray-500">{event.location}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

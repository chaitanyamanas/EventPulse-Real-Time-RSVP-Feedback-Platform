'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string;
  dateTime: Date;
  location: string;
  rsvpDeadline: Date;
  maxAttendees: number;
  status: 'SCHEDULED' | 'LIVE' | 'CLOSED';
  hostId: string;
  attendees: Array<{
    id: string;
    userId: string;
    status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN';
  }>;
}

interface EventListProps {
  userId: string;
  view?: 'hosting' | 'attending';
}

export default function EventList({ userId, view = 'attending' }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const endpoint = view === 'hosting' 
          ? `/api/events/hosting?userId=${userId}`
          : `/api/events/attending?userId=${userId}`;
        
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userId, view]);

  if (loading) {
    return <div className="text-center py-4">Loading events...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        {view === 'hosting' ? 'You are not hosting any events yet.' : 'You are not attending any events yet.'}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Link href={`/events/${event.id}`} key={event.id}>
          <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{event.description}</p>
            <div className="text-sm text-gray-500">
              <p>
                <span className="font-medium">Date:</span>{' '}
                {format(new Date(event.dateTime), 'PPP')}
              </p>
              <p>
                <span className="font-medium">Time:</span>{' '}
                {format(new Date(event.dateTime), 'p')}
              </p>
              <p>
                <span className="font-medium">Location:</span> {event.location}
              </p>
              <p>
                <span className="font-medium">RSVP Deadline:</span>{' '}
                {format(new Date(event.rsvpDeadline), 'PP')}
              </p>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span className={`px-2 py-1 rounded text-xs ${
                event.status === 'LIVE' 
                  ? 'bg-green-100 text-green-800'
                  : event.status === 'CLOSED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {event.status}
              </span>
              <span className="text-sm text-gray-500">
                {event.attendees.length}/{event.maxAttendees} attendees
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

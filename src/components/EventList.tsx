import { useState, useEffect } from "react";
import { format } from "date-fns";

interface EventListProps {
  userId: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  rsvpDeadline: string;
  maxAttendees: number | null;
  status: string;
}

export function EventList({ userId }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/events?hostId=${userId}`);
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userId]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-2">{event.description}</p>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-500">
                  {format(new Date(event.dateTime), "MMM d, yyyy HH:mm")}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  RSVP Deadline: {format(new Date(event.rsvpDeadline), "MMM d, yyyy HH:mm")}
                </span>
                {event.maxAttendees && (
                  <span className="text-sm text-gray-500">•</span>
                )}
                {event.maxAttendees && (
                  <span className="text-sm text-gray-500">
                    Max Attendees: {event.maxAttendees}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  event.status === "LIVE"
                    ? "bg-green-100 text-green-800"
                    : event.status === "SCHEDULED"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {event.status}
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              View Details
            </button>
            <button
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

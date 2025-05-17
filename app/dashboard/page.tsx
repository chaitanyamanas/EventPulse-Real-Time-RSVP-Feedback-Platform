import { useState } from "react";
import { useSession } from "next-auth/react";
import { EventForm } from "@/components/EventForm";
import { EventList } from "@/components/EventList";

export default function Dashboard() {
  const { data: session } = useSession();
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Events</h1>
        <button
          onClick={() => setShowCreateEvent(true)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Create Event
        </button>
      </div>

      {showCreateEvent && (
        <div className="mb-8">
          <EventForm onClose={() => setShowCreateEvent(false)} />
        </div>
      )}

      <EventList userId={session.user.id} />
    </div>
  );
}

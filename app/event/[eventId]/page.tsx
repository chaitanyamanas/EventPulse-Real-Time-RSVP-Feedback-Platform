'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import type { Event } from "@/lib/types";

interface EventPageProps {
  params: {
    id: string;
  };
}

export default function EventPage({ params }: EventPageProps) {
  const { data: session } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [rsvped, setRsvped] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [emoji, setEmoji] = useState("");
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvent = async () => {
      const response = await fetch(`/api/events/${params.id}`);
      const data = await response.json();
      setEvent(data);
    };

    const fetchRSVPStatus = async () => {
      if (session?.user?.id) {
        const response = await fetch(`/api/events/${params.id}/rsvp`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setRsvped(data.rsvped);
        setCheckedIn(data.checkedIn);
      }
    };

    fetchEvent();
    fetchRSVPStatus();
  }, [params.id, session?.user?.id]);

  const handleRSVP = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/events/${params.id}/rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session.user.id }),
      });

      if (response.ok) {
        setRsvped(true);
      }
    } catch (error) {
      console.error("Error RSVPing:", error);
    }
  };

  const handleCheckIn = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/events/${params.id}/check-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session.user.id }),
      });

      if (response.ok) {
        setCheckedIn(true);
      }
    } catch (error) {
      console.error("Error checking in:", error);
    }
  };

  const handleFeedback = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/events/${params.id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          content: feedback,
          emoji,
        }),
      });

      if (response.ok) {
        setFeedback("");
        setEmoji("");
        // Refresh feedbacks
        const feedbackResponse = await fetch(`/api/events/${params.id}/feedback`);
        const feedbackData = await feedbackResponse.json();
        setFeedbacks(feedbackData);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  if (!event) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm text-gray-500">
                {format(new Date(event.dateTime), "MMM d, yyyy HH:mm")}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
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
          {event.status === "LIVE" && (
            <div className="flex items-center gap-4">
              {!rsvped ? (
                <button
                  onClick={handleRSVP}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  RSVP
                </button>
              ) : !checkedIn ? (
                <button
                  onClick={handleCheckIn}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Check In
                </button>
              ) : null}
            </div>
          )}
        </div>

        {event.status === "LIVE" && checkedIn && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Live Feedback</h2>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Share your thoughts..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Emoji</option>
                <option value="👍">👍</option>
                <option value="👎">👎</option>
                <option value="❤️">❤️</option>
                <option value="😮">😮</option>
              </select>
              <button
                onClick={handleFeedback}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Send
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-600 text-sm">
                        {feedback.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {feedback.emoji && (
                          <span className="text-2xl">{feedback.emoji}</span>
                        )}
                        <span className="text-xs text-gray-500">
                          {format(new Date(feedback.createdAt), "HH:mm")}
                        </span>
                      </div>
                    </div>
                    {feedback.pinned && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Pinned
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

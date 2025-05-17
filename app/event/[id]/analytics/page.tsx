import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

interface AnalyticsPageProps {
  params: {
    id: string;
  };
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { data: session } = useSession();
  const [event, setEvent] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvent = async () => {
      const response = await fetch(`/api/events/${params.id}`);
      const data = await response.json();
      setEvent(data);
    };

    const fetchRSVPs = async () => {
      const response = await fetch(`/api/events/${params.id}/rsvps`);
      const data = await response.json();
      setRsvps(data);
    };

    const fetchFeedbacks = async () => {
      const response = await fetch(`/api/events/${params.id}/feedback`);
      const data = await response.json();
      setFeedbacks(data);
    };

    fetchEvent();
    fetchRSVPs();
    fetchFeedbacks();
  }, [params.id]);

  if (!event) {
    return <div className="text-center py-8">Loading...</div>;
  }

  // Calculate RSVP statistics
  const rsvpStats = rsvps.reduce((acc: { total: number; checkedIn: number }, rsvp) => {
    acc.total++;
    if (rsvp.checkedIn) acc.checkedIn++;
    return acc;
  }, { total: 0, checkedIn: 0 });

  // Calculate emoji frequencies
  const emojiCounts = feedbacks.reduce((acc: Record<string, number>, feedback) => {
    if (feedback.emoji) {
      acc[feedback.emoji] = (acc[feedback.emoji] || 0) + 1;
    }
    return acc;
  }, {});

  // Prepare data for charts
  const rsvpTimelineData = {
    labels: rsvps.map((rsvp) => format(new Date(rsvp.createdAt), "HH:mm")),
    datasets: [
      {
        label: "RSVPs",
        data: rsvps.map(() => 1),
        borderColor: "rgb(79, 70, 229)",
        tension: 0.1,
      },
    ],
  };

  const emojiData = {
    labels: Object.keys(emojiCounts),
    datasets: [
      {
        data: Object.values(emojiCounts),
        backgroundColor: [
          "rgba(79, 70, 229, 0.5)",
          "rgba(59, 130, 246, 0.5)",
          "rgba(239, 68, 68, 0.5)",
          "rgba(16, 185, 129, 0.5)",
        ],
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Event Analytics</h1>
            <p className="text-gray-600">{event.title}</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Total RSVPs:</span>
                <span className="font-semibold">{rsvpStats.total}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Checked In:</span>
                <span
                  className={`font-semibold ${
                    rsvpStats.checkedIn / rsvpStats.total >= 0.7
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {rsvpStats.checkedIn}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">RSVP Timeline</h2>
            <Line data={rsvpTimelineData} />
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Emoji Reactions</h2>
            <Bar data={emojiData} />
          </div>

          <div className="col-span-full bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Top Feedback</h2>
            <div className="space-y-4">
              {feedbacks
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .slice(0, 5)
                .map((feedback) => (
                  <div key={feedback.id} className="p-4 bg-white rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-600">{feedback.content}</p>
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
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Analytics {
  event: any;
  totalRSVPs: number;
  checkedInCount: number;
  reactionCounts: {
    THUMBS_UP?: number;
    THUMBS_DOWN?: number;
    HEART?: number;
    SURPRISE?: number;
  };
  feedback: any[];
}

export default function EventAnalytics({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/events/${params.eventId}/analytics`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError('Failed to load analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchAnalytics();
    }
  }, [params.eventId, session]);

  if (!session || (session.user.role !== 'HOST' && session.user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">You don't have permission to view analytics.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-medium">Loading analytics...</div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || 'Failed to load analytics'}</div>
      </div>
    );
  }

  const feedbackOverTime = {
    labels: analytics.feedback
      .map(f => new Date(f.createdAt).toLocaleDateString())
      .filter((date, index, self) => self.indexOf(date) === index),
    datasets: [
      {
        label: 'Feedback Volume',
        data: analytics.feedback.reduce((acc: any, f) => {
          const date = new Date(f.createdAt).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {}),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">{analytics.event.title} - Analytics</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800">Total RSVPs</h3>
              <p className="text-3xl font-bold text-blue-900">{analytics.totalRSVPs}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-800">Checked In</h3>
              <p className="text-3xl font-bold text-green-900">{analytics.checkedInCount}</p>
              <p className="text-sm text-green-700">
                ({((analytics.checkedInCount / analytics.totalRSVPs) * 100).toFixed(1)}% attendance)
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-purple-800">Feedback Count</h3>
              <p className="text-3xl font-bold text-purple-900">{analytics.feedback.length}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Feedback Over Time</h2>
            <div className="h-64">
              <Line
                data={feedbackOverTime}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Reactions Summary</h2>
            <div className="flex space-x-4">
              {Object.entries(analytics.reactionCounts).map(([reaction, count]) => (
                <div key={reaction} className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-2xl">{
                    reaction === 'THUMBS_UP' ? '👍' :
                    reaction === 'THUMBS_DOWN' ? '👎' :
                    reaction === 'HEART' ? '❤️' :
                    reaction === 'SURPRISE' ? '😮' : ''
                  }</span>
                  <p className="text-lg font-bold">{count}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Recent Feedback</h2>
            <div className="space-y-4">
              {analytics.feedback.slice(0, 5).map((f: any) => (
                <div key={f.id} className="border rounded-lg p-4">
                  <p className="text-gray-600">{f.comment}</p>
                  {f.reaction && (
                    <span className="text-2xl">
                      {f.reaction === 'THUMBS_UP' ? '👍' :
                       f.reaction === 'THUMBS_DOWN' ? '👎' :
                       f.reaction === 'HEART' ? '❤️' :
                       f.reaction === 'SURPRISE' ? '😮' : ''}
                    </span>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(f.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
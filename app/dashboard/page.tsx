'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  rsvpDeadline: string;
  maxAttendees: number;
  status: 'SCHEDULED' | 'LIVE' | 'CLOSED';
  currentAttendees: number;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [directUser, setDirectUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mockEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Tech Conference 2024',
      description: 'Annual technology conference',
      dateTime: '2024-04-01T09:00:00Z',
      location: 'Virtual',
      rsvpDeadline: '2024-03-25T00:00:00Z',
      maxAttendees: 200,
      status: 'SCHEDULED',
      currentAttendees: 150
    },
    {
      id: '2',
      title: 'Workshop: React Best Practices',
      description: 'Learn React best practices',
      dateTime: '2024-03-20T14:00:00Z',
      location: 'Conference Room A',
      rsvpDeadline: '2024-03-18T00:00:00Z',
      maxAttendees: 50,
      status: 'LIVE',
      currentAttendees: 45
    }
  ]);
  
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        setDirectUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user from session storage", e);
      }
    }
    setLoading(false);
  }, []);
  
  useEffect(() => {
    if (status === 'unauthenticated' && !directUser) {
      router.push('/auth/login');
    }
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status, router, directUser]);

  const handleSignOut = () => {
    if (directUser) {
      sessionStorage.removeItem('user');
      setDirectUser(null);
    }
    if (session) {
      signOut({ callbackUrl: '/' });
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-medium">Loading...</div>
      </div>
    );
  }

  const user = session?.user || directUser;
  const authMethod = session ? "NextAuth" : directUser ? "Direct Login" : null;

  if (!user) {
    return null;
  }

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'events':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">My Events</h3>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                Create New Event
              </button>
            </div>
            <div className="grid gap-4">
              {mockEvents.map(event => (
                <div key={event.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <p className="text-sm">Date: {new Date(event.dateTime).toLocaleDateString()}</p>
                      <p className="text-sm">Location: {event.location}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      event.status === 'LIVE' ? 'bg-green-100 text-green-800 animate-pulse' :
                      event.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between items-center text-sm">
                    <span>Attendees: {event.currentAttendees}/{event.maxAttendees}</span>
                    <button className="text-blue-500 hover:underline">Manage Event</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'rsvp':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">My RSVPs</h3>
            <div className="grid gap-4">
              {mockEvents.map(event => (
                <div key={event.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(event.dateTime).toLocaleDateString()}
                      </p>
                    </div>
                    {event.status === 'LIVE' && (
                      <button className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600">
                        Check In
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'feedback':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Live Feedback</h3>
            <div className="grid gap-4">
              {mockEvents.filter(e => e.status === 'LIVE').map(event => (
                <div key={event.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <h4 className="font-semibold">{event.title}</h4>
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded">👍</button>
                      <button className="p-2 hover:bg-gray-100 rounded">👎</button>
                      <button className="p-2 hover:bg-gray-100 rounded">❤️</button>
                      <button className="p-2 hover:bg-gray-100 rounded">😮</button>
                    </div>
                    <textarea
                      placeholder="Share your feedback..."
                      className="w-full p-2 border rounded-lg"
                      rows={3}
                    />
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                      Send Feedback
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Analytics & Reports</h3>
            <div className="grid gap-4">
              {mockEvents.filter(e => e.status === 'CLOSED').map(event => (
                <div key={event.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <h4 className="font-semibold">{event.title}</h4>
                  <div className="mt-3 space-y-2">
                    <p>Attendance Rate: {((event.currentAttendees / event.maxAttendees) * 100).toFixed(1)}%</p>
                    <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
                      [Feedback Analytics Chart]
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">👍 45</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">❤️ 32</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">😮 12</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Dashboard Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium">Upcoming Events</h4>
                <p className="text-2xl font-bold mt-2">
                  {mockEvents.filter(e => e.status === 'SCHEDULED').length}
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-green-50">
                <h4 className="font-medium">Live Events</h4>
                <p className="text-2xl font-bold mt-2">
                  {mockEvents.filter(e => e.status === 'LIVE').length}
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-purple-50">
                <h4 className="font-medium">Total RSVPs</h4>
                <p className="text-2xl font-bold mt-2">
                  {mockEvents.reduce((acc, curr) => acc + curr.currentAttendees, 0)}
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">EventPulse</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`${
                    activeTab === 'dashboard'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`${
                    activeTab === 'events'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Events
                </button>
                <button
                  onClick={() => setActiveTab('rsvp')}
                  className={`${
                    activeTab === 'rsvp'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  RSVPs
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`${
                    activeTab === 'feedback'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Feedback
                </button>
                {(user.role === 'HOST' || user.role === 'ADMIN') && (
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`${
                      activeTab === 'analytics'
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Analytics
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">
                {user.email} ({user.role})
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderDashboardContent()}
      </main>
    </div>
  );
}

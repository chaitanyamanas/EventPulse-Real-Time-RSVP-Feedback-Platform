import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome to EventPulse</h1>
        <p className="text-xl text-gray-600 mb-8">
          The real-time RSVP and feedback platform for your events
        </p>
        
        <div className="flex flex-col items-center mb-10">
          <p className="mb-6 text-lg border-l-4 border-indigo-500 pl-4 bg-indigo-50 p-3 text-left">
            <strong>Test Accounts:</strong> <br />
            • Regular User: <code className="bg-gray-100 px-1">test@example.com</code> / <code className="bg-gray-100 px-1">test1234</code><br />
            • Host: <code className="bg-gray-100 px-1">host@example.com</code> / <code className="bg-gray-100 px-1">test1234</code><br />
            • Admin: <code className="bg-gray-100 px-1">admin@example.com</code> / <code className="bg-gray-100 px-1">test1234</code>
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Register
          </Link>
          <Link
            href="/auth/direct-login"
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Direct Login (For Testing)
          </Link>
        </div>
      </div>
      
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl">
          <div className="p-4">
            <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-indigo-600 font-bold">1</span>
            </div>
            <h3 className="font-medium text-lg mb-2">Create Events</h3>
            <p className="text-gray-600">Easily create and manage your events with our intuitive interface</p>
          </div>
          <div className="p-4">
            <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-indigo-600 font-bold">2</span>
            </div>
            <h3 className="font-medium text-lg mb-2">Send Invitations</h3>
            <p className="text-gray-600">Share your event with attendees with just a few clicks</p>
          </div>
          <div className="p-4">
            <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-indigo-600 font-bold">3</span>
            </div>
            <h3 className="font-medium text-lg mb-2">Collect Feedback</h3>
            <p className="text-gray-600">Get real-time responses and feedback from your attendees</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    // If user is logged in, redirect to dashboard
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to EventPulse
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your real-time RSVP and feedback platform for events
          </p>

          <div className="flex justify-center gap-6">
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Register
            </Link>
          </div>

          <div className="mt-8">
            <Link
              href="/test"
              className="text-blue-500 hover:text-blue-600"
            >
              Go to Test Page
            </Link>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2">Event Management</h3>
                <p>Create and manage your events with ease</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2">Real-time RSVP</h3>
                <p>Track RSVPs in real-time with instant updates</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-2">Live Feedback</h3>
                <p>Get instant feedback from your attendees</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

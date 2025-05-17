'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DirectLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setDebugInfo(null);

    try {
      console.log("Attempting direct login with:", { email });
      
      const res = await fetch('/api/login-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      console.log("Login response:", data);
      setDebugInfo(data);
      
      if (!res.ok || !data.success) {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Store user in sessionStorage for demo purposes
      sessionStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error("Login error:", err);
      setDebugInfo(err);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for test user login
  const loginAsTestUser = (userEmail: string) => {
    setEmail(userEmail);
    setPassword("test1234");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Direct Login (Bypasses NextAuth)
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Alternative login method for testing
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => loginAsTestUser("test@example.com")}
            className="text-xs p-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Regular User
          </button>
          <button 
            onClick={() => loginAsTestUser("host@example.com")}
            className="text-xs p-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Host User
          </button>
          <button 
            onClick={() => loginAsTestUser("admin@example.com")}
            className="text-xs p-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Admin User
          </button>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>All test accounts use password: test1234</p>
          </div>
          
          <div className="text-xs text-center mt-2">
            <a href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
              Try standard NextAuth login instead
            </a>
          </div>
        </form>
        
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs overflow-auto max-h-48">
            <p className="font-bold">Debug Info:</p>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 
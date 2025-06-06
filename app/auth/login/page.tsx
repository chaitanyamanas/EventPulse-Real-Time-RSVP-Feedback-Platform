'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      
      console.log("Attempting login with:", { email, callbackUrl });
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      console.log("Login result:", result);
      setDebugInfo(result);

      if (result?.error) {
        setError(`Login failed: ${result.error}`);
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use one of our test accounts or create your own
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
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Register now
          </a>
        </p>
        
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

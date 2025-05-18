'use client';

import { useSession } from 'next-auth/react';

export default function DebugPage() {
  const { data: session, status } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Session Status: {status}</h2>
        <pre className="whitespace-pre-wrap bg-white p-4 rounded border">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
} 
'use client';

import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginButtonClient() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      Sign In
    </button>
  );
}

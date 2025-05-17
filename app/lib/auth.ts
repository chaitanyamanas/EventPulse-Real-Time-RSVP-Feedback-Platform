import NextAuth from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SessionStrategy } from "next-auth";
import bcrypt from 'bcryptjs';
import { JWT } from 'next-auth/jwt';

// Extend the session and JWT types to include role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
    }
  }
  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: string;
  }
}

// Test users - hardcoded to bypass database issues
// Using plain passwords for testing - in a real app these would be hashed
const testUsers = [
  {
    id: "user-1",
    email: "test@example.com",
    password: "test1234", // Plain password for easier testing
    name: "Test User",
    role: "USER"
  },
  {
    id: "host-1",
    email: "host@example.com",
    password: "test1234", // Plain password for easier testing
    name: "Host User",
    role: "HOST"
  },
  {
    id: "admin-1",
    email: "admin@example.com",
    password: "test1234", // Plain password for easier testing
    name: "Admin User",
    role: "ADMIN"
  }
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log("[Auth Debug] Starting authorization for:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth Debug] Missing credentials");
          return null;
        }

        // Find user in our test users
        const user = testUsers.find(user => user.email === credentials.email);

        if (!user) {
          console.log("[Auth Debug] User not found:", credentials.email);
          return null;
        }

        // For testing purposes, do direct password comparison
        const isCorrectPassword = user.password === credentials.password;

        console.log("[Auth Debug] Password check:", isCorrectPassword ? "Success" : "Failed");

        if (!isCorrectPassword) {
          console.log("[Auth Debug] Password mismatch for:", credentials.email);
          return null;
        }

        console.log("[Auth Debug] Authentication successful for:", credentials.email);
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    signOut: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("[Auth Debug] JWT Callback:", { tokenEmail: token.email, userEmail: user?.email });
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[Auth Debug] Session Callback:", { sessionEmail: session.user?.email, tokenEmail: token.email });
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("[Auth Debug] Redirect Callback:", { url, baseUrl });
      
      // Always redirect to dashboard after successful sign in
      if (url.includes('/auth/login') || url === baseUrl) {
        console.log("[Auth Debug] Redirecting to dashboard");
        return `${baseUrl}/dashboard`;
      }

      // For relative URLs, append to base URL
      if (url.startsWith('/')) {
        console.log("[Auth Debug] Handling relative URL");
        return `${baseUrl}${url}`;
      }

      // For same-origin URLs, use them directly
      if (url.startsWith(baseUrl)) {
        console.log("[Auth Debug] Using same-origin URL");
        return url;
      }

      // Default to dashboard
      console.log("[Auth Debug] Using default redirect to dashboard");
      return `${baseUrl}/dashboard`;
    },
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET || 'secretkey12345678901234567890',
  logger: {
    error(code, ...message) {
      console.error('[Auth Error]', code, message);
    },
    warn(code, ...message) {
      console.warn('[Auth Warning]', code, message);
    },
    debug(code, ...message) {
      console.log('[Auth Debug]', code, message);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Mock database functions
export async function createUser({ email, password, name }: { email: string; password: string; name: string }) {
  // In a real app, this would create a user in the database
  // For now, just return a mock user
  return {
    id: `user-${Date.now()}`,
    email,
    name,
    role: "USER",
  };
}

export async function getUserByEmail(email: string) {
  // In a real app, this would find a user in the database
  // For now, just return from our test users
  return testUsers.find(user => user.email === email) || null;
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
) {
  // For test users, we're using direct comparison
  if (testUsers.some(u => u.password === hashedPassword)) {
    return password === hashedPassword;
  }
  // For regular users, use bcrypt
  return await bcrypt.compare(password, hashedPassword);
}

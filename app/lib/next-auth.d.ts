import "next-auth";
import { DefaultSession } from "next-auth";

// Extend the default session type to include our custom properties
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
}

// Extend the JWT type to include our custom properties
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
  }
}

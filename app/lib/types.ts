import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

interface User {
  id: string;
  email: string;
  name?: string | null;
}

interface Token extends JWT {
  id: string;
  email: string;
}

interface Session extends DefaultSession {
  user: User & {
    id: string;
    email: string;
  };
}

export type { User, Token, Session }

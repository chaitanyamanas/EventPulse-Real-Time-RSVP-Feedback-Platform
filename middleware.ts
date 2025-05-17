import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
# Remove the existing migrations directory
rm -rf prisma/migrations

# Create a new one
mkdir -p prisma/migrations

# Generate a new migration
DATABASE_URL="postgresql://eventpulse_user:eventpulse_password@localhost:5432/eventpulse" npx prisma migrate dev --name init
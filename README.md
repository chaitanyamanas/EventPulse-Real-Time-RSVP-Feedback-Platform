# EventPulse - Real-Time RSVP & Feedback Platform

A modern web application for event management with real-time RSVP tracking and feedback collection.

## Features

- User authentication and authorization
- Event creation and management
- Real-time RSVP tracking
- Event check-in system
- Live feedback stream with emoji reactions
- Analytics dashboard for event hosts
- Mobile-responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Chart.js
- Socket.io (for real-time updates)

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the root directory with:
```
DATABASE_URL="postgresql://user:password@localhost:5432/eventpulse"
NEXTAUTH_SECRET="your-secret-key-here"
```

3. Initialize the database:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   ├── event/
│   │   ├── [id]/
│   │   │   ├── analytics/
│   │   └── check-in/
│   └── api/
│       ├── events/
│       │   ├── [id]/
│       │   │   ├── rsvp/
│       │   │   ├── check-in/
│       │   │   └── feedback/
├── components/
├── lib/
├── prisma/
└── public/
```

## API Endpoints

- `POST /api/events` - Create a new event
- `GET /api/events` - List events for authenticated user
- `POST /api/events/[id]/rsvp` - RSVP to an event
- `POST /api/events/[id]/check-in` - Check-in to an event
- `POST /api/events/[id]/feedback` - Submit feedback
- `GET /api/events/[id]/analytics` - Get event analytics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

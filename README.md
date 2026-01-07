# AI-Powered Restaurant Reservation Agent MVP

An AI-driven restaurant reservation aggregator that lets users enter natural language queries and returns available bookings from multiple platforms.

## Project Structure

```
/ai-reservation-agent/
├── backend/      # Node.js backend (Express + TypeScript)
│   ├── src/
│   │   ├── adapters/        # Platform adapters (OpenTable, Resy, etc.)
│   │   ├── services/        # Core logic (parsing, aggregation, ranking)
│   │   ├── routes/          # Express route handlers
│   │   ├── utils/           # Utilities (Redis cache, mailer, etc.)
│   │   └── prisma/          # Prisma schema and DB client
│   ├── package.json
│   └── tsconfig.json
└── frontend/    # Next.js 14 frontend (React + Tailwind + shadcn)
    ├── app/              # Next.js App Router pages
    ├── components/       # Reusable UI components
    ├── package.json
    └── tailwind.config.js
```

## Tech Stack

### Backend
- Node.js with TypeScript
- Express.js
- Redis (caching)
- Prisma + PostgreSQL (persistence)
- Puppeteer (web scraping)
- Nodemailer (email notifications)
- Chrono (natural language date parsing)

### Frontend
- Next.js 14 (App Router)
- React
- Tailwind CSS
- shadcn/ui components

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up database:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Features

- **Natural Language Query Parsing**: Enter queries like "Dinner for 2 tomorrow 7pm sushi in Lincoln Park"
- **Multi-Platform Search**: Aggregates results from OpenTable, Resy, Yelp, Tock, and Google Reserve
- **Smart Ranking**: Results ranked by proximity, rating, and vibe match
- **One-Click Booking**: Direct links to reservation platforms
- **Email Confirmations**: Automated email notifications after booking

## API Endpoints

### GET /api/search
Search for restaurant reservations.

**Query Parameters:**
- `query`: Natural language search query (e.g., "Dinner for 2 tomorrow 7pm sushi in Lincoln Park")

**Response:**
```json
{
  "results": [
    {
      "name": "Sushi Nakazawa",
      "platform": "OpenTable",
      "dateTime": "2025-12-20T19:00:00",
      "partySize": 2,
      "cuisine": "Sushi",
      "location": "Lincoln Park, Chicago, IL",
      "rating": 4.8,
      "bookingLink": "https://www.opentable.com/..."
    }
  ]
}
```

### POST /api/book
Initiate a booking (currently redirects to platform booking page).

**Request Body:**
```json
{
  "platform": "OpenTable",
  "restaurantId": "...",
  "dateTime": "2025-12-20T19:00:00",
  "partySize": 2,
  "userContact": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

## Development Notes

- Some adapters use mock data for MVP (see TODO comments in code)
- Redis caching is implemented with 10-minute TTL
- Email notifications use Nodemailer (configure SMTP in .env)
- Web scraping uses Puppeteer (be mindful of rate limits)

## Future Enhancements

- Full NLP model integration for better query parsing
- Complete auto-booking workflow (currently redirects)
- User authentication and saved preferences
- Real-time availability updates
- Advanced filtering and sorting options



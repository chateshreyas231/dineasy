# Backend - Reservation Agent API

Node.js/TypeScript backend server for the AI-powered restaurant reservation agent.

## Structure

```
backend/
├── src/
│   ├── adapters/          # Platform-specific adapters (OpenTable, Resy, etc.)
│   ├── services/          # Core business logic (parsing, ranking, aggregation)
│   ├── routes/            # Express route handlers
│   ├── utils/             # Utilities (cache, mailer, db)
│   ├── types/             # TypeScript type definitions
│   └── index.ts           # Main server entry point
├── prisma/                # Prisma schema and migrations
└── package.json
```

## Key Components

### Adapters (`src/adapters/`)
Platform-specific modules that search for reservations:
- `openTableAdapter.ts` - OpenTable integration (Puppeteer scraping)
- `resyAdapter.ts` - Resy integration (TODO: implement scraping)
- `yelpAdapter.ts` - Yelp integration (TODO: implement API)
- `tockAdapter.ts` - Tock integration (TODO: implement scraping)
- `googleReserveAdapter.ts` - Google Reserve integration (TODO: implement)

### Services (`src/services/`)
- `queryParser.ts` - Parses natural language queries into structured intents
- `reservationService.ts` - Aggregates and ranks results from all platforms

### Routes (`src/routes/`)
- `search.ts` - GET /api/search - Search for reservations
- `book.ts` - POST /api/book - Handle booking requests

### Utils (`src/utils/`)
- `cache.ts` - Redis caching for search results
- `mailer.ts` - Email notifications via Nodemailer
- `db.ts` - Prisma database client

## API Endpoints

### GET /api/search
Search for restaurant reservations.

**Query Parameters:**
- `query` (string, required): Natural language search query

**Example:**
```bash
curl "http://localhost:3001/api/search?query=Dinner%20for%202%20tomorrow%207pm%20sushi%20in%20Lincoln%20Park"
```

**Response:**
```json
{
  "results": [
    {
      "name": "Sushi Nakazawa",
      "platform": "OpenTable",
      "dateTime": "2025-12-20T19:00:00.000Z",
      "partySize": 2,
      "cuisine": "Sushi",
      "location": "Lincoln Park",
      "rating": 4.8,
      "bookingLink": "https://www.opentable.com/..."
    }
  ],
  "query": "Dinner for 2 tomorrow 7pm sushi in Lincoln Park",
  "parsedIntent": {
    "partySize": 2,
    "dateTime": "2025-12-20T19:00:00.000Z",
    "cuisine": "Sushi",
    "location": "Lincoln Park",
    "occasion": "dinner"
  },
  "timestamp": "2025-12-19T12:00:00.000Z"
}
```

### POST /api/book
Initiate a booking.

**Request Body:**
```json
{
  "platform": "OpenTable",
  "restaurantName": "Sushi Nakazawa",
  "dateTime": "2025-12-20T19:00:00.000Z",
  "partySize": 2,
  "bookingLink": "https://www.opentable.com/...",
  "userContact": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Redirecting to booking page",
  "redirectUrl": "https://www.opentable.com/..."
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations
npx prisma studio        # Open Prisma Studio
```

## Environment Variables

See `.env.example` for all required environment variables.

## Notes

- Most adapters currently return sample/mock data for MVP
- Puppeteer scraping is implemented but commented out (requires proper selectors)
- Redis caching is optional but recommended
- Email notifications require SMTP configuration



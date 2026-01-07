# Project Structure

Complete overview of the AI-Powered Restaurant Reservation Agent MVP codebase.

## Root Directory

```
dineasy/
├── backend/              # Node.js/TypeScript backend
├── frontend/            # Next.js 14 frontend
├── README.md            # Main project documentation
├── SETUP.md             # Detailed setup instructions
├── QUICKSTART.md        # Quick start guide
├── PROJECT_STRUCTURE.md # This file
├── package.json         # Root workspace config
└── .gitignore          # Git ignore rules
```

## Backend Structure

```
backend/
├── src/
│   ├── index.ts                    # Express server entry point
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   ├── services/
│   │   ├── queryParser.ts          # Natural language query parsing
│   │   └── reservationService.ts   # Aggregation & ranking service
│   ├── adapters/                   # Platform-specific adapters
│   │   ├── baseAdapter.ts          # Base adapter interface
│   │   ├── openTableAdapter.ts     # OpenTable integration
│   │   ├── resyAdapter.ts          # Resy integration
│   │   ├── yelpAdapter.ts          # Yelp integration
│   │   ├── tockAdapter.ts          # Tock integration
│   │   └── googleReserveAdapter.ts # Google Reserve integration
│   ├── routes/
│   │   ├── search.ts               # GET /api/search endpoint
│   │   └── book.ts                 # POST /api/book endpoint
│   └── utils/
│       ├── cache.ts                # Redis caching utility
│       ├── mailer.ts               # Email notification service
│       └── db.ts                   # Prisma database client
├── prisma/
│   └── schema.prisma               # Database schema
├── package.json
├── tsconfig.json
└── README.md
```

## Frontend Structure

```
frontend/
├── app/
│   ├── layout.tsx       # Root layout component
│   ├── page.tsx        # Home/search page
│   └── globals.css      # Global styles & Tailwind config
├── components/
│   ├── ui/             # shadcn/ui components
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── SearchBar.tsx    # Search input component
│   └── RestaurantCard.tsx # Restaurant result card
├── lib/
│   └── utils.ts         # Utility functions (cn helper)
├── types/
│   └── index.ts        # TypeScript types (matches backend)
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Key Files Explained

### Backend

**`src/index.ts`**
- Main Express server setup
- CORS configuration
- Route registration
- Error handling middleware

**`src/services/queryParser.ts`**
- Parses natural language queries
- Uses Chrono for date/time parsing
- Extracts party size, cuisine, location, occasion, vibe

**`src/services/reservationService.ts`**
- Orchestrates multi-platform search
- Deduplicates results
- Filters by intent
- Ranks results by score

**`src/adapters/*.ts`**
- Each adapter implements `PlatformAdapter` interface
- `searchAvailability()` method returns `RestaurantOption[]`
- Currently use sample data for MVP
- TODO comments indicate where to add real scraping

**`src/routes/search.ts`**
- Handles GET /api/search
- Parses query, checks cache, searches platforms
- Returns ranked results

**`src/routes/book.ts`**
- Handles POST /api/book
- Logs booking to database
- Sends confirmation email
- Returns redirect URL

**`src/utils/cache.ts`**
- Redis caching for search results
- Cache key based on query intent
- 10-minute TTL by default

**`src/utils/mailer.ts`**
- Nodemailer email service
- Sends booking confirmation emails
- HTML and plain text templates

**`prisma/schema.prisma`**
- Database schema definition
- Reservation model for logging bookings

### Frontend

**`app/page.tsx`**
- Main search page component
- Handles search submission
- Displays results or loading/error states
- Calls backend API

**`components/SearchBar.tsx`**
- Search input form
- Loading state handling
- Form validation

**`components/RestaurantCard.tsx`**
- Displays restaurant information
- Shows rating, location, cuisine, vibe tags
- "Book Now" button with external link

**`components/ui/*.tsx`**
- Reusable UI components
- Follows shadcn/ui patterns
- Tailwind CSS styling

## Data Flow

1. **User enters query** → Frontend `SearchBar`
2. **Query submitted** → Frontend calls `/api/search?query=...`
3. **Backend parses query** → `queryParser.ts` creates `QueryIntent`
4. **Check cache** → Redis lookup (if available)
5. **Search platforms** → All adapters run in parallel
6. **Aggregate & rank** → `reservationService.ts` processes results
7. **Return results** → JSON response to frontend
8. **Display results** → `RestaurantCard` components render
9. **User clicks "Book"** → Opens booking link or calls `/api/book`
10. **Log booking** → Database entry + email confirmation

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL/SQLite connection string
- `REDIS_URL` - Redis connection string (optional)
- `SMTP_*` - Email configuration (optional)
- `FRONTEND_URL` - CORS origin

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Dependencies

### Backend
- `express` - Web framework
- `typescript` - Type safety
- `prisma` - Database ORM
- `redis` - Caching
- `puppeteer` - Web scraping
- `chrono-node` - Date parsing
- `nodemailer` - Email sending

### Frontend
- `next` - React framework
- `react` - UI library
- `tailwindcss` - Styling
- `lucide-react` - Icons

## Development Workflow

1. **Backend**: `cd backend && npm run dev`
2. **Frontend**: `cd frontend && npm run dev`
3. **Database**: `npx prisma studio` (in backend directory)
4. **Testing**: Use browser at http://localhost:3000

## TODO / Future Enhancements

- [ ] Implement full Puppeteer scraping for all adapters
- [ ] Add real API integrations (Yelp Fusion, Google Places)
- [ ] Enhance NLP query parsing (use AI model)
- [ ] Implement auto-booking workflow (beyond redirects)
- [ ] Add user authentication
- [ ] Real-time availability updates
- [ ] Advanced filtering and sorting
- [ ] Mobile app (React Native)
- [ ] Analytics and tracking

## Notes

- Most adapters use sample data for MVP
- Scraping code is scaffolded but needs proper selectors
- Email notifications require SMTP setup
- Redis is optional but recommended
- Database can use SQLite for development



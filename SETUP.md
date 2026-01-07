# Setup Guide

This guide will help you set up the AI-Powered Restaurant Reservation Agent MVP.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or use SQLite for development)
- Redis server (optional but recommended for caching)
- SMTP email account (for email notifications - Gmail works)

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up Backend

```bash
cd backend
```

Create a `.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/reservation_agent?schema=public"

# Or use SQLite for easier development:
# DATABASE_URL="file:./dev.db"

# Redis (optional - app will work without it, just no caching)
REDIS_URL="redis://localhost:6379"
REDIS_TTL=600

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@reservationagent.com

# Platform API Keys (optional for MVP)
OPENTABLE_API_KEY=
RESY_API_KEY=
YELP_API_KEY=
GOOGLE_PLACES_API_KEY=

# CORS
FRONTEND_URL=http://localhost:3000
```

Set up the database:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 3. Set Up Frontend

```bash
cd frontend
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Testing the Application

1. Open http://localhost:3000 in your browser
2. Try a search query like: "Dinner for 2 tomorrow 7pm sushi in Lincoln Park"
3. View the results and click "Book Now" to test booking flow

## Database Setup Options

### Option 1: PostgreSQL (Recommended for Production)

1. Install PostgreSQL
2. Create a database:
   ```sql
   CREATE DATABASE reservation_agent;
   ```
3. Update `DATABASE_URL` in `.env`

### Option 2: SQLite (Easier for Development)

Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL="file:./dev.db"
```

Then run:
```bash
npx prisma generate
npx prisma migrate dev
```

## Redis Setup (Optional)

Redis is used for caching search results. The app will work without it, but responses will be slower.

### Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:alpine
```

## Email Setup (Gmail Example)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Create a new app password for "Mail"
3. Use the app password in `SMTP_PASS` in your `.env`

For development/testing, you can use [Ethereal Email](https://ethereal.email/) which provides a test SMTP server.

## Troubleshooting

### Backend won't start
- Check that PostgreSQL/Redis are running
- Verify `.env` file exists and has correct values
- Run `npx prisma generate` if you see Prisma errors

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` in `.env.local` matches backend port
- Check CORS settings in backend `src/index.ts`
- Ensure backend is running on the correct port

### No search results
- Check browser console for errors
- Verify backend logs for adapter errors
- Some adapters use mock data - check adapter files for sample data

### Database connection errors
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Try running `npx prisma migrate reset` to reset the database

## Next Steps

- Implement full Puppeteer scraping for OpenTable adapter
- Add more sophisticated NLP for query parsing
- Implement user authentication
- Add real-time availability updates
- Enhance ranking algorithm with more factors



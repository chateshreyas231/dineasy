# Quick Start Guide

Get the AI Reservation Agent running in 5 minutes!

## Prerequisites Check

- ✅ Node.js 18+ installed (`node --version`)
- ✅ npm installed (`npm --version`)
- ✅ PostgreSQL installed (or use SQLite for quick testing)

## Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Quick Backend Setup

```bash
cd backend

# Create .env file (copy from example or create manually)
cat > .env << EOF
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"
REDIS_URL="redis://localhost:6379"
REDIS_TTL=600
FRONTEND_URL=http://localhost:3000
EOF

# Set up database (using SQLite for simplicity)
npx prisma generate
npx prisma migrate dev --name init

# Start backend
npm run dev
```

**Note:** If you don't have Redis, the app will still work (just without caching). If you don't have PostgreSQL, use SQLite by setting `DATABASE_URL="file:./dev.db"` in `.env`.

## Step 3: Quick Frontend Setup

```bash
# In a new terminal
cd frontend

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local

# Start frontend
npm run dev
```

## Step 4: Test It!

1. Open http://localhost:3000 in your browser
2. Try searching: **"Dinner for 2 tomorrow 7pm sushi in Lincoln Park"**
3. You should see sample results (adapters use mock data for MVP)

## What's Working?

✅ Natural language query parsing  
✅ Multi-platform search (with sample data)  
✅ Result ranking and aggregation  
✅ Frontend UI with search and results  
✅ Booking link redirects  

## What Needs Configuration?

- **Email notifications**: Set up SMTP in backend `.env` (optional)
- **Redis caching**: Install Redis for better performance (optional)
- **Real scraping**: Implement Puppeteer selectors in adapters (see TODO comments)

## Troubleshooting

**Backend won't start?**
- Check `.env` file exists in `backend/` directory
- Run `npx prisma generate` in backend directory
- Make sure port 3001 is not in use

**Frontend can't connect?**
- Verify backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Open browser console for errors

**No results?**
- Check backend terminal for errors
- Verify adapters are returning sample data
- Try a simpler query like "dinner for 2 tomorrow"

## Next Steps

- Read `SETUP.md` for detailed configuration
- Check `README.md` for architecture overview
- Review adapter files to implement real scraping
- Set up email notifications for booking confirmations



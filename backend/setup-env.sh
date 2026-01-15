#!/bin/bash

# Quick setup script for backend environment

echo "Setting up backend environment..."

# Create .env file from example
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created .env file from env.example"
    
    # Use SQLite for easier setup if no PostgreSQL
    echo ""
    echo "Using SQLite for database (easier setup)"
    sed -i.bak 's|DATABASE_URL="postgresql://.*"|DATABASE_URL="file:./dev.db"|' .env
    rm .env.bak 2>/dev/null || true
    
    echo "✅ Configured SQLite database"
    echo ""
    echo "📝 Edit .env file to customize settings:"
    echo "   - Add Redis URL if you have Redis installed"
    echo "   - Add SMTP settings for email notifications"
    echo ""
else
    echo "⚠️  .env file already exists, skipping..."
fi

echo ""
echo "Next steps:"
echo "1. Run: npx prisma generate"
echo "2. Run: npx prisma migrate dev"
echo "3. Run: npm run dev"




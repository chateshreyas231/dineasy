# Dineasy Web Frontend

Modern, attractive web interface for Dineasy restaurant discovery platform.

## Features

### 🎨 Modern Design
- Beautiful gradient hero section
- Smooth animations and transitions
- Responsive design for all devices
- Clean, modern UI with glassmorphism effects

### 🔍 Enhanced Search
- Intent-based search (matches mobile app)
- Quick chips for common searches (Date Night, Quiet, Live Music, etc.)
- Vibe and cuisine filters
- Natural language query support

### 📱 Mobile App Integration
- Prominent mobile app CTA
- Aligned features with mobile experience
- Consistent branding

### ✨ Key Features
- **AI-Powered Matching**: Understands your intent from natural language
- **Multi-Platform Search**: Searches across OpenTable, Resy, Yelp, Tock, and Google
- **One-Click Booking**: Direct booking through preferred platforms
- **Smart Filters**: Refine by vibe, cuisine, and more

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.local.example .env.local
# Edit .env.local with your API URL
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Design System

### Colors
- Primary: Rose/Pink gradient (#FF6B6B to #FF1493)
- Background: Slate-50 to White gradient
- Cards: White with subtle shadows
- Accents: Rose-500, Pink-500, Orange-400

### Typography
- Font: Inter (Google Fonts)
- Headings: Bold, large sizes
- Body: Medium weight, readable sizes

### Components
- **SearchBar**: Enhanced with icon and better styling
- **RestaurantCard**: Redesigned with gradients and better information hierarchy
- **Quick Chips**: Interactive filter buttons
- **Feature Cards**: Highlight key benefits

## Alignment with Mobile App

The web interface now matches the mobile app's:
- Intent-based search approach
- Vibe and cuisine filtering
- Quick chip suggestions
- Modern, attractive design language
- Feature parity where applicable

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide Icons
- shadcn/ui components

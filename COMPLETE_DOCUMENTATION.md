# Dineasy - Complete Project Documentation

**Version:** 2.0.0  
**Last Updated:** January 2025  
**Repository:** https://github.com/chateshreyas231/dineasy.git

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [How It Works](#how-it-works)
5. [Backend Architecture](#backend-architecture)
6. [Mobile App Architecture](#mobile-app-architecture)
7. [Web Frontend Architecture](#web-frontend-architecture)
8. [API Documentation](#api-documentation)
9. [Database Schema](#database-schema)
10. [Setup & Installation](#setup--installation)
11. [Development Guide](#development-guide)

---

## Project Overview

**Dineasy** is an AI-powered restaurant reservation platform that aggregates availability across multiple booking platforms and provides an intelligent, conversational interface for finding and booking restaurant tables.

### Core Value Proposition

**For Diners:**
- **Natural Language Search**: "Dinner for 2 tomorrow 7pm sushi in Lincoln Park"
- **Multi-Platform Aggregation**: Searches OpenTable, Resy, Yelp, Tock, and Google Reserve simultaneously
- **AI Assistant**: Conversational interface with voice input for booking restaurants
- **Smart Matching**: Intent-based recommendations based on preferences, occasion, and vibe
- **Table Request System**: Request tables directly from restaurants with real-time status updates

**For Restaurants:**
- **Request Management**: Inbox for incoming table requests from diners
- **Hold System**: Manage table holds and availability windows
- **Insights Dashboard**: Analytics on request trends, popular times, and revenue
- **Status Management**: Real-time availability status updates

### Key Differentiators

1. **Agentic AI Assistant**: Conversational AI that understands natural language queries and handles the entire booking flow
2. **Multi-Platform Aggregation**: Single search across 5+ booking platforms with deduplication and ranking
3. **Intent-Based Matching**: Understands not just what you want, but why (date night, business dinner, celebration)
4. **Unified Experience**: One app for all restaurant bookings, regardless of platform

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interfaces                          │
├─────────────────────────────┬───────────────────────────────────┤
│   Mobile App (React Native)  │   Web Frontend (Next.js)         │
│   - iOS & Android            │   - Responsive Web UI            │
│   - Expo SDK 54              │   - Server-Side Rendering        │
│   - TypeScript               │   - TypeScript                   │
└───────────────┬───────────────┴──────────────┬──────────────────┘
                │                              │
                │  HTTP/REST API               │
                │  WebSocket (future)          │
                ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (Node.js/Express)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Routes     │  │   Services   │  │  Middleware  │         │
│  │  - /search   │  │  - Query     │  │  - Auth      │         │
│  │  - /book     │  │    Parser    │  │  - Rate Limit│         │
│  │  - /auth     │  │  - Reservation│  │  - Cache     │         │
│  │  - /bookings │  │    Service   │  │              │         │
│  │  - /voice    │  │  - Monitor   │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                │                              │
                ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Prisma     │  │    Redis     │  │   External   │         │
│  │   ORM        │  │    Cache     │  │     APIs      │         │
│  │              │  │              │  │               │         │
│  │  - Users     │  │  - Search    │  │  - OpenTable  │         │
│  │  - Bookings  │  │    Results   │  │  - Resy       │         │
│  │  - Sessions  │  │  - API       │  │  - Yelp       │         │
│  │  - Monitors  │  │    Responses │  │  - Tock       │         │
│  └──────────────┘  └──────────────┘  │  - Google     │         │
│                                       │    Places     │         │
│                                       └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Search Flow
1. **User Query** → Mobile/Web frontend
   - Natural language: "Dinner for 2 tomorrow 7pm sushi in Lincoln Park"
   - Voice input → Speech-to-text → Text query

2. **API Request** → Backend `/api/search?query=...`
   - Query parameter passed to search route

3. **Query Parsing** → `queryParser.ts`
   - Extracts: party size, date/time, cuisine, location, occasion, vibe
   - Uses Chrono library for date/time parsing
   - Returns structured `QueryIntent` object

4. **Platform Search** → `reservationService.ts`
   - Parallel execution across all adapters:
     - OpenTableAdapter
     - ResyAdapter
     - YelpAdapter
     - TockAdapter
     - GoogleReserveAdapter
   - Each adapter searches its platform's API
   - 10-second timeout per adapter

5. **Result Aggregation** → `reservationService.ts`
   - Deduplication by restaurant name + location
   - Filtering by intent (cuisine, time window)
   - Ranking by relevance, rating, distance
   - Returns top 5 results

6. **Caching** → Redis (optional)
   - Cache results for 10 minutes
   - Key: query intent hash

7. **Response** → JSON to frontend
   - Restaurant options with availability
   - Parsed intent for UI display

#### Booking Flow
1. **User Selects Restaurant** → Frontend
2. **Review Plan** → `/api/bookings/review-plan`
   - Validates availability
   - Returns booking options
3. **Confirm Booking** → `/api/bookings/confirm`
   - Creates booking record (DRAFT status)
   - Routes to appropriate provider:
     - Deep link (OpenTable, Resy, etc.)
     - Yelp Reservations API
     - OpenTable Partner API
4. **External Booking** → User completes on provider site
5. **Status Update** → Webhook or polling updates booking status

#### AI Assistant Flow
1. **User Message** → AI Assistant Screen
2. **Voice/Text Input** → Speech-to-text or direct text
3. **AI Processing** → `/api/voice` endpoint
   - Processes natural language
   - Extracts booking intent
   - Calls search API internally
4. **Response Generation** → AI formulates response
5. **UI Update** → Chat interface with animated orb

---

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite (dev) / PostgreSQL (production)
- **ORM**: Prisma
- **Cache**: Redis (optional)
- **Authentication**: JWT tokens with refresh tokens
- **Email**: Nodemailer (SMTP)
- **Validation**: Zod schemas
- **Security**: Helmet, CORS, rate limiting

### Mobile App
- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: React Navigation 6
  - Native Stack Navigator
  - Bottom Tab Navigator
- **State Management**: Zustand
- **UI Components**: Custom components with React Native
- **Animations**: React Native Animated API
- **Voice**: Expo AV for audio recording
- **Storage**: AsyncStorage, SecureStore
- **Notifications**: Expo Push Notifications

### Web Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **Rendering**: Server-Side Rendering (SSR)

---

## How It Works

### 1. Natural Language Query Processing

The system uses a sophisticated query parser that extracts structured information from natural language:

**Input**: "Dinner for 2 tomorrow 7pm sushi in Lincoln Park"

**Parsed Output**:
```typescript
{
  partySize: 2,
  dateTime: "2025-01-16T19:00:00Z",
  cuisine: ["sushi", "japanese"],
  location: "Lincoln Park",
  occasion: "dinner",
  vibe: null
}
```

**How it works**:
- **Date/Time**: Uses Chrono library to parse relative dates ("tomorrow", "next Friday") and times ("7pm", "7:00 PM")
- **Party Size**: Regex patterns match "for 2", "party of 4", etc.
- **Cuisine**: Keyword matching against predefined cuisine list
- **Location**: Extracts location from query after removing parsed elements
- **Occasion**: Detects meal type (dinner, lunch, brunch)
- **Vibe**: Detects mood keywords (romantic, casual, date night)

### 2. Multi-Platform Aggregation

The reservation service searches multiple platforms in parallel:

**Adapters** (Platform-specific implementations):
- `OpenTableAdapter`: Searches OpenTable API
- `ResyAdapter`: Searches Resy API
- `YelpAdapter`: Searches Yelp Fusion API
- `TockAdapter`: Searches Tock API
- `GoogleReserveAdapter`: Searches Google Reserve API

**Process**:
1. All adapters search in parallel with 10-second timeout
2. Results are collected and flattened
3. Deduplication by restaurant name + coordinates
4. Filtering by intent (cuisine, time window)
5. Ranking by:
   - Relevance to query
   - Rating
   - Distance (if location provided)
   - Availability match
6. Return top 5 results

### 3. AI Assistant

The AI assistant provides a conversational interface for booking:

**Features**:
- Voice input with waveform visualization
- Natural language understanding
- Contextual responses
- Booking flow guidance
- Animated visual feedback (SiriOrb component)

**Flow**:
1. User speaks or types query
2. Query sent to `/api/voice` endpoint
3. Backend processes query and calls search internally
4. AI formulates conversational response
5. Response displayed in chat interface
6. User can confirm booking through chat

### 4. Booking System

**Booking States**:
- `DRAFT`: Initial booking created, not yet confirmed
- `PENDING_EXTERNAL`: Waiting for user to complete on external platform
- `CONFIRMED`: Booking confirmed on external platform
- `MONITORING`: System monitoring for availability changes
- `FAILED`: Booking failed
- `CANCELLED`: User cancelled booking

**Providers**:
- `deeplink`: Direct link to booking platform (OpenTable, Resy)
- `yelp_reservations`: Yelp Reservations API integration
- `opentable_partner`: OpenTable Partner API integration

### 5. Monitoring System

The system can monitor restaurants for availability changes:

**Monitor Jobs**:
- User requests monitoring for a specific restaurant/time window
- System periodically checks availability
- Sends push notification when availability found
- Automatically stops after booking or expiration

---

## Backend Architecture

### Directory Structure

```
backend/
├── src/
│   ├── adapters/          # Platform-specific booking adapters
│   │   ├── baseAdapter.ts
│   │   ├── openTableAdapter.ts
│   │   ├── resyAdapter.ts
│   │   ├── yelpAdapter.ts
│   │   ├── tockAdapter.ts
│   │   └── googleReserveAdapter.ts
│   ├── middleware/        # Express middleware
│   │   └── auth.ts        # JWT authentication
│   ├── providers/         # Booking provider implementations
│   │   ├── deeplinkProvider.ts
│   │   ├── yelpReservationsProvider.ts
│   │   └── opentablePartnerProvider.ts
│   ├── routes/           # API route handlers
│   │   ├── search.ts      # GET /api/search
│   │   ├── book.ts        # POST /api/book
│   │   ├── auth.ts        # /api/auth/* endpoints
│   │   ├── restaurants.ts # /api/restaurants/* endpoints
│   │   ├── bookings.ts    # /api/bookings/* endpoints
│   │   ├── monitor.ts     # /api/monitor/* endpoints
│   │   └── voice.ts       # /api/voice (AI assistant)
│   ├── services/          # Business logic services
│   │   ├── queryParser.ts      # Natural language parsing
│   │   ├── reservationService.ts # Multi-platform search
│   │   ├── googlePlaces.ts     # Google Places API
│   │   ├── yelpEnrichment.ts   # Yelp data enrichment
│   │   ├── monitorService.ts   # Availability monitoring
│   │   └── pushNotificationService.ts # Push notifications
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── auth.ts       # Auth utilities
│   │   ├── cache.ts      # Redis cache utilities
│   │   ├── db.ts         # Database utilities
│   │   └── mailer.ts     # Email utilities
│   └── index.ts          # Express app entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── schema.sqlite.prisma # SQLite-specific schema
├── package.json
├── tsconfig.json
└── env.example           # Environment variables template
```

### Key Components

#### Adapters (`src/adapters/`)

Adapters implement the `BaseAdapter` interface to search specific booking platforms:

```typescript
interface BaseAdapter {
  searchAvailability(intent: QueryIntent): Promise<RestaurantOption[]>;
  getBookingUrl(restaurant: RestaurantOption): string;
}
```

Each adapter:
- Implements platform-specific API calls
- Handles authentication (API keys, OAuth)
- Transforms platform responses to unified format
- Handles errors and timeouts gracefully

#### Services (`src/services/`)

**Query Parser** (`queryParser.ts`):
- Parses natural language queries
- Extracts structured intent
- Uses Chrono for date/time parsing
- Returns `QueryIntent` object

**Reservation Service** (`reservationService.ts`):
- Orchestrates multi-platform search
- Runs adapters in parallel
- Deduplicates and ranks results
- Filters by intent

**Monitor Service** (`monitorService.ts`):
- Background worker for availability monitoring
- Polls restaurants at intervals
- Sends push notifications on availability
- Manages monitor job lifecycle

#### Routes (`src/routes/`)

**Search Route** (`/api/search`):
- Accepts natural language query
- Parses query to intent
- Calls reservation service
- Returns ranked results
- Caches results

**Bookings Route** (`/api/bookings/*`):
- `GET /availability`: Check availability
- `POST /review-plan`: Review booking plan
- `POST /confirm`: Confirm booking
- `POST /:id/cancel`: Cancel booking
- `GET /`: List user bookings

**Auth Route** (`/api/auth/*`):
- `POST /register`: User registration
- `POST /login`: User login
- `POST /refresh`: Refresh access token
- `POST /logout`: Logout and invalidate session

**Voice Route** (`/api/voice`):
- Processes AI assistant queries
- Calls search internally
- Generates conversational responses

### API Endpoints

#### Search
- `GET /api/search?query=...` - Search restaurants

#### Bookings
- `GET /api/bookings/availability` - Check availability
- `POST /api/bookings/review-plan` - Review booking plan
- `POST /api/bookings/confirm` - Confirm booking
- `GET /api/bookings` - List user bookings
- `POST /api/bookings/:id/cancel` - Cancel booking

#### Restaurants
- `GET /api/restaurants/search` - Search restaurants
- `GET /api/restaurants/:placeId` - Get restaurant details

#### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

#### Monitor
- `POST /api/monitor` - Create monitor job
- `GET /api/monitor` - List monitor jobs
- `DELETE /api/monitor/:id` - Cancel monitor job

#### Voice
- `POST /api/voice` - AI assistant query

---

## Mobile App Architecture

### Directory Structure

```
mobile/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── AIOrb.tsx     # AI orb wrapper
│   │   ├── GLBOrb.tsx    # Simplified orb (uses SiriOrb)
│   │   ├── SiriOrb.tsx   # Animated AI orb component
│   │   ├── VoiceInputButton.tsx
│   │   ├── VoiceWaveform.tsx
│   │   ├── AIChatBubble.tsx
│   │   └── ...
│   ├── screens/          # Screen components
│   │   ├── WelcomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── AIAssistantScreen.tsx
│   │   ├── diner/        # Diner mode screens
│   │   │   ├── DinerHomeScreen.tsx
│   │   │   ├── ResultsScreen.tsx
│   │   │   ├── RestaurantDetailScreen.tsx
│   │   │   └── ...
│   │   └── restaurant/  # Restaurant mode screens
│   │       ├── RestaurantHomeStatusScreen.tsx
│   │       ├── RequestsInboxScreen.tsx
│   │       └── ...
│   ├── navigation/       # Navigation configuration
│   │   ├── RoleSwitcher.tsx  # Root navigator
│   │   ├── DinerTabs.tsx     # Diner tab navigator
│   │   └── RestaurantTabs.tsx # Restaurant tab navigator
│   ├── services/         # API and business logic
│   │   ├── authService.ts
│   │   ├── aiAgentService.ts
│   │   └── ...
│   ├── store/           # State management
│   │   └── useAppStore.ts  # Zustand store
│   ├── theme/           # Design system
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── ...
│   └── types/           # TypeScript types
│       └── index.ts
├── assets/              # Images, fonts, etc.
├── App.tsx             # Root component
└── package.json
```

### Navigation Structure

```
RoleSwitcher (Root Navigator)
├── WelcomeScreen (if no user)
├── LoginScreen
├── SignupScreen
├── AIAssistantScreen (if user + diner role) ← Initial screen after login
├── DinerApp (Tab Navigator)
│   ├── Browse (Stack)
│   │   ├── BrowseHome (DinerHomeScreen)
│   │   ├── AIAssistant
│   │   ├── IntentBuilder
│   │   ├── Results
│   │   ├── RestaurantDetail
│   │   ├── RequestTable
│   │   └── RequestStatus
│   ├── Watchlist
│   ├── Bookings
│   └── Profile
└── RestaurantApp (Tab Navigator)
    ├── Status
    ├── Requests (Stack)
    ├── Holds
    ├── Insights
    └── Settings
```

### State Management

Zustand store (`useAppStore.ts`) manages:
- **User State**: Current user, authentication
- **Role**: Diner or Restaurant mode
- **Preferences**: Dietary, budget, ambience preferences
- **Intent**: Current search intent
- **Requests**: Table request list and status
- **Watchlist**: Saved restaurants
- **Bookings**: Current and backup plans
- **AI Chat**: Messages, listening state, thinking state

### Key Screens

#### AI Assistant Screen
- Conversational interface with animated orb
- Voice input with waveform
- Text input fallback
- Chat message history
- Quick reply buttons
- Booking confirmation flow

#### Diner Home Screen
- AI orb preview
- Natural language search bar
- Quick chips (Date Night, Quiet, etc.)
- Party size selector
- Recent searches

#### Results Screen
- Restaurant cards with photos
- Distance, rating, price level
- Estimated wait times
- Quick request button
- Filter and sort options

---

## Web Frontend Architecture

### Directory Structure

```
frontend/
├── app/                 # Next.js app directory
│   ├── page.tsx        # Home page
│   ├── login/
│   ├── signup/
│   ├── bookings/
│   └── restaurant/[placeId]/
├── components/         # React components
│   ├── SearchBar.tsx
│   ├── RestaurantCard.tsx
│   └── ui/            # UI primitives
├── lib/               # Utilities
│   └── utils.ts
├── types/             # TypeScript types
└── package.json
```

### Pages

- **Home** (`/`): Search interface
- **Login** (`/login`): User login
- **Signup** (`/signup`): User registration
- **Bookings** (`/bookings`): User bookings list
- **Restaurant Detail** (`/restaurant/[placeId]`): Restaurant details and booking

---

## Database Schema

### Models

#### User
- `id`: UUID
- `email`: Unique email
- `passwordHash`: Bcrypt hash
- `name`: User name
- `pushToken`: Expo push notification token

#### Session
- `id`: UUID
- `userId`: Foreign key to User
- `refreshTokenHash`: Hashed refresh token
- `expiresAt`: Session expiration

#### DinerProfile
- `id`: UUID
- `userId`: Foreign key to User (unique)
- `preferences`: JSON (dietary, budget, ambience)

#### Booking
- `id`: UUID
- `userId`: Foreign key to User
- `placeId`: Google Places ID
- `restaurantName`: Restaurant name
- `datetime`: Booking date/time
- `partySize`: Number of guests
- `provider`: Booking provider enum
- `status`: Booking status enum
- `bookingUrl`: Deep link URL
- `confirmation`: JSON confirmation data

#### MonitorJob
- `id`: UUID
- `userId`: Foreign key to User
- `placeId`: Google Places ID
- `timeWindowStart`: Start of monitoring window
- `timeWindowEnd`: End of monitoring window
- `partySize`: Number of guests
- `status`: ACTIVE, PAUSED, COMPLETED, CANCELLED

#### Favorite
- `id`: UUID
- `userId`: Foreign key to User
- `placeId`: Google Places ID
- Unique constraint on (userId, placeId)

---

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL (or SQLite for development)
- Redis server (optional, for caching)
- Expo CLI (for mobile development)
- SMTP email account (for notifications)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your configuration:
   - `DATABASE_URL`: Database connection string
   - `REDIS_URL`: Redis connection (optional)
   - `JWT_SECRET`: Secret for JWT tokens
   - `GOOGLE_PLACES_API_KEY`: Google Places API key
   - `YELP_API_KEY`: Yelp Fusion API key
   - `SMTP_*`: Email configuration

4. **Set up database**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start server**:
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:3001`

### Mobile App Setup

1. **Navigate to mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API URL**:
   Create `src/utils/api.ts` with backend URL:
   ```typescript
   export const API_URL = 'http://localhost:3001';
   ```

4. **Start Expo**:
   ```bash
   npm start
   ```

5. **Run on device/simulator**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

### Web Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

Frontend runs on `http://localhost:3000`

---

## Development Guide

### Adding a New Booking Platform Adapter

1. Create new adapter in `backend/src/adapters/`:
   ```typescript
   import { BaseAdapter } from './baseAdapter';
   import { QueryIntent, RestaurantOption } from '../types';

   export class NewPlatformAdapter extends BaseAdapter {
     async searchAvailability(intent: QueryIntent): Promise<RestaurantOption[]> {
       // Implement platform-specific search
     }
   }
   ```

2. Add to `ReservationService`:
   ```typescript
   private adapters = [
     // ... existing adapters
     new NewPlatformAdapter()
   ];
   ```

### Adding a New API Endpoint

1. Create route file in `backend/src/routes/`:
   ```typescript
   import { Router } from 'express';
   const router = Router();

   router.get('/endpoint', async (req, res) => {
     // Handler logic
   });

   export { router as newRoutes };
   ```

2. Register in `backend/src/index.ts`:
   ```typescript
   import { newRoutes } from './routes/new';
   app.use('/api/new', newRoutes);
   ```

### Adding a New Mobile Screen

1. Create screen component in `mobile/src/screens/`:
   ```typescript
   import React from 'react';
   import { View, Text } from 'react-native';

   export const NewScreen: React.FC = () => {
     return (
       <View>
         <Text>New Screen</Text>
       </View>
     );
   };
   ```

2. Add to navigation:
   ```typescript
   <Stack.Screen name="NewScreen" component={NewScreen} />
   ```

---

## Current Implementation Status

### ✅ Completed

**Backend**:
- Express server setup with security middleware
- Natural language query parser
- Multi-platform reservation service
- Database schema with Prisma
- Authentication system (JWT)
- Booking management endpoints
- Restaurant search and details
- Monitoring service foundation
- Cache utilities (Redis)

**Mobile App**:
- Complete navigation structure
- All diner screens (14 screens)
- All restaurant screens (9 screens)
- AI Assistant with voice input
- SiriOrb animated component
- State management with Zustand
- Authentication flow
- Theme system

**Web Frontend**:
- Next.js setup
- Search interface
- Restaurant cards
- Responsive design

### 🚧 In Progress / TODO

- Complete adapter implementations for all platforms
- Real-time WebSocket support
- Push notification integration
- Payment processing
- Advanced analytics
- Image upload functionality
- Production deployment configuration

---

## API Response Examples

### Search Response

```json
{
  "results": [
    {
      "name": "Sushi Samba",
      "address": "504 N Wells St, Chicago, IL",
      "cuisine": ["sushi", "japanese"],
      "rating": 4.5,
      "priceLevel": 3,
      "distance": 0.8,
      "availableTimes": ["19:00", "19:30", "20:00"],
      "platform": "opentable",
      "bookingUrl": "https://..."
    }
  ],
  "query": "Dinner for 2 tomorrow 7pm sushi in Lincoln Park",
  "parsedIntent": {
    "partySize": 2,
    "dateTime": "2025-01-16T19:00:00Z",
    "cuisine": ["sushi"],
    "location": "Lincoln Park"
  },
  "timestamp": "2025-01-15T12:00:00Z"
}
```

### Booking Response

```json
{
  "id": "uuid",
  "status": "PENDING_EXTERNAL",
  "bookingUrl": "https://opentable.com/...",
  "restaurantName": "Sushi Samba",
  "datetime": "2025-01-16T19:00:00Z",
  "partySize": 2
}
```

---

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL="sqlite:./dev.db"
# or
DATABASE_URL="postgresql://user:password@localhost:5432/dineasy"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# API Keys
GOOGLE_PLACES_API_KEY="your-key"
YELP_API_KEY="your-key"
OPENTABLE_API_KEY="your-key"
RESY_API_KEY="your-key"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-password"

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### Mobile (src/utils/api.ts)

```typescript
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## License

[Add your license here]

---

**Repository:** https://github.com/chateshreyas231/dineasy.git

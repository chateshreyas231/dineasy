# Dineasy Mobile App

A React Native mobile application built with Expo for connecting diners with restaurants through intelligent table request matching.

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation (Native Stack & Bottom Tabs)
- **State Management**: Zustand
- **Styling**: React Native StyleSheet with custom theme system
- **Language**: TypeScript

## Project Structure

```
mobile/
├── src/
│   ├── components/      # Reusable UI components
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # Screen components (diner & restaurant)
│   ├── store/           # Zustand state management
│   ├── theme/           # Theme colors and styling
│   ├── types/           # TypeScript type definitions
│   └── mock/            # Mock data for development
├── App.tsx              # Root component
├── index.js             # Entry point
└── package.json         # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo Go app on your mobile device (for development)

### Installation

```bash
npm install
```

### Running the App

```bash
# Start the development server
npm start

# Start with clean cache
npm start:clean

# Run on specific platform
npm run ios
npm run android
npm run web
```

### Development Scripts

- `npm start` - Start Expo development server
- `npm start:clean` - Start with cleared cache
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint (if configured)

## Architecture

### State Management

The app uses Zustand for global state management. The main store (`useAppStore`) manages:
- User role (diner/restaurant)
- User preferences
- Restaurant requests
- Watchlist items
- Current intent/plan

### Navigation

- **RoleSwitcher**: Top-level navigator that switches between Diner and Restaurant flows
- **DinerTabs**: Bottom tab navigator for diner experience
- **RestaurantTabs**: Bottom tab navigator for restaurant experience
- **Stack Navigators**: Handle onboarding and nested navigation

### Theme System

Centralized color system in `src/theme/colors.ts` with:
- Dark theme with purple/pink gradients
- Consistent color palette across the app
- Status colors (success, warning, error, info)

## Features

### Diner Mode
- Intent-based restaurant search
- Table request system
- Watchlist for favorite restaurants
- Tonight's plan management
- Messaging with restaurants
- Profile management

### Restaurant Mode
- Request inbox and management
- Hold management
- Status updates
- Insights and analytics
- Settings and profile

## Development Notes

- All styling uses React Native StyleSheet (no NativeWind)
- Components are typed with TypeScript
- Mock data is available in `src/mock/` for development
- Metro bundler is configured to only watch `src/` directory for performance

## Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## License

Private - All rights reserved

# Dineasy Design System

## Overview

Dineasy uses a modern dark theme with vibrant purple/pink gradients, inspired by cutting-edge AI assistant applications. The design emphasizes:

- **Dark backgrounds** for reduced eye strain and modern aesthetic
- **Purple/Pink gradients** for vibrant, energetic feel
- **Glowing effects** for interactive elements
- **Glassmorphism** for depth and modern UI
- **Smooth animations** for polished user experience

## Color Palette

### Primary Colors
- **Purple Light**: `#A855F7`
- **Purple Main**: `#9333EA`
- **Purple Dark**: `#7C3AED`
- **Pink Glow**: `#EC4899`

### Backgrounds
- **Primary**: `#0A0A0F` (Deep black)
- **Secondary**: `#1A1A2E` (Dark blue-gray)
- **Tertiary**: `#16213E` (Darker blue-gray)
- **Card**: `#1E1E2E` (Card background)
- **Card Hover**: `#252538` (Card hover state)

### Text Colors
- **Primary**: `#FFFFFF` (White)
- **Secondary**: `#E5E7EB` (Light gray)
- **Tertiary**: `#9CA3AF` (Medium gray)
- **Muted**: `#6B7280` (Dark gray)

### Borders
- **Light**: `#2D2D3E`
- **Medium**: `#3D3D4E`
- **Dark**: `#1D1D2E`

## Gradients

### Primary Gradient
```css
background: linear-gradient(135deg, #9333EA 0%, #EC4899 100%);
```
Used for: Primary buttons, selected chips, highlights

### Secondary Gradient
```css
background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
```
Used for: Secondary elements, accents

### Background Gradient
```css
background: linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 50%, #16213E 100%);
```
Used for: Main app backgrounds

## Typography

### Headings
- **H1**: 48px, Bold (800), White
- **H2**: 32px, Bold (700), White
- **H3**: 24px, Semibold (600), White

### Body
- **Large**: 18px, Regular, Secondary text color
- **Medium**: 16px, Regular, Primary text color
- **Small**: 14px, Regular, Tertiary text color

## Components

### Buttons

#### Primary Button
- Gradient background (Purple to Pink)
- White text
- Rounded corners (16px)
- Glow effect on hover
- Height: 52px

#### Secondary Button
- Dark card background
- Light border
- White text
- Same dimensions as primary

#### Outline Button
- Transparent background
- Purple border (2px)
- Purple text
- Same dimensions

### Cards
- Background: `#1E1E2E`
- Border: `#2D2D3E` (1px)
- Border radius: 20px
- Shadow: Purple glow
- Padding: 16px default

### Chips
- Unselected: Dark card background with border
- Selected: Gradient background (Purple to Pink)
- Border radius: 20px
- Padding: 10px vertical, 18px horizontal

### Input Fields
- Background: Card color
- Border: Light border color
- Border radius: 12px
- Text: Primary text color
- Placeholder: Muted text color

## Effects

### Glow Effects
```css
box-shadow: 0 0 20px rgba(147, 51, 234, 0.5), 0 0 40px rgba(147, 51, 234, 0.3);
```

### Glassmorphism
```css
background: rgba(30, 30, 46, 0.9);
backdrop-filter: blur(12px);
border: 1px solid rgba(45, 45, 62, 0.5);
```

## Spacing

- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px
- **2XL**: 48px

## Border Radius

- **Small**: 12px (Inputs, small buttons)
- **Medium**: 16px (Buttons)
- **Large**: 20px (Cards, chips)
- **XLarge**: 24px (Large cards)

## Animations

### Hover States
- Scale: 1.05x
- Transition: 0.3s ease
- Glow intensity increase

### Loading States
- Spinner: Purple color
- Pulse animation
- Fade in/out

## Platform-Specific Notes

### Mobile (React Native)
- Use `StyleSheet` for styling
- `LinearGradient` from `expo-linear-gradient` for gradients
- `Animated` API for animations
- Safe area handling for notches

### Web (Next.js)
- Tailwind CSS for utility classes
- CSS gradients for backgrounds
- CSS animations for transitions
- Responsive breakpoints: sm, md, lg, xl

## Accessibility

- High contrast ratios (WCAG AA compliant)
- Clear focus states
- Readable font sizes (minimum 14px)
- Touch targets minimum 44x44px (mobile)

## Implementation Files

### Mobile
- `/mobile/src/theme/colors.ts` - Color definitions
- `/mobile/src/components/` - Reusable components
- All screens use theme colors

### Web
- `/frontend/app/globals.css` - Global styles and utilities
- `/frontend/components/` - React components
- Tailwind config for theme colors


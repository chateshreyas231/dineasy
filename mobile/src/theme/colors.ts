/**
 * Minimalist Monochromatic Theme - Color System
 * Clean, futuristic aesthetic with white, light gray, and black
 */

export const colors = {
  // Primary Colors - Monochromatic black
  primary: {
    main: '#000000', // Pure black
    light: '#1A1A1A', // Very dark gray
    dark: '#000000', // Pure black
    glow: 'rgba(0, 0, 0, 0.1)', // Subtle black glow
  },

  // Accent Colors - Minimal grayscale
  accent: {
    purple: '#808080', // Medium gray
    lavender: '#808080', // Medium gray
    pink: '#808080', // Medium gray
    blue: '#808080', // Medium gray
    indigo: '#808080', // Medium gray
    rose: '#808080', // Medium gray
    violet: '#808080', // Medium gray
    lightPurple: '#808080', // Medium gray
    gold: '#808080', // Medium gray for ratings
  },

  // Backgrounds - White and light gray tones
  background: {
    primary: '#FFFFFF', // Pure white
    secondary: '#F5F5F5', // Very light gray
    tertiary: '#E5E5E5', // Light gray
    elevated: '#FAFAFA', // Off-white elevated surface
    card: 'rgba(255, 255, 255, 0.95)', // White translucent card
    cardHover: 'rgba(250, 250, 250, 0.98)', // Hover state
    chatAI: 'rgba(245, 245, 245, 0.95)', // AI chat bubble
    glass: 'rgba(255, 255, 255, 0.9)', // Glassmorphism effect
    overlay: 'rgba(255, 255, 255, 0.95)', // Translucent overlay
  },

  // Text Colors - Black and gray tones
  text: {
    primary: '#000000', // Pure black for headings
    secondary: '#1A1A1A', // Very dark gray
    tertiary: '#4A4A4A', // Dark gray
    muted: '#808080', // Medium gray
    disabled: '#B0B0B0', // Light gray disabled state
    inverse: '#FFFFFF', // White text on dark backgrounds
    onDark: '#FFFFFF', // White text on dark backgrounds
  },

  // Borders - Subtle gray borders
  border: {
    light: 'rgba(0, 0, 0, 0.08)', // Very subtle black
    medium: 'rgba(0, 0, 0, 0.12)', // Standard border
    dark: 'rgba(0, 0, 0, 0.2)', // Stronger border
    focus: '#000000', // Focus state (black)
    elegant: 'rgba(0, 0, 0, 0.15)', // Soft black border
  },

  // Status Colors - Minimal grayscale
  status: {
    success: '#4A4A4A', // Dark gray
    warning: '#6A6A6A', // Medium-dark gray
    error: '#000000', // Black
    info: '#4A4A4A', // Dark gray
  },
};

// Gradient definitions - Minimal gradients
export const gradients = {
  // Primary action gradient - Black to dark gray
  primary: ['#000000', '#1A1A1A'], // Black gradient
  // Background gradient - White to light gray
  background: ['#FFFFFF', '#F5F5F5', '#FFFFFF'], // White gradient
  // Soft background gradient - Light tones
  soft: ['#FFFFFF', '#FAFAFA', '#F5F5F5'], // White to light gray
  // Elegant gradient - Monochromatic
  elegant: ['#000000', '#4A4A4A', '#808080'], // Black to gray
  // Chat gradient - Light tones
  chat: ['#F5F5F5', '#FFFFFF'], // Light gray to white
  // Glassmorphism gradient - White translucent
  glass: ['rgba(255, 255, 255, 0.95)', 'rgba(250, 250, 250, 0.9)'],
  // Overlay gradient - White translucent
  overlay: ['rgba(255, 255, 255, 0.98)', 'rgba(250, 250, 250, 0.95)'],
};

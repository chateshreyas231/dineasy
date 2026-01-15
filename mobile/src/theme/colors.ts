/**
 * Glassmorphism Theme - Color System
 * Soft, translucent elements with pastel gradients
 */

export const colors = {
  // Primary Colors - Pink to Purple Gradient
  primary: {
    main: '#FF6B92', // Vibrant pink
    light: '#FFB3D1', // Light pink
    dark: '#E91E63', // Darker pink
    glow: '#FFE5F0', // Subtle pink glow
  },

  // Accent Colors
  accent: {
    purple: '#B66DFF', // Soft purple
    lavender: '#D4A5FF', // Light lavender
    pink: '#FF6B92', // Pastel pink
    blue: '#6B9FFF', // Medium blue
    indigo: '#8B7FFF', // Indigo accent
    rose: '#FFB3D1', // Rose pink
    violet: '#B66DFF', // Violet
    lightPurple: '#D4A5FF', // Light purple
  },

  // Backgrounds - Very light with subtle gradients
  background: {
    primary: '#F8F9FA', // Very light off-white
    secondary: '#FFFFFF', // Pure white
    tertiary: '#F0F2F5', // Light gray
    elevated: '#FFFFFF', // Pure white for elevated surfaces
    card: '#FFFFFF', // Clean white cards with transparency
    cardHover: '#FAFBFC', // Subtle hover state
    chatAI: '#F5F7FA', // AI chat bubble background
    glass: 'rgba(255, 255, 255, 0.7)', // Glassmorphism effect
  },

  // Text Colors - Dark for readability
  text: {
    primary: '#333333', // Dark charcoal for headings
    secondary: '#666666', // Medium gray
    tertiary: '#888888', // Lighter gray for descriptions
    muted: '#888888', // Muted gray for secondary text
    disabled: '#CCCCCC', // Disabled state
    inverse: '#FFFFFF', // White text on dark backgrounds
  },

  // Borders - Very subtle
  border: {
    light: '#F0F0F0', // Very subtle gray
    medium: '#E8E8E8', // Standard border
    dark: '#DDDDDD', // Stronger border
    focus: '#FF6B92', // Focus state (pink)
    elegant: 'rgba(255, 107, 146, 0.2)', // Soft pink subtle border
  },

  // Status Colors
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
};

// Gradient definitions
export const gradients = {
  // Primary action gradient - Pink to Purple
  primary: ['#FF6B92', '#B66DFF'], // Pink to purple
  // Background gradient - Blue to Purple (for special elements)
  background: ['#6B9FFF', '#B66DFF'], // Blue to purple
  // Soft background gradient
  soft: ['#F8F9FA', '#FFFFFF', '#F0F2F5'], // Very light gray-white
  // Elegant gradient
  elegant: ['#FF6B92', '#B66DFF', '#8B7FFF'], // Pink to purple to indigo
  // Chat gradient
  chat: ['#F5F7FA', '#FFFFFF'], // Light gray to white
  // Glassmorphism gradient
  glass: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)'],
};

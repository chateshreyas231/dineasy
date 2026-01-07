// Dineasy Theme Colors - Modern Dark Theme with Purple/Pink Gradients
export const colors = {
  // Backgrounds
  background: {
    primary: '#0A0A0F',
    secondary: '#1A1A2E',
    tertiary: '#16213E',
    card: '#1E1E2E',
    cardHover: '#252538',
  },
  
  // Primary gradient colors (Purple/Pink)
  primary: {
    light: '#A855F7', // Purple
    main: '#9333EA', // Purple
    dark: '#7C3AED', // Dark Purple
    glow: '#EC4899', // Pink
  },
  
  // Accent colors
  accent: {
    purple: '#9333EA',
    pink: '#EC4899',
    violet: '#8B5CF6',
    fuchsia: '#D946EF',
  },
  
  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#E5E7EB',
    tertiary: '#9CA3AF',
    muted: '#6B7280',
  },
  
  // Borders
  border: {
    light: '#2D2D3E',
    medium: '#3D3D4E',
    dark: '#1D1D2E',
  },
  
  // Status colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Overlays
  overlay: {
    light: 'rgba(147, 51, 234, 0.1)',
    medium: 'rgba(147, 51, 234, 0.2)',
    dark: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Gradients
  gradients: {
    primary: ['#9333EA', '#EC4899'] as const, // Purple to Pink
    secondary: ['#7C3AED', '#A855F7'] as const, // Dark Purple to Purple
    accent: ['#EC4899', '#F472B6'] as const, // Pink to Light Pink
    background: ['#0A0A0F', '#1A1A2E', '#16213E'] as const, // Dark gradient
    card: ['#1E1E2E', '#252538'] as const, // Card gradient
  },
};


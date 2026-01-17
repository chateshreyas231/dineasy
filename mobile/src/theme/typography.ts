/**
 * Minimalist Typography System
 * Clean, refined font sizes with minimal letter spacing
 */

export const typography = {
  // Display
  display: {
    fontSize: 48,
    fontWeight: '600' as const,
    lineHeight: 56,
    letterSpacing: -0.5,
  },

  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '600' as const,
    lineHeight: 38,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 26,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: 0,
  },
  h3: {
    fontSize: 22,
    fontWeight: '500' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },

  // Body
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 26,
    letterSpacing: 0,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 23,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },

  // Button
  button: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 22,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },

  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: 0,
  },
};

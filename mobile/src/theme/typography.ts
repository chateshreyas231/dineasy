/**
 * Typography System
 * Refined font sizes, line heights, and letter spacing
 */

export const typography = {
  // Display
  display: {
    fontSize: 52,
    fontWeight: '700' as const,
    lineHeight: 60,
    letterSpacing: -0.8,
  },

  // Headings
  h1: {
    fontSize: 34,
    fontWeight: '600' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: 0,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 30,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: 0,
  },

  // Body
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28.8, // 1.6
    letterSpacing: 0.1,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 25.6, // 1.6
    letterSpacing: 0.1,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },

  // Button
  button: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },

  // Caption
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 19.5, // 1.5
    letterSpacing: 0,
  },
};

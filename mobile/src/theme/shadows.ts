/**
 * Glassmorphism Shadows System
 * Soft, diffused shadows for depth and elevation
 */

import { Platform } from 'react-native';
import { colors } from './colors';

export const shadows = {
  xs: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 3,
    },
    android: {
      elevation: 1,
    },
  }),
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    android: {
      elevation: 2,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
    },
    android: {
      elevation: 6,
    },
  }),
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 28,
    },
    android: {
      elevation: 8,
    },
  }),
  '2xl': Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.15,
      shadowRadius: 36,
    },
    android: {
      elevation: 10,
    },
  }),
  // Glassmorphism shadow - very soft and diffused
  glass: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
  }),
  // Colored shadows
  primary: Platform.select({
    ios: {
      shadowColor: colors.primary.main,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
  }),
  accent: Platform.select({
    ios: {
      shadowColor: colors.accent.purple,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
  }),
  // Glow effects - soft and diffused
  glow: Platform.select({
    ios: {
      shadowColor: colors.primary.main,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
    },
    android: {
      elevation: 6,
    },
  }),
};

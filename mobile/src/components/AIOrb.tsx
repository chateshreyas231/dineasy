import React from 'react';
import { GLBOrb } from './GLBOrb';

interface AIOrbProps {
  size?: number;
  isListening?: boolean;
  isThinking?: boolean;
}

/**
 * AI Orb Component
 * Wrapper that uses GLBOrb for all orb displays
 */
export const AIOrb: React.FC<AIOrbProps> = (props) => {
  return <GLBOrb {...props} />;
};

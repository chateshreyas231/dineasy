import React from 'react';
import SiriOrb from './SiriOrb';

interface GLBOrbProps {
  size?: number;
  isListening?: boolean;
  isThinking?: boolean;
}

/**
 * GLB Orb Component
 * Simplified to always use SiriOrb for all AI assistant orbs
 */
export const GLBOrb: React.FC<GLBOrbProps> = ({
  size = 120,
  isListening = false,
  isThinking = false,
}) => {
  return (
    <SiriOrb
      size={size}
      isListening={isListening}
      isThinking={isThinking}
      animationDuration={20}
    />
  );
};

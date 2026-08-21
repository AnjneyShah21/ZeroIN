import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const cipherCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*?';

export const ScrambleText: React.FC<{ text: string; className?: string; active?: boolean; hoverColor?: string }> = ({ text, className, active, hoverColor = '#c4b5fd' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState(text);
  const shouldScramble = active ?? isHovered;

  useEffect(() => {
    if (!shouldScramble) {
      setDisplayText(text);
      return;
    }

    const scramble = () => setDisplayText(text.split('').map((character) => (
      /[A-Za-z0-9]/.test(character)
        ? cipherCharacters[Math.floor(Math.random() * cipherCharacters.length)]
        : character
    )).join(''));
    scramble();
    const interval = window.setInterval(scramble, 70);

    return () => window.clearInterval(interval);
  }, [shouldScramble, text]);

  return (
    <motion.span
      onHoverStart={active === undefined ? () => setIsHovered(true) : undefined}
      onHoverEnd={active === undefined ? () => setIsHovered(false) : undefined}
      animate={{ scale: shouldScramble ? 1.035 : 1, color: shouldScramble ? hoverColor : undefined }}
      transition={{ duration: 0.12 }}
      className={`inline-block ${active === undefined ? 'cursor-crosshair' : ''} ${className || ''}`}
    >
      {displayText}
    </motion.span>
  );
};

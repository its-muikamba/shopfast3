import React from 'react';
import { HandIcon } from './Icons';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ElementType;
  label: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick, icon: Icon = HandIcon, label }) => {
  return (
    // Positioned at bottom-28 to float above the new, taller nav bar area
    <div className="fixed bottom-28 right-4 z-20">
      <button
        onClick={onClick}
        className="flex items-center gap-2 bg-primary text-brand-charcoal font-bold py-3 px-5 rounded-full shadow-lg transform hover:scale-105 transition-transform"
        aria-label={label}
      >
        <Icon className="w-6 h-6" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    </div>
  );
};

export default FloatingActionButton;
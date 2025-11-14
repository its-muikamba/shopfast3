import React from 'react';
import { BellIcon } from './Icons';

interface FloatingActionButtonProps {
    onClick: () => void;
    primaryColor: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick, primaryColor }) => {
    return (
        <button
            onClick={onClick}
            style={{ backgroundColor: primaryColor }}
            className="fixed bottom-6 right-6 w-16 h-16 rounded-full text-white shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300 z-30"
            aria-label="Request service"
        >
            <BellIcon className="w-8 h-8" />
        </button>
    );
};

export default FloatingActionButton;

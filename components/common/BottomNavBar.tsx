import React from 'react';
import { Tab } from '../../types';
import { HomeIcon, SearchIcon, ReceiptIcon, UserCircleIcon } from '../Icons';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  hasNotification?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick, hasNotification }) => (
    <button
        onClick={onClick}
        className="relative group flex flex-col items-center justify-center w-24 h-24 transition-transform duration-300 ease-in-out focus:outline-none transform hover:-translate-y-2"
        style={{ transform: isActive ? 'translateY(-8px)' : 'none' }}
    >
        {/* Glassmorphic background circle */}
        <div className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-16 h-16 rounded-full
            transition-all duration-300 ease-in-out
            bg-white/10 backdrop-blur-md border border-white/10
            ${isActive ? 'opacity-100 animate-pulse-glow' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}
        `}></div>
        
        {/* Icon */}
        <div className="relative z-10">
            <Icon className={`
                w-7 h-7 
                transition-colors duration-300
                ${isActive ? 'text-primary' : 'text-copy-lighter group-hover:text-copy'}
            `} />
            {hasNotification && <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-brand-red ring-2 ring-background" />}
        </div>

        {/* Label */}
        <span className={`
            absolute bottom-4 text-xs z-10
            transition-all duration-300 ease-in-out
            font-bold
            ${isActive ? 'opacity-100 text-primary' : 'opacity-0'}
        `}>
            {label}
        </span>
    </button>
);


interface BottomNavBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  hasActiveOrder: boolean;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange, hasActiveOrder }) => {
  const navItems = [
    { id: Tab.HOME, label: 'Home', icon: HomeIcon },
    { id: Tab.DISCOVER, label: 'Discover', icon: SearchIcon },
    { id: Tab.ORDER, label: 'Order', icon: ReceiptIcon, notification: hasActiveOrder },
    { id: Tab.PROFILE, label: 'Profile', icon: UserCircleIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-28 z-30 pointer-events-none">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto pointer-events-auto">
        {navItems.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
            hasNotification={item.notification}
          />
        ))}
      </div>
    </div>
  );
};

export default BottomNavBar;
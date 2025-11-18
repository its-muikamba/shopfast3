import React from 'react';
import { CreditCardIcon, ShoppingCartIcon, StarIcon } from './Icons';

interface UsageStatsProps {
    totalSpent: number;
    orderCount: number;
    favoriteRestaurant: string;
    currencySymbol: string | null;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="glass-card p-4 rounded-xl flex-1">
        <div className="flex items-center">
            <div className="bg-surface rounded-lg p-2">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="ml-3">
                <p className="text-sm text-copy-light">{title}</p>
                <p className="text-lg font-bold text-copy">{value}</p>
            </div>
        </div>
    </div>
);

const UsageStats: React.FC<UsageStatsProps> = ({ totalSpent, orderCount, favoriteRestaurant, currencySymbol }) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <StatCard 
                title="Total Spent"
                value={`${currencySymbol || ''}${totalSpent.toFixed(2)}`}
                icon={CreditCardIcon}
            />
            <StatCard 
                title="Total Orders"
                value={orderCount}
                icon={ShoppingCartIcon}
            />
            <StatCard 
                title="Favorite"
                value={favoriteRestaurant}
                icon={StarIcon}
            />
        </div>
    );
};

export default UsageStats;
import React from 'react';
import { Building2Icon, CheckCircleIcon, ShoppingCartIcon, CreditCardIcon, FileTextIcon } from '../Icons';
import { Restaurant, LiveOrder, Transaction, SupportTicket } from '../../types';

const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ElementType, color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
                <p className="text-sm text-copy-light">{title}</p>
                <p className="text-2xl font-bold text-copy">{value}</p>
            </div>
        </div>
    </div>
);

interface HQOverviewProps {
    restaurants: Restaurant[];
    liveOrders: LiveOrder[];
    transactions: Transaction[];
    supportTickets: SupportTicket[];
}

const HQOverview: React.FC<HQOverviewProps> = ({ restaurants, liveOrders, transactions, supportTickets }) => {
    
    const totalRestaurants = restaurants.length;
    const activeRestaurants = restaurants.filter(r => r.status === 'active').length;
    const totalOrders = liveOrders.length;
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const openIssues = supportTickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <MetricCard 
                    title="Total Restaurants" 
                    value={totalRestaurants} 
                    icon={Building2Icon}
                    color="bg-blue-500"
                />
                <MetricCard 
                    title="Active Restaurants" 
                    value={activeRestaurants} 
                    icon={CheckCircleIcon}
                    color="bg-green-500"
                />
                <MetricCard 
                    title="Total Active Orders" 
                    value={totalOrders.toLocaleString()} 
                    icon={ShoppingCartIcon}
                    color="bg-yellow-500"
                />
                <MetricCard 
                    title="Total Revenue" 
                    value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                    icon={CreditCardIcon}
                    color="bg-brand-emerald"
                />
                <MetricCard 
                    title="Open Issues" 
                    value={openIssues} 
                    icon={FileTextIcon}
                    color="bg-red-500"
                />
            </div>

            <div className="mt-8 glass-card p-6 rounded-lg">
                <h3 className="text-xl font-bold text-copy mb-4">Platform Growth</h3>
                <div className="h-64 bg-surface/50 rounded-md flex items-center justify-center">
                    <p className="text-copy-light">Analytics charts will be displayed here.</p>
                </div>
            </div>
        </div>
    );
};

export default HQOverview;

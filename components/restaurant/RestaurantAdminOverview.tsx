import React from 'react';
import { CheckCircleIcon, ShoppingCartIcon, CreditCardIcon, StarIcon } from '../Icons';
import { LiveOrder, Transaction, Restaurant } from '../../types';

const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ElementType, color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-surface p-6 rounded-lg shadow-md border border-border">
        <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
                <p className="text-sm text-copy-light">{title}</p>
                <p className="text-2xl font-bold text-copy-rich">{value}</p>
            </div>
        </div>
    </div>
);

interface RestaurantAdminOverviewProps {
    restaurant: Restaurant;
    liveOrders: LiveOrder[];
    transactions: Transaction[];
}

const RestaurantAdminOverview: React.FC<RestaurantAdminOverviewProps> = ({ restaurant, liveOrders, transactions }) => {

    const isToday = (timestamp: number) => {
        const date = new Date(timestamp);
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    const todaysOrders = liveOrders.filter(o => o.acceptedAt && isToday(o.acceptedAt)).length;
    
    const todaysRevenue = transactions
        .filter(t => isToday(t.timestamp))
        .reduce((sum, t) => sum + t.amount, 0);

    const activeTables = liveOrders.filter(o => o.orderType === 'dine-in' && o.status !== 'Served' && o.paymentStatus !== 'paid').length;

  return (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <MetricCard 
                title="Today's Orders" 
                value={todaysOrders}
                icon={ShoppingCartIcon}
                color="bg-blue-500"
            />
            <MetricCard 
                title="Today's Revenue" 
                value={`${restaurant.currency.symbol}${todaysRevenue.toFixed(2)}`}
                icon={CreditCardIcon}
                color="bg-brand-emerald"
            />
            <MetricCard 
                title="Active Tables" 
                value={activeTables}
                icon={CheckCircleIcon}
                color="bg-green-500"
            />
            <MetricCard 
                title="Average Rating" 
                value={restaurant.rating}
                icon={StarIcon}
                color="bg-yellow-500"
            />
        </div>
         <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface p-6 rounded-lg shadow-md border border-border">
                <h3 className="text-xl font-bold text-copy-rich mb-4">Best Selling Items</h3>
                <div className="h-64 bg-background rounded-md flex items-center justify-center">
                    <p className="text-copy-light">Sales chart will be displayed here.</p>
                </div>
            </div>
             <div className="bg-surface p-6 rounded-lg shadow-md border border-border">
                <h3 className="text-xl font-bold text-copy-rich mb-4">Recent Feedback</h3>
                <div className="h-64 bg-background rounded-md flex items-center justify-center">
                    <p className="text-copy-light">Customer ratings will be displayed here.</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default RestaurantAdminOverview;
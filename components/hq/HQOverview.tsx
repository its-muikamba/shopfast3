import React from 'react';
import { HQ_METRICS } from '../../constants';
import { Building2Icon, CheckCircleIcon, ShoppingCartIcon, CreditCardIcon, FileTextIcon } from '../Icons';

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

const HQOverview: React.FC = () => {
    const metrics = HQ_METRICS;
    
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <MetricCard 
                    title="Total Restaurants" 
                    value={metrics.totalRestaurants} 
                    icon={Building2Icon}
                    color="bg-blue-500"
                />
                <MetricCard 
                    title="Active Restaurants" 
                    value={metrics.activeRestaurants} 
                    icon={CheckCircleIcon}
                    color="bg-green-500"
                />
                <MetricCard 
                    title="Total Orders" 
                    value={metrics.totalOrders.toLocaleString()} 
                    icon={ShoppingCartIcon}
                    color="bg-yellow-500"
                />
                <MetricCard 
                    title="Total Revenue" 
                    value={`$${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                    icon={CreditCardIcon}
                    color="bg-brand-emerald"
                />
                <MetricCard 
                    title="Open Issues" 
                    value={metrics.openIssues} 
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

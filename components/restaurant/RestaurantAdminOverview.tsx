import React from 'react';
import { CheckCircleIcon, ShoppingCartIcon, CreditCardIcon, StarIcon } from '../Icons';

const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ElementType, color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-brand-charcoal">{value}</p>
        </div>
    </div>
);


const RestaurantAdminOverview: React.FC = () => {
  return (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <MetricCard 
                title="Today's Orders" 
                value={124}
                icon={ShoppingCartIcon}
                color="bg-blue-500"
            />
            <MetricCard 
                title="Today's Revenue" 
                value={"$3,120.50"}
                icon={CreditCardIcon}
                color="bg-brand-emerald"
            />
            <MetricCard 
                title="Active Tables" 
                value={14}
                icon={CheckCircleIcon}
                color="bg-green-500"
            />
            <MetricCard 
                title="Average Rating" 
                value={"4.8"}
                icon={StarIcon}
                color="bg-yellow-500"
            />
        </div>
         <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-brand-charcoal mb-4">Best Selling Items</h3>
                <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center">
                    <p className="text-gray-500">Sales chart will be displayed here.</p>
                </div>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-brand-charcoal mb-4">Recent Feedback</h3>
                <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center">
                    <p className="text-gray-500">Customer ratings will be displayed here.</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default RestaurantAdminOverview;

import React from 'react';
import { RestaurantReportData } from '../../types';
import { CreditCardIcon, ShoppingCartIcon, UsersIcon, FileTextIcon, ShoppingCartOffIcon } from '../Icons';

const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
            <div className="flex-shrink-0">
                <Icon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
                <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                    <dd className="text-2xl font-bold text-gray-900">{value}</dd>
                </dl>
            </div>
        </div>
    </div>
);

const BarChart: React.FC<{ data: { hour: string; orders: number }[] }> = ({ data }) => {
    const maxOrders = Math.max(...data.map(d => d.orders), 0);
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak & Off-Peak Hours</h3>
            <div className="flex justify-between items-end h-64 space-x-2">
                {data.map(({ hour, orders }) => (
                    <div key={hour} className="flex-1 flex flex-col items-center justify-end">
                        <div 
                            className="w-full bg-brand-emerald rounded-t-md transition-all duration-500"
                            style={{ height: `${(orders / maxOrders) * 100}%` }}
                            title={`${orders} orders`}
                        ></div>
                        <span className="text-xs text-gray-500 mt-2">{hour}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PopularItemsChart: React.FC<{ items: { id: string; name: string; orderCount: number }[] }> = ({ items }) => {
    const topItems = items.slice(0, 5); // Display top 5 items
    const maxCount = Math.max(...topItems.map(item => item.orderCount), 1); // Avoid division by zero

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Items</h3>
            <div className="space-y-4">
                {topItems.map((item) => (
                    <div key={item.id} className="w-full">
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium text-gray-700">{item.name}</span>
                            <span className="font-bold text-gray-900">{item.orderCount}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-brand-emerald h-4 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${(item.orderCount / maxCount) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


interface RestaurantReportsProps {
    data: RestaurantReportData;
}

const RestaurantReports: React.FC<RestaurantReportsProps> = ({ data }) => {
    const { metrics, hourlyActivity, popularItems } = data;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard 
                    title="Total Revenue" 
                    value={`$${metrics.totalRevenue.toFixed(2)}`}
                    icon={CreditCardIcon}
                />
                <MetricCard 
                    title="Total Orders" 
                    value={metrics.totalOrders}
                    icon={ShoppingCartIcon}
                />
                 <MetricCard 
                    title="Avg. Order Value" 
                    value={`$${metrics.averageOrderValue.toFixed(2)}`}
                    icon={FileTextIcon}
                />
                <MetricCard 
                    title="Total Customers" 
                    value={metrics.totalCustomers}
                    icon={UsersIcon}
                />
                <MetricCard 
                    title="Abandoned Carts" 
                    value={metrics.abandonedCarts}
                    icon={ShoppingCartOffIcon}
                />
                <MetricCard 
                    title="Abandoned Cart Value" 
                    value={`$${metrics.abandonedCartValue.toFixed(2)}`}
                    icon={ShoppingCartOffIcon}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <BarChart data={hourlyActivity} />
                </div>
                <div>
                    <PopularItemsChart items={popularItems} />
                </div>
            </div>

             <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                <p className="text-sm text-gray-600">
                    High-level cart abandonment data is now available. Detailed item-by-item abandonment analysis, customer return rates, and more will be available with a live backend connection.
                </p>
            </div>
        </div>
    );
};

export default RestaurantReports;
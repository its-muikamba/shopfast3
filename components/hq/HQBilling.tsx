import React, { useState, useMemo } from 'react';
import { Restaurant, BillingHistory } from '../../types';

const ManageBillingModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    restaurant: Restaurant | null;
    billingHistory: BillingHistory[];
    onUpdateRestaurant: (restaurant: Restaurant) => void;
}> = ({ isOpen, onClose, restaurant, billingHistory, onUpdateRestaurant }) => {
    const [selectedTier, setSelectedTier] = useState(restaurant?.subscription || 'basic');

    if (!isOpen || !restaurant) return null;

    const handleSave = () => {
        onUpdateRestaurant({ ...restaurant, subscription: selectedTier });
        onClose();
    };

    const hasDeliveryFeature = restaurant.subscription === 'premium' || restaurant.subscription === 'enterprise';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-brand-charcoal">Manage Billing for {restaurant.name}</h2>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Subscription Management */}
                    <div className="border p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-4">Subscription Tier</h3>
                        <div className="flex items-center gap-4">
                            <select
                                value={selectedTier}
                                onChange={(e) => setSelectedTier(e.target.value as Restaurant['subscription'])}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold sm:text-sm"
                            >
                                <option value="basic">Basic</option>
                                <option value="premium">Premium</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-brand-charcoal rounded-md hover:bg-opacity-90">
                                Save Tier
                            </button>
                        </div>
                    </div>

                    {/* Features enabled by Tier */}
                    <div className="border p-4 rounded-md">
                         <h3 className="text-lg font-semibold mb-2">Features</h3>
                         <p className="text-sm text-gray-500 mb-4">Enabled based on subscription tier.</p>
                         <div className="space-y-2">
                            <div className={`flex items-center justify-between p-2 rounded-md ${hasDeliveryFeature ? 'bg-green-50' : 'bg-gray-50'}`}>
                                <span className={`font-medium ${hasDeliveryFeature ? 'text-green-800' : 'text-gray-500'}`}>Delivery Management</span>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${hasDeliveryFeature ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {hasDeliveryFeature ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                         </div>
                    </div>


                    {/* Billing History */}
                    <div className="border p-4 rounded-md">
                         <h3 className="text-lg font-semibold mb-4">Billing History</h3>
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoice ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billingHistory.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-2 text-sm">{item.date}</td>
                                            <td className="px-4 py-2 text-sm">${item.amount.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-sm">
                                                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm font-mono">{item.invoiceId}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-lg border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Close</button>
                </div>
            </div>
        </div>
    );
};

const HQBilling: React.FC<{
    restaurants: Restaurant[];
    billingHistory: BillingHistory[];
    onUpdateRestaurant: (restaurant: Restaurant) => void;
}> = ({ restaurants, billingHistory, onUpdateRestaurant }) => {
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

    const restaurantBillingHistory = useMemo(() => {
        if (!selectedRestaurant) return [];
        return billingHistory.filter(bh => bh.restaurantId === selectedRestaurant.id);
    }, [selectedRestaurant, billingHistory]);
    
    return (
        <div>
             <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription Tier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Billing Date</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {restaurants.map(r => (
                            <tr key={r.id}>
                                <td className="px-6 py-4 font-medium">{r.name}</td>
                                <td className="px-6 py-4 text-sm capitalize">{r.subscription}</td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${r.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {r.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm">{r.nextBillingDate}</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => setSelectedRestaurant(r)} className="px-3 py-1 text-xs font-medium text-white bg-brand-charcoal rounded-md hover:bg-opacity-80">
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ManageBillingModal 
                isOpen={!!selectedRestaurant}
                onClose={() => setSelectedRestaurant(null)}
                restaurant={selectedRestaurant}
                billingHistory={restaurantBillingHistory}
                onUpdateRestaurant={onUpdateRestaurant}
            />
        </div>
    );
};

export default HQBilling;
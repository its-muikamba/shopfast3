import React, { useState } from 'react';
import { LiveOrder, Restaurant } from '../types';
import { ChevronDownIcon } from './Icons';

interface OrderHistoryCardProps {
    order: LiveOrder;
    restaurant: Restaurant;
}

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({ order, restaurant }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Mock date for display purposes
    const orderDate = new Date(parseInt(order.id.split('-')[1])).toLocaleDateString();

    return (
        <div className="glass-card rounded-2xl p-4 transition-all duration-300">
            <div className="flex items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <img src={restaurant.logoUrl} alt={restaurant.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="ml-4 flex-grow">
                    <h3 className="font-bold text-copy">{restaurant.name}</h3>
                    <p className="text-sm text-copy-light">{orderDate}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-copy">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-copy-light">{order.items.length} items</p>
                </div>
                 <ChevronDownIcon className={`w-6 h-6 ml-2 text-copy-light transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-surface-light">
                    <h4 className="font-semibold text-copy-light mb-2">Order Details:</h4>
                    <div className="space-y-2">
                        {order.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <span className="text-copy-light">{item.name} <span className="text-copy-lighter">x{item.quantity}</span></span>
                                <span className="font-medium text-copy">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                     <div className="border-t border-surface-light my-2"></div>
                     <div className="flex justify-between font-bold text-copy text-right">
                        <span>Total Paid</span>
                        <span>${order.total.toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistoryCard;
import React, { useState } from 'react';
import { ACTIVE_ORDERS } from '../../constants';
import { Order, OrderStatus } from '../../types';

const statusColors: Record<OrderStatus, { bg: string, text: string, border: string }> = {
    'Received': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500' },
    'Preparing': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500' },
    'On Route': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-500' },
    'Served': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
    'Paid': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500' },
    'Verified': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-500' },
};

const OrderCard: React.FC<{ order: Omit<Order, 'restaurant'>, onUpdateStatus: (orderId: string, status: OrderStatus) => void }> = ({ order, onUpdateStatus }) => {
    const colors = statusColors[order.status] || statusColors['Paid'];
    return (
        <div className={`bg-white rounded-lg shadow-md border-l-4 ${colors.border} p-4 flex flex-col`}>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">Table {order.tableNumber}</h3>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors.bg} ${colors.text}`}>{order.status}</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Order ID: {order.id}</p>
            <div className="space-y-1 flex-grow">
                {order.items.map(item => (
                    <div key={item.id} className="text-sm flex justify-between">
                        <span>{item.name} <span className="text-gray-500">x{item.quantity}</span></span>
                    </div>
                ))}
            </div>
            <div className="mt-4 border-t pt-3 flex gap-2">
                {order.status === 'On Route' && (
                     <button onClick={() => onUpdateStatus(order.id, 'Served')} className="w-full text-sm bg-brand-emerald text-white font-semibold py-2 px-3 rounded-md hover:bg-opacity-90 transition">
                        Mark as Served
                    </button>
                )}
            </div>
        </div>
    )
}

const ServerView: React.FC<{ restaurantId: string }> = ({ restaurantId }) => {
    // In a real app, this would be fetched and updated via WebSocket
    const [orders, setOrders] = useState(ACTIVE_ORDERS);

    const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
        setOrders(currentOrders => currentOrders.map(o => o.id === orderId ? {...o, status: newStatus } : o));
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {orders
                    .sort((a, b) => a.tableNumber - b.tableNumber)
                    .map(order => (
                    <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
                ))}
            </div>
        </div>
    )
};

export default ServerView;

import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../types';
import { CheckCircleIcon } from './Icons';

// Server-driven flow means the server manually moves status to 'Served'.
const STATUS_SEQUENCE: OrderStatus[] = ['Received', 'Preparing', 'On Route', 'Served'];

interface StatusItemProps {
    status: string;
    isCompleted: boolean;
    isCurrent: boolean;
}

const StatusItem: React.FC<StatusItemProps> = ({ status, isCompleted, isCurrent }) => {
    return (
        <div className="flex items-center">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isCompleted || isCurrent ? 'bg-brand-emerald text-white' : 'bg-gray-200 text-gray-500'}`}>
                <CheckCircleIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
                <h4 className={`font-bold text-lg transition-colors duration-500 ${isCompleted || isCurrent ? 'text-brand-charcoal' : 'text-gray-400'}`}>{status}</h4>
                {isCurrent && <p className="text-sm text-brand-emerald animate-pulse">In progress...</p>}
            </div>
        </div>
    );
};

interface OrderTrackerScreenProps {
  order: Order;
  setOrder: React.Dispatch<React.SetStateAction<Order | null>>;
  onOrderServed: () => void;
}

const OrderTrackerScreen: React.FC<OrderTrackerScreenProps> = ({ order, setOrder, onOrderServed }) => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        // The automatic progression from 'On Route' to 'Served' is removed.
        // This is now triggered by the server's action.
        if (order.status === 'Served') {
            const finalTimer = setTimeout(() => {
                onOrderServed();
            }, 2000); // Wait 2 seconds on "Served" before moving to payment
            return () => clearTimeout(finalTimer);
        }
    }, [order.status, onOrderServed]);

    useEffect(() => {
        const activeTrackingStatuses: OrderStatus[] = ['Received', 'Preparing', 'On Route', 'Out for Delivery'];
        if (activeTrackingStatuses.includes(order.status) && order.preparationTime && order.acceptedAt) {
            const calculateTimeLeft = () => {
                const now = Date.now();
                const endTime = order.acceptedAt! + order.preparationTime! * 60 * 1000;
                const secondsLeft = Math.round((endTime - now) / 1000);
                setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);
            };
            calculateTimeLeft();
            const interval = setInterval(calculateTimeLeft, 1000);
            return () => clearInterval(interval);
        } else {
            setTimeLeft(null); // Clear timer if not in an active tracking state
        }
    }, [order.status, order.preparationTime, order.acceptedAt]);

    const getProgressBarWidth = () => {
        const currentIndex = STATUS_SEQUENCE.indexOf(order.status);
        return `${(currentIndex / (STATUS_SEQUENCE.length - 1)) * 100}%`;
    }

    const formatTime = (seconds: number) => {
        if (seconds <= 0) return "Arriving now";
        const mins = Math.ceil(seconds / 60);
        return `~${mins} min`;
    };

    const getOrderMessage = () => {
        switch (order.orderType) {
            case 'dine-in':
                return `We'll bring it to Table ${order.tableNumber}.`;
            case 'takeaway':
                return `We'll notify you when it's ready for pickup.`;
            case 'delivery':
                return `It's on its way to ${order.deliveryAddress}.`;
            default:
                return '';
        }
    };

    return (
        <div className="bg-white min-h-screen p-6 flex flex-col justify-center items-center text-center">
            {/* Restaurant Branding */}
            <div className="absolute top-6 text-center">
                <img src={order.restaurant.logoUrl} alt={order.restaurant.name} className="w-16 h-16 rounded-full mx-auto shadow-md mb-2" />
                <p className="font-semibold text-gray-700">{order.restaurant.name}</p>
            </div>

            <div className="mb-8 mt-24">
                <h1 className="font-serif text-3xl font-bold text-brand-charcoal">Your order is on its way, {order.orderName}!</h1>
                <p className="text-gray-500">
                    {getOrderMessage()}
                </p>
                 <p className="text-xs text-gray-400 mt-2">Order ID: {order.id}</p>
            </div>

            <div className="w-full max-w-sm relative">
                <div className="absolute left-5 top-0 bottom-0 w-1 bg-gray-200 rounded-full">
                     <div className="absolute top-0 left-0 w-full h-full bg-brand-emerald rounded-full transition-all duration-1000" style={{ height: getProgressBarWidth() }}></div>
                </div>
                <div className="space-y-8 relative">
                    {STATUS_SEQUENCE.map((status, index) => {
                        const currentStatusIndex = STATUS_SEQUENCE.indexOf(order.status);
                        return (
                            <StatusItem 
                                key={status}
                                status={status}
                                isCompleted={index < currentStatusIndex}
                                isCurrent={index === currentStatusIndex}
                            />
                        )
                    })}
                </div>
            </div>

            <div className="w-full max-w-sm bg-gray-50 rounded-2xl p-4 my-8 border border-gray-200">
                <h3 className="font-bold text-md text-left mb-3 text-brand-charcoal">Your Order</h3>
                <div className="space-y-2 text-left text-sm">
                    {order.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                            <span className="text-gray-600">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                            <span className="font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t my-3"></div>
                <div className="flex justify-between font-bold text-lg text-brand-charcoal text-right">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                </div>
            </div>

            <div className="text-center">
                <p className="text-gray-600">
                     {order.status === 'Served' || order.status === 'Delivered' ? 'Enjoy your meal!' : 'Estimated Time Remaining'}
                </p>
                <p className="font-bold text-2xl text-brand-charcoal">
                    {timeLeft !== null 
                        ? formatTime(timeLeft) 
                        : (order.preparationTime ? `~${order.preparationTime} min` : 'Waiting for kitchen...')}
                </p>
            </div>
        </div>
    );
};

export default OrderTrackerScreen;
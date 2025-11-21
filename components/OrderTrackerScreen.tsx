
import React, { useEffect, useState } from 'react';
import { Order, OrderStatus, OrderType } from '../types';
import { CheckCircleIcon } from './Icons';

const getStatusSequence = (orderType: OrderType): OrderStatus[] => {
    switch (orderType) {
        case 'dine-in':
            return ['Pending', 'Received', 'Preparing', 'On Route', 'Served'];
        case 'takeaway':
            // 'On Route' is repurposed as 'Ready for Pickup' in the label logic
            return ['Pending', 'Received', 'Preparing', 'On Route']; 
        case 'delivery':
            return ['Pending', 'Received', 'Preparing', 'Out for Delivery', 'Delivered'];
        default:
            return ['Pending', 'Received', 'Preparing'];
    }
};

const getStatusLabel = (status: OrderStatus, orderType: OrderType): string => {
    if (status === 'Pending') return 'Order Sent';
    if (status === 'On Route') {
        return orderType === 'takeaway' ? 'Ready for Pickup' : 'Coming to Table';
    }
    return status;
};

interface StatusItemProps {
    status: string;
    isCompleted: boolean;
    isCurrent: boolean;
}

const StatusItem: React.FC<StatusItemProps> = ({ status, isCompleted, isCurrent }) => {
    return (
        <div className="flex items-center">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${isCompleted || isCurrent ? 'bg-primary border-primary/50 text-brand-charcoal' : 'bg-surface-light border-primary/20 text-copy-light'}`}>
                <CheckCircleIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
                <h4 className={`font-bold text-lg transition-colors duration-500 ${isCompleted || isCurrent ? 'text-copy' : 'text-copy-lighter'}`}>{status}</h4>
                {isCurrent && <p className="text-sm text-secondary animate-pulse">In progress...</p>}
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
    const statusSequence = getStatusSequence(order.orderType);

    useEffect(() => {
        // Automatically move to payment screen if the order is served, delivered, or paid
        const finalStatuses: OrderStatus[] = ['Served', 'Delivered', 'Paid', 'Verified'];
        if (finalStatuses.includes(order.status)) {
            const finalTimer = setTimeout(() => {
                onOrderServed();
            }, 2000); 
            return () => clearTimeout(finalTimer);
        }
    }, [order.status, onOrderServed]);

    useEffect(() => {
        // Only show timer for active preparation phases
        const activeTrackingStatuses: OrderStatus[] = ['Received', 'Preparing'];
        
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
            // If we are past 'Preparing' (e.g. On Route), the prep timer is no longer relevant/accurate
            setTimeLeft(null);
        }
    }, [order.status, order.preparationTime, order.acceptedAt]);

    const getProgressBarHeight = () => {
        const currentIndex = statusSequence.indexOf(order.status);
        if (currentIndex < 0) {
             // Handle Paid/Verified which might not be in the visible sequence but imply completion
             if (['Paid', 'Verified', 'Served', 'Delivered'].includes(order.status)) return '100%';
             return '0%';
        }
        return `${(currentIndex / (statusSequence.length - 1)) * 100}%`;
    }

    const formatTime = (seconds: number) => {
        if (seconds <= 0) {
             return "Almost ready";
        }
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

    const isFinalStep = ['Served', 'Delivered', 'Paid', 'Verified'].includes(order.status) || (order.orderType === 'takeaway' && order.status === 'On Route');

    return (
        <div className="min-h-screen p-6 flex flex-col justify-center items-center text-center">
            <div className="absolute top-6 text-center">
                <img src={order.restaurant.logoUrl} alt={order.restaurant.name} className="w-16 h-16 rounded-full mx-auto shadow-md mb-2" />
                <p className="font-semibold text-copy-light">{order.restaurant.name}</p>
            </div>

            <div className="mb-8 mt-24">
                <h1 className="font-sans text-3xl font-bold text-copy">
                    {order.status === 'Pending' ? `Sending order, ${order.orderName}...` : `Your order is being prepared, ${order.orderName}!`}
                </h1>
                <p className="text-copy-light">
                    {getOrderMessage()}
                </p>
                 <p className="text-xs text-copy-lighter mt-2">Order ID: {order.id}</p>
            </div>

            <div className="w-full max-w-sm relative">
                <div className="absolute left-5 top-0 bottom-0 w-1 bg-surface-light rounded-full">
                     <div className="absolute top-0 left-0 w-full bg-primary rounded-full transition-all duration-1000" style={{ height: getProgressBarHeight() }}></div>
                </div>
                <div className="space-y-8 relative">
                    {statusSequence.map((status, index) => {
                        const currentStatusIndex = statusSequence.indexOf(order.status);
                        // If status is 'Paid' or 'Verified', assume sequence complete
                        const effectiveIndex = ['Paid', 'Verified'].includes(order.status) ? statusSequence.length : currentStatusIndex;
                        
                        return (
                            <StatusItem 
                                key={status}
                                status={getStatusLabel(status, order.orderType)}
                                isCompleted={index < effectiveIndex}
                                isCurrent={index === effectiveIndex}
                            />
                        )
                    })}
                </div>
            </div>

            <div className="w-full max-w-sm glass-card rounded-2xl p-4 my-8">
                <h3 className="font-bold text-md text-left mb-3 text-copy">Your Order</h3>
                <div className="space-y-2 text-left text-sm">
                    {order.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center">
                            <span className="text-copy-light">{item.name} <span className="text-copy-lighter">x{item.quantity}</span></span>
                            <span className="font-medium text-copy">{order.restaurant.currency.symbol}{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-primary/20 my-3"></div>
                <div className="flex justify-between font-bold text-lg text-copy text-right">
                    <span>Total</span>
                    <span>{order.restaurant.currency.symbol}{order.total.toFixed(2)}</span>
                </div>
            </div>

            <div className="text-center">
                <p className="text-copy-light">
                     {isFinalStep ? 'Enjoy your meal!' : 'Estimated Time Remaining'}
                </p>
                <p className="font-bold text-2xl text-copy">
                    {timeLeft !== null 
                        ? formatTime(timeLeft) 
                        : (order.preparationTime ? `~${order.preparationTime} min` : (order.status === 'Pending' ? 'Sending...' : 'Waiting for kitchen...'))}
                </p>
            </div>
        </div>
    );
};

export default OrderTrackerScreen;

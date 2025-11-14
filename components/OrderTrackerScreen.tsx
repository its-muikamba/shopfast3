import React, { useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { CheckCircleIcon } from './Icons';

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
    
    useEffect(() => {
        const currentStatusIndex = STATUS_SEQUENCE.indexOf(order.status);
        if (currentStatusIndex < STATUS_SEQUENCE.length - 1) {
            const timer = setTimeout(() => {
                const nextStatus = STATUS_SEQUENCE[currentStatusIndex + 1];
                setOrder(prevOrder => prevOrder ? { ...prevOrder, status: nextStatus } : null);
            }, 5000); // 5 seconds for demo
            return () => clearTimeout(timer);
        } else if (order.status === 'Served') {
            const finalTimer = setTimeout(() => {
                onOrderServed();
            }, 2000);
            return () => clearTimeout(finalTimer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order.status, setOrder, onOrderServed]);

    const getProgressBarWidth = () => {
        const currentIndex = STATUS_SEQUENCE.indexOf(order.status);
        return `${(currentIndex / (STATUS_SEQUENCE.length - 1)) * 100}%`;
    }

    return (
        <div className="bg-white min-h-screen p-6 flex flex-col justify-center items-center text-center">
            <div className="mb-8">
                <img src={order.restaurant.logoUrl} alt={order.restaurant.name} className="w-24 h-24 rounded-full mx-auto shadow-lg mb-4" />
                <h1 className="font-serif text-3xl font-bold text-brand-charcoal">Your order is on its way, {order.orderName}!</h1>
                <p className="text-gray-500">
                    {order.orderType === 'dine-in' && `We'll bring it to Table ${order.tableNumber}.`}
                    {order.orderType === 'takeaway' && `We'll notify you when it's ready for pickup.`}
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

            <div className="mt-12 text-center">
                <p className="text-gray-600">Estimated Arrival</p>
                <p className="font-bold text-2xl text-brand-charcoal">10-15 minutes</p>
            </div>
        </div>
    );
};

export default OrderTrackerScreen;

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { XIcon } from '../Icons';

const AcceptOrderModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (prepTime: number) => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    const [prepTime, setPrepTime] = useState(15);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-black"><XIcon className="w-5 h-5" /></button>
                <h3 className="text-lg font-semibold mb-4">Accept Order</h3>
                <p className="text-sm text-gray-600 mb-4">Set the estimated preparation time for this order.</p>
                <div className="flex items-center justify-center gap-4 my-6">
                    <button onClick={() => setPrepTime(p => Math.max(5, p - 5))} className="w-12 h-12 rounded-full bg-gray-200 text-2xl">-</button>
                    <span className="text-4xl font-bold w-24 text-center">{prepTime}</span>
                    <button onClick={() => setPrepTime(p => p + 5)} className="w-12 h-12 rounded-full bg-gray-200 text-2xl">+</button>
                </div>
                <p className="text-center text-gray-500 mb-6 -mt-2">minutes</p>
                <button onClick={() => onConfirm(prepTime)} className="w-full bg-brand-emerald text-white font-bold py-3 rounded-lg">Accept & Start Preparing</button>
            </div>
        </div>
    );
};

const OrderTicket: React.FC<{ order: Omit<Order, 'restaurant'>, onAccept: () => void }> = ({ order, onAccept }) => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        if (order.status === 'Preparing' && order.preparationTime && order.acceptedAt) {
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
            setTimeLeft(null);
        }
    }, [order.status, order.preparationTime, order.acceptedAt]);

    const formatTime = (seconds: number) => {
        if (seconds <= 0) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    const isUrgent = timeLeft !== null && timeLeft < 5 * 60; // Less than 5 minutes

    return (
        <div className={`bg-white p-3 rounded-md shadow-sm border ${isUrgent ? 'border-red-500' : ''}`}>
            <div className="flex justify-between items-center border-b pb-2 mb-2">
                <h4 className="font-bold">{order.tableNumber ? `Table ${order.tableNumber}`: 'Takeaway'}</h4>
                 {order.orderType === 'delivery' && <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">DELIVERY</span>}
                <span className="text-xs text-gray-500">{order.id.slice(-6)}</span>
            </div>
            <div className="space-y-1">
                {order.items.map(item => (
                    <p key={item.id} className="text-sm">
                        <span className="font-semibold">{item.quantity}x</span> {item.name}
                    </p>
                ))}
            </div>
            {order.status === 'Pending' && (
                <button onClick={onAccept} className="w-full mt-3 bg-brand-emerald text-white text-sm font-bold py-1.5 rounded-md">Accept Order</button>
            )}
            {timeLeft !== null && (
                <div className={`mt-2 text-center font-bold text-lg rounded-md p-1 ${isUrgent ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100'}`}>
                    {formatTime(timeLeft)}
                </div>
            )}
        </div>
    );
};

const KitchenColumn: React.FC<{ title: string; orders: Omit<Order, 'restaurant'>[]; onDrop?: (orderId: string) => void; onAcceptOrder?: (orderId: string) => void; isDropZone?: boolean; isCollapsed?: boolean }> = ({ title, orders, onDrop, onAcceptOrder, isDropZone = true, isCollapsed = false }) => {
    
    const handleDragOver = (e: React.DragEvent) => {
        if (isDropZone) e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        if (isDropZone && onDrop) {
            e.preventDefault();
            const orderId = e.dataTransfer.getData("orderId");
            onDrop(orderId);
        }
    };

    const handleDragStart = (e: React.DragEvent, orderId: string) => {
        e.dataTransfer.setData("orderId", orderId);
    };
    
    if (isCollapsed) return null;

    return (
        <div 
            className="bg-gray-100 rounded-lg p-4 flex-1 min-w-[280px]"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <h3 className="font-bold text-lg text-brand-charcoal mb-4 text-center">{title} ({orders.length})</h3>
            <div className="space-y-3 h-[60vh] overflow-y-auto p-1">
                {orders.map(order => (
                     <div key={order.id} draggable={order.status !== 'Pending'} onDragStart={(e) => handleDragStart(e, order.id)}>
                        <OrderTicket order={order} onAccept={() => onAcceptOrder && onAcceptOrder(order.id)} />
                    </div>
                ))}
            </div>
        </div>
    );
};

interface KitchenViewProps {
  orders: Omit<Order, 'restaurant'>[];
  onUpdateOrders: React.Dispatch<React.SetStateAction<Omit<Order, 'restaurant'>[]>>;
  onAcceptOrder: (orderId: string, prepTime: number) => void;
}

const KitchenView: React.FC<KitchenViewProps> = ({ orders, onUpdateOrders, onAcceptOrder }) => {
    const [orderToAccept, setOrderToAccept] = useState<string | null>(null);
    const [showCompleted, setShowCompleted] = useState(false);
    
    const handleDrop = (orderId: string, newStatus: OrderStatus) => {
        onUpdateOrders(prevOrders => {
            const orderToMove = prevOrders.find(o => o.id === orderId);
            if(orderToMove && orderToMove.status !== newStatus) {
                return prevOrders.map(o => o.id === orderId ? {...o, status: newStatus} : o);
            }
            return prevOrders;
        });
    };
    
    useEffect(() => {
        const interval = setInterval(() => {
            onUpdateOrders(prev => {
                const now = Date.now();
                // Move orders that have been "On Route" for more than 2 minutes to a final state
                const finalState: OrderStatus = 'Verified'; // Generic completed state
                return prev.map(o => {
                    if (o.status === 'On Route' && o.acceptedAt && (now - o.acceptedAt > 2 * 60 * 1000)) {
                        return {...o, status: finalState};
                    }
                    return o;
                })
            });
        }, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, [onUpdateOrders]);

    const handleConfirmAccept = (prepTime: number) => {
        if (orderToAccept) {
            onAcceptOrder(orderToAccept, prepTime);
            setOrderToAccept(null);
        }
    };
    
    const pending = orders.filter(o => o.status === 'Pending');
    const preparing = orders.filter(o => o.status === 'Received' || o.status === 'Preparing');
    const ready = orders.filter(o => o.status === 'On Route' || o.status === 'Out for Delivery');
    const completed = orders.filter(o => o.status === 'Served' || o.status === 'Paid' || o.status === 'Verified' || o.status === 'Delivered');

    return (
        <div className="flex gap-6 h-full">
            <KitchenColumn title="Pending" orders={pending} onAcceptOrder={setOrderToAccept} isDropZone={false}/>
            <KitchenColumn title="Preparing" orders={preparing} onDrop={(id) => handleDrop(id, 'Preparing')} />
            <KitchenColumn title="Ready for Pickup" orders={ready} onDrop={(id) => handleDrop(id, 'On Route')} />
            <div className="flex flex-col">
                <button onClick={() => setShowCompleted(s => !s)} className="text-sm font-semibold mb-4">{showCompleted ? 'Hide' : 'Show'} Completed ({completed.length})</button>
                <KitchenColumn title="Completed Today" orders={completed} isDropZone={false} isCollapsed={!showCompleted} />
            </div>
            <AcceptOrderModal 
                isOpen={!!orderToAccept}
                onClose={() => setOrderToAccept(null)}
                onConfirm={handleConfirmAccept}
            />
        </div>
    );
};

export default KitchenView;
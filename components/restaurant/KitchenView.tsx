import React, { useState } from 'react';
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
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-sm p-6 relative border border-border">
                <button onClick={onClose} className="absolute top-3 right-3 text-copy-lighter hover:text-copy-rich"><XIcon className="w-5 h-5" /></button>
                <h3 className="text-lg font-semibold mb-4 text-copy-rich">Accept Order</h3>
                <p className="text-sm text-copy-light mb-4">Set the estimated preparation time for this order.</p>
                <div className="flex items-center justify-center gap-4 my-6">
                    <button onClick={() => setPrepTime(p => Math.max(5, p - 5))} className="w-12 h-12 rounded-full bg-surface-light text-2xl text-copy-rich">-</button>
                    <span className="text-4xl font-bold w-24 text-center text-copy-rich">{prepTime}</span>
                    <button onClick={() => setPrepTime(p => p + 5)} className="w-12 h-12 rounded-full bg-surface-light text-2xl text-copy-rich">+</button>
                </div>
                <p className="text-center text-copy-light mb-6 -mt-2">minutes</p>
                <button onClick={() => onConfirm(prepTime)} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">Accept & Start Preparing</button>
            </div>
        </div>
    );
};

const OrderTicket: React.FC<{ order: Omit<Order, 'restaurant'>, onAcceptClick?: () => void }> = ({ order, onAcceptClick }) => {
    const isDineIn = order.orderType === 'dine-in' && order.tableNumber;
    const headerText = isDineIn ? `Table ${order.tableNumber}` : order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1);

    return (
        <div className="bg-surface-raised p-3 rounded-lg shadow-md border border-border">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-copy-rich">{headerText}</h4>
                <span className="text-xs text-copy-lighter font-mono">ORD-{order.id.slice(-6)}</span>
            </div>
            <div className="space-y-1 border-t pt-2 border-border">
                {order.items.map(item => (
                    <p key={item.id} className="text-sm text-copy">
                        <span className="font-semibold">{item.quantity}x</span> {item.name}
                    </p>
                ))}
            </div>
            {order.status === 'Pending' && onAcceptClick && (
                <button 
                    onClick={onAcceptClick} 
                    className="w-full mt-3 bg-blue-600 text-white text-sm font-bold py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Accept
                </button>
            )}
        </div>
    );
};

const KitchenColumn: React.FC<{ 
    title: string; 
    count: number;
    children: React.ReactNode; 
    onDrop?: (orderId: string) => void;
}> = ({ title, count, children, onDrop }) => {
    
    const handleDragOver = (e: React.DragEvent) => {
        if (onDrop) e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        if (onDrop) {
            e.preventDefault();
            const orderId = e.dataTransfer.getData("orderId");
            onDrop(orderId);
        }
    };

    return (
        <div 
            className="bg-surface rounded-xl p-3 flex-1 min-w-[300px] max-w-[400px] flex flex-col border border-border"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <h3 className="font-bold text-lg text-copy-rich mb-4 text-center px-2 py-1">{title} ({count})</h3>
            <div className="space-y-3 h-full overflow-y-auto p-1">
                {children}
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

    const handleDrop = (orderId: string, newStatus: OrderStatus) => {
        const orderToMove = orders.find(o => o.id === orderId);
        // Only allow moving from Preparing to Ready. New orders must be accepted.
        if (orderToMove && (orderToMove.status === 'Received' || orderToMove.status === 'Preparing')) {
            onUpdateOrders(prevOrders => 
                prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
            );
        }
    };

    const handleConfirmAccept = (prepTime: number) => {
        if (orderToAccept) {
            onAcceptOrder(orderToAccept, prepTime);
            setOrderToAccept(null);
        }
    };
    
    const handleDragStart = (e: React.DragEvent, orderId: string) => {
        e.dataTransfer.setData("orderId", orderId);
    };

    const newOrders = orders.filter(o => o.status === 'Pending');
    const preparingOrders = orders.filter(o => o.status === 'Received' || o.status === 'Preparing');
    const readyForPickupOrders = orders.filter(o => o.status === 'On Route' || o.status === 'Out for Delivery');

    return (
        <div className="h-full -m-8 flex flex-col">
            <div className="flex gap-6 flex-1 p-8">
                <KitchenColumn title="New Orders" count={newOrders.length}>
                    {newOrders.map(order => (
                        <OrderTicket key={order.id} order={order} onAcceptClick={() => setOrderToAccept(order.id)} />
                    ))}
                </KitchenColumn>

                <KitchenColumn title="Preparing" count={preparingOrders.length} onDrop={(id) => handleDrop(id, 'Preparing')}>
                    {preparingOrders.map(order => (
                         <div key={order.id} draggable onDragStart={(e) => handleDragStart(e, order.id)}>
                            <OrderTicket order={order} />
                        </div>
                    ))}
                </KitchenColumn>
                
                <KitchenColumn title="Ready for Pickup" count={readyForPickupOrders.length} onDrop={(id) => handleDrop(id, 'On Route')}>
                     {readyForPickupOrders.map(order => (
                         <div key={order.id} draggable onDragStart={(e) => handleDragStart(e, order.id)}>
                            <OrderTicket order={order} />
                        </div>
                    ))}
                </KitchenColumn>
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
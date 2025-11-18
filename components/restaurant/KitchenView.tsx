import React, { useState, useEffect } from 'react';
import { LiveOrder, OrderStatus } from '../../types';
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

const Timer: React.FC<{ acceptedAt: number; preparationTime: number }> = ({ acceptedAt, preparationTime }) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(Math.floor((Date.now() - acceptedAt) / 1000));

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - acceptedAt) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [acceptedAt]);

    const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
    const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');

    const isOverdue = elapsedSeconds > preparationTime * 60;

    return (
        <div className={`text-sm font-mono mt-2 font-semibold ${isOverdue ? 'text-red-500' : 'text-copy-light'}`}>
            Time: {minutes}:{seconds}
        </div>
    );
};

const statusBorderColor: Partial<Record<OrderStatus, string>> = {
    'Pending': 'border-l-orange-500',
    'Received': 'border-l-blue-500',
    'Preparing': 'border-l-yellow-500',
    'On Route': 'border-l-green-500',
    'Out for Delivery': 'border-l-green-500',
};


const OrderTicket: React.FC<{ order: LiveOrder, onAcceptClick?: () => void }> = ({ order, onAcceptClick }) => {
    const isDineIn = order.orderType === 'dine-in' && order.tableNumber;
    const headerText = isDineIn ? `Table ${order.tableNumber}` : order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1);
    const borderColor = statusBorderColor[order.status] || 'border-l-gray-400';

    return (
        <div className={`bg-surface-raised p-3 rounded-lg shadow-md border border-border border-l-4 ${borderColor}`}>
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
            {(order.status === 'Preparing' || order.status === 'Received' || order.status === 'On Route') && order.acceptedAt && order.preparationTime && (
                 <div className="mt-2 pt-2 border-t border-border">
                    <Timer acceptedAt={order.acceptedAt} preparationTime={order.preparationTime} />
                </div>
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
  orders: LiveOrder[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onAcceptOrder: (orderId: string, prepTime: number) => void;
}

const KitchenView: React.FC<KitchenViewProps> = ({ orders, onUpdateOrderStatus, onAcceptOrder }) => {
    const [orderToAccept, setOrderToAccept] = useState<string | null>(null);

    const handleDropOnReady = (orderId: string) => {
        const orderToMove = orders.find(o => o.id === orderId);
        // Only allow moving from the preparing statuses.
        if (orderToMove && (orderToMove.status === 'Received' || orderToMove.status === 'Preparing')) {
            // "Intelligent" status update based on order type
            const newStatus: OrderStatus = orderToMove.orderType === 'delivery' ? 'Out for Delivery' : 'On Route';
            onUpdateOrderStatus(orderId, newStatus);
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

                <KitchenColumn title="Preparing" count={preparingOrders.length}>
                    {preparingOrders.map(order => (
                         <div key={order.id} draggable onDragStart={(e) => handleDragStart(e, order.id)} className="cursor-grab">
                            <OrderTicket order={order} />
                        </div>
                    ))}
                </KitchenColumn>
                
                <KitchenColumn title="Ready for Pickup" count={readyForPickupOrders.length} onDrop={handleDropOnReady}>
                     {readyForPickupOrders.map(order => (
                         <div key={order.id}>
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
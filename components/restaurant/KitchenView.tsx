import React from 'react';
import { Order, OrderStatus } from '../../types';

const OrderTicket: React.FC<{ order: Omit<Order, 'restaurant'> }> = ({ order }) => (
    <div className="bg-white p-3 rounded-md shadow-sm border">
        <div className="flex justify-between items-center border-b pb-2 mb-2">
            <h4 className="font-bold">Table {order.tableNumber}</h4>
            <span className="text-xs text-gray-500">{order.id}</span>
        </div>
        <div className="space-y-1">
            {order.items.map(item => (
                <p key={item.id} className="text-sm">
                    <span className="font-semibold">{item.quantity}x</span> {item.name}
                </p>
            ))}
        </div>
    </div>
)

const KitchenColumn: React.FC<{ title: string; orders: Omit<Order, 'restaurant'>[]; onDrop: (orderId: string, newStatus: OrderStatus) => void; status: OrderStatus }> = ({ title, orders, onDrop, status }) => {
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const orderId = e.dataTransfer.getData("orderId");
        onDrop(orderId, status);
    };

    const handleDragStart = (e: React.DragEvent, orderId: string) => {
        e.dataTransfer.setData("orderId", orderId);
    };
    
    return (
        <div 
            className="bg-gray-100 rounded-lg p-4 flex-1"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <h3 className="font-bold text-lg text-brand-charcoal mb-4 text-center">{title} ({orders.length})</h3>
            <div className="space-y-3 h-[60vh] overflow-y-auto">
                {orders.map(order => (
                     <div key={order.id} draggable onDragStart={(e) => handleDragStart(e, order.id)}>
                        <OrderTicket order={order} />
                    </div>
                ))}
            </div>
        </div>
    )
}

interface KitchenViewProps {
  orders: Omit<Order, 'restaurant'>[];
  onUpdateOrders: React.Dispatch<React.SetStateAction<Omit<Order, 'restaurant'>[]>>;
}

const KitchenView: React.FC<KitchenViewProps> = ({ orders, onUpdateOrders }) => {
    const handleDrop = (orderId: string, newStatus: OrderStatus) => {
        onUpdateOrders(prevOrders => {
            const orderToMove = prevOrders.find(o => o.id === orderId);
            if(orderToMove && orderToMove.status !== newStatus) {
                // In a real app, you'd also check the status flow is valid
                return prevOrders.map(o => o.id === orderId ? {...o, status: newStatus} : o);
            }
            return prevOrders;
        });
    };

    const received = orders.filter(o => o.status === 'Received');
    const preparing = orders.filter(o => o.status === 'Preparing');
    const ready = orders.filter(o => o.status === 'On Route');

    return (
        <div className="flex gap-6 h-full">
            <KitchenColumn title="New Orders" orders={received} onDrop={handleDrop} status="Received" />
            <KitchenColumn title="Preparing" orders={preparing} onDrop={handleDrop} status="Preparing" />
            <KitchenColumn title="Ready for Pickup" orders={ready} onDrop={handleDrop} status="On Route" />
        </div>
    )
};

export default KitchenView;
import React from 'react';
import { Order, OrderStatus } from '../../types';
import { TruckIcon } from '../Icons';

interface DeliveryManagementViewProps {
    liveOrders: Omit<Order, 'restaurant'>[];
    onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

const DeliveryManagementView: React.FC<DeliveryManagementViewProps> = ({ liveOrders, onUpdateOrderStatus }) => {

    const deliveryOrders = liveOrders.filter(o => o.orderType === 'delivery');
    
    const ordersReadyForDriver = deliveryOrders.filter(o => o.status === 'On Route');
    const ordersOutForDelivery = deliveryOrders.filter(o => o.status === 'Out for Delivery');
    const ordersDelivered = deliveryOrders.filter(o => o.status === 'Delivered');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Column 1: Ready for Driver */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-bold text-brand-charcoal mb-4 border-b pb-2">Ready for Driver ({ordersReadyForDriver.length})</h2>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                    {ordersReadyForDriver.map(order => (
                        <div key={order.id} className="bg-gray-50 p-3 rounded-lg border">
                            <p className="font-bold">Order {order.id.slice(-6)} for {order.orderName}</p>
                            <p className="text-sm text-gray-600 mt-1">{order.deliveryAddress}</p>
                            <button 
                                onClick={() => onUpdateOrderStatus(order.id, 'Out for Delivery')}
                                className="w-full mt-3 bg-blue-600 text-white font-semibold py-1.5 rounded-md text-sm flex items-center justify-center gap-2 hover:bg-blue-700"
                            >
                               <TruckIcon className="w-4 h-4" /> Start Delivery
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Column 2: Out for Delivery */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-bold text-brand-charcoal mb-4 border-b pb-2">Out for Delivery ({ordersOutForDelivery.length})</h2>
                 <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                    {ordersOutForDelivery.map(order => (
                        <div key={order.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-300">
                            <p className="font-bold">Order {order.id.slice(-6)} for {order.orderName}</p>
                            <p className="text-sm text-gray-600 mt-1">{order.deliveryAddress}</p>
                            <button 
                                onClick={() => onUpdateOrderStatus(order.id, 'Delivered')}
                                className="w-full mt-3 bg-brand-emerald text-white font-semibold py-1.5 rounded-md text-sm hover:bg-opacity-80"
                            >
                                Mark as Delivered
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Column 3: Delivered */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-bold text-brand-charcoal mb-4 border-b pb-2">Delivered ({ordersDelivered.length})</h2>
                 <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                    {ordersDelivered.map(order => (
                        <div key={order.id} className="bg-green-50 p-3 rounded-lg border border-green-200 opacity-70">
                            <p className="font-bold">Order {order.id.slice(-6)} for {order.orderName}</p>
                            <p className="text-sm text-gray-600 mt-1">{order.deliveryAddress}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeliveryManagementView;
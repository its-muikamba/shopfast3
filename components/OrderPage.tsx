import React, { useState, useEffect, useMemo } from 'react';
import { Order, LiveOrder } from '../types';
import OrderTrackerScreen from './OrderTrackerScreen';
import PaymentScreen from './PaymentScreen';
import { ReceiptIcon } from './Icons';

interface OrderPageProps {
  order: Order | null;
  liveOrders: LiveOrder[];
  setOrder: (order: Order | null) => void;
  onPaymentSuccess: () => void;
  resetApp: () => void;
}

const OrderPage: React.FC<OrderPageProps> = ({ order, liveOrders, setOrder, onPaymentSuccess, resetApp }) => {
    const [flowStep, setFlowStep] = useState<'tracking' | 'payment'>('tracking');

    const liveOrderData = useMemo(() => {
        if (!order) return null;
        const liveVersion = liveOrders.find(lo => lo.id === order.id);
        // The live order doesn't have the full restaurant object, so we need to merge
        if (liveVersion) {
            return {
                ...order, // keeps restaurant object
                ...liveVersion // overrides with live status, prep time, etc.
            };
        }
        return order;
    }, [order, liveOrders]);


    useEffect(() => {
        if (liveOrderData?.status === 'Served' || liveOrderData?.status === 'Delivered' || liveOrderData?.status === 'Paid' || liveOrderData?.status === 'Verified') {
            setFlowStep('payment');
        } else if (liveOrderData) {
            setFlowStep('tracking');
        }
    }, [liveOrderData]);

    const handleOrderServed = () => {
        setFlowStep('payment');
    };

    return (
        <div className="min-h-screen">
        {liveOrderData ? (
            flowStep === 'tracking' ? (
                <OrderTrackerScreen order={liveOrderData} setOrder={setOrder} onOrderServed={handleOrderServed} />
            ) : (
                <PaymentScreen order={liveOrderData} onPaymentSuccess={onPaymentSuccess} onFinish={resetApp} />
            )
        ) : (
            <div className="flex flex-col items-center justify-center h-screen text-center p-4 pb-28">
                <ReceiptIcon className="w-24 h-24 text-surface-light mb-4" />
                <h1 className="text-2xl font-bold text-copy">No Active Order</h1>
                <p className="text-copy-light mt-2 max-w-xs">
                    Your active order will appear here once you've placed it from a restaurant menu.
                </p>
            </div>
        )}
        </div>
    );
};

export default OrderPage;

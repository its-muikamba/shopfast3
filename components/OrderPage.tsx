import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import OrderTrackerScreen from './OrderTrackerScreen';
import PaymentScreen from './PaymentScreen';
import { ReceiptIcon } from './Icons';

interface OrderPageProps {
  order: Order | null;
  setOrder: (order: Order | null) => void;
  onPaymentSuccess: () => void;
  resetApp: () => void;
}

const OrderPage: React.FC<OrderPageProps> = ({ order, setOrder, onPaymentSuccess, resetApp }) => {
    const [flowStep, setFlowStep] = useState<'tracking' | 'payment'>('tracking');

    useEffect(() => {
        if (order?.status === 'Served' || order?.status === 'Paid' || order?.status === 'Verified') {
            setFlowStep('payment');
        } else if (order) {
            setFlowStep('tracking');
        }
    }, [order]);

    const handleOrderServed = () => {
        setFlowStep('payment');
    };

    return (
        <div className="min-h-screen">
        {order ? (
            flowStep === 'tracking' ? (
                <OrderTrackerScreen order={order} setOrder={setOrder} onOrderServed={handleOrderServed} />
            ) : (
                <PaymentScreen order={order} onPaymentSuccess={onPaymentSuccess} onFinish={resetApp} />
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
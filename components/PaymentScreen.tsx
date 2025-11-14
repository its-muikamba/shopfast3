import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { CheckCircleIcon, QrCodeIcon } from './Icons';

const PaymentScreen: React.FC<{ order: Order; onPaymentSuccess: () => void; onFinish: () => void; }> = ({ order, onPaymentSuccess, onFinish }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (order.status === 'Paid') {
            const timer = setTimeout(() => setIsVerified(true), 4000); // Simulate server scanning QR
            return () => clearTimeout(timer);
        }
    }, [order.status]);

    const handlePay = () => {
        setIsProcessing(true);
        setTimeout(() => {
            onPaymentSuccess();
            setIsProcessing(false);
        }, 2000); // Simulate payment processing
    };
    
    const { theme } = order.restaurant;

    if (isVerified) {
        return (
            <div 
                className="min-h-screen flex flex-col justify-center items-center text-white p-8 text-center transition-colors duration-500"
                style={{ backgroundColor: theme.primaryColor }}
            >
                <img src={order.restaurant.logoUrl} alt={`${order.restaurant.name} Logo`} className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg object-cover" />
                <h1 className="font-serif text-4xl font-bold mb-2">Payment Verified!</h1>
                <p className="text-lg opacity-90 mb-8">Thank you, {order.orderName}, for dining with {order.restaurant.name}.</p>
                <button 
                    onClick={onFinish}
                    className="bg-white font-bold py-3 px-8 rounded-full shadow-lg text-lg transform hover:scale-105 transition-transform"
                    style={{ color: theme.primaryColor }}
                >
                    Back to Home
                </button>
            </div>
        );
    }
    
    if (order.status === 'Paid') {
        return (
             <div className="min-h-screen bg-gray-50 p-6 flex flex-col justify-center items-center text-center">
                <img src={order.restaurant.logoUrl} alt={`${order.restaurant.name} Logo`} className="w-20 h-20 rounded-full mx-auto mb-4 shadow-md object-cover" />
                <h1 className="font-serif text-3xl font-bold text-brand-charcoal">Payment Successful!</h1>
                <p className="text-gray-500 mb-6">Show this QR code to your server for verification.</p>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    {/* Placeholder for a real QR code */}
                    <div className="w-56 h-56 bg-gray-200 flex items-center justify-center">
                        <QrCodeIcon className="w-32 h-32 text-gray-400" />
                    </div>
                </div>

                <div className="mt-6 text-center w-full max-w-sm">
                     <p className="text-sm text-gray-500">Order for {order.orderName}</p>
                     {order.tableNumber && <p className="text-sm text-gray-500">Table: {order.tableNumber}</p>}
                    <p className="text-3xl font-bold text-brand-charcoal mt-2">${order.total.toFixed(2)}</p>
                    <div className="mt-4 text-gray-500 animate-pulse">
                        Waiting for server verification...
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="text-center mb-8">
                 <img src={order.restaurant.logoUrl} alt={`${order.restaurant.name} Logo`} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover shadow" />
                <h1 className="font-serif text-4xl font-bold text-brand-charcoal">Checkout</h1>
                <p className="text-gray-500">Order for <span className="font-semibold">{order.orderName}</span></p>
                 {order.tableNumber && <p className="text-sm text-gray-500">at Table {order.tableNumber}</p>}
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <h2 className="font-bold text-lg mb-3">Order Summary</h2>
                <div className="space-y-2">
                    {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.name} x{item.quantity}</span>
                            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                 <div className="border-t my-3"></div>
                 <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                </div>
            </div>

            <div className="space-y-4">
                 <button 
                    onClick={handlePay}
                    disabled={isProcessing}
                    style={isProcessing ? undefined : { backgroundColor: theme.primaryColor }}
                    className="w-full text-white font-bold py-4 rounded-full shadow-lg flex items-center justify-center gap-2 transition hover:bg-opacity-90 disabled:bg-gray-400"
                >
                    {isProcessing ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Processing...</span>
                        </>
                    ) : (
                        <span>Pay with Card / Mpesa</span>
                    )}
                </button>
            </div>
             <p className="text-xs text-center text-gray-400 mt-4">Powered by ShopFast Secure Payments</p>
        </div>
    );
};

export default PaymentScreen;

import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { CheckCircleIcon, QrCodeIcon, XIcon, StripeIcon, MpesaIcon, CreditCardIcon } from './Icons';

type PaymentMethod = 'stripe' | 'mpesa' | 'pesapal';

const PaymentModal: React.FC<{
    method: PaymentMethod,
    onClose: () => void,
    onConfirm: () => void,
    isProcessing: boolean
}> = ({ method, onClose, onConfirm, isProcessing }) => {

    const renderContent = () => {
        switch(method) {
            case 'stripe':
                return (
                    <form onSubmit={(e) => { e.preventDefault(); onConfirm(); }}>
                        <h3 className="text-lg font-semibold mb-2">Pay with Card</h3>
                        <p className="text-sm text-gray-500 mb-4">Powered by Stripe</p>
                        <div className="space-y-3">
                            <input type="text" placeholder="Card Number" className="w-full px-3 py-2 rounded-md border border-gray-300" required />
                            <div className="flex gap-3">
                                <input type="text" placeholder="MM / YY" className="w-1/2 px-3 py-2 rounded-md border border-gray-300" required />
                                <input type="text" placeholder="CVC" className="w-1/2 px-3 py-2 rounded-md border border-gray-300" required />
                            </div>
                        </div>
                        <button type="submit" disabled={isProcessing} className="w-full mt-6 bg-brand-charcoal text-white font-bold py-3 rounded-lg disabled:bg-gray-400">
                             {isProcessing ? 'Processing...' : 'Pay Now'}
                        </button>
                    </form>
                );
            case 'mpesa':
                return (
                    <form onSubmit={(e) => { e.preventDefault(); onConfirm(); }}>
                        <h3 className="text-lg font-semibold mb-2">Pay with M-Pesa</h3>
                        <p className="text-sm text-gray-500 mb-4">You will receive an STK push on your phone.</p>
                        <input type="tel" placeholder="e.g. 0712345678" className="w-full px-3 py-2 rounded-md border border-gray-300" required />
                        <button type="submit" disabled={isProcessing} className="w-full mt-6 bg-brand-emerald text-white font-bold py-3 rounded-lg disabled:bg-gray-400">
                            {isProcessing ? 'Processing...' : 'Confirm Payment'}
                        </button>
                    </form>
                );
            default: return null;
        }
    }

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
                 <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-black">
                    <XIcon className="w-5 h-5" />
                </button>
                {renderContent()}
            </div>
        </div>
    )
}


const PaymentScreen: React.FC<{ order: Order; onPaymentSuccess: () => void; onFinish: () => void; }> = ({ order, onPaymentSuccess, onFinish }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [activePaymentModal, setActivePaymentModal] = useState<PaymentMethod | null>(null);

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
            setActivePaymentModal(null);
        }, 2000); // Simulate payment processing
    };
    
    const { theme, paymentSettings } = order.restaurant;

    if (isVerified) {
        return (
            <div 
                className="min-h-screen flex flex-col justify-center items-center text-white p-8 text-center transition-colors duration-500"
                style={{ backgroundColor: theme.primaryColor }}
            >
                <img src={order.restaurant.logoUrl} alt={`${order.restaurant.name} Logo`} className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg object-cover" />
                <h1 className="font-serif text-4xl font-bold mb-2">Payment Verified!</h1>
                <p className="text-lg opacity-90 mb-2">Thank you, {order.orderName}, for dining with {order.restaurant.name}.</p>
                {order.tableNumber && <p className="text-lg opacity-90 mb-8">Your order for Table {order.tableNumber} is complete.</p>}
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

            <div>
                <h3 className="font-bold text-lg mb-3">Payment Method</h3>
                <div className="space-y-3">
                    {paymentSettings.stripe.enabled && (
                        <button onClick={() => setActivePaymentModal('stripe')} className="w-full text-brand-charcoal font-bold py-3 px-4 rounded-lg shadow-sm flex items-center justify-center gap-3 transition hover:bg-gray-100 border border-gray-200">
                           <StripeIcon className="w-10 h-6" /> <span>Pay with Card</span>
                        </button>
                    )}
                     {paymentSettings.mpesa.enabled && (
                        <button onClick={() => setActivePaymentModal('mpesa')} className="w-full text-brand-charcoal font-bold py-3 px-4 rounded-lg shadow-sm flex items-center justify-center gap-3 transition hover:bg-gray-100 border border-gray-200">
                            <MpesaIcon className="h-6" /> <span>Pay with M-Pesa</span>
                        </button>
                    )}
                     {paymentSettings.pesapal.enabled && (
                        <button onClick={() => setActivePaymentModal('pesapal')} className="w-full text-brand-charcoal font-bold py-3 px-4 rounded-lg shadow-sm flex items-center justify-center gap-3 transition hover:bg-gray-100 border border-gray-200">
                           <CreditCardIcon className="w-6 h-6" /> <span>Pay with Pesapal</span>
                        </button>
                    )}
                </div>
            </div>

             <p className="text-xs text-center text-gray-400 mt-6">Powered by ShopFast Secure Payments</p>

            {activePaymentModal && (
                <PaymentModal 
                    method={activePaymentModal}
                    onClose={() => setActivePaymentModal(null)}
                    onConfirm={handlePay}
                    isProcessing={isProcessing}
                />
            )}
        </div>
    );
};

export default PaymentScreen;
import React, { useState, useEffect, useRef } from 'react';
import { Order, PaymentMethod } from '../types';
import { CheckCircleIcon, QrCodeIcon, XIcon, StripeIcon, MpesaIcon, CreditCardIcon } from './Icons';

// FIX: Declare the global QRCode variable to inform TypeScript of its existence.
// This is necessary because the library is loaded via a script tag in index.html.
declare var QRCode: any;


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
                        <h3 className="text-lg font-semibold mb-2 text-copy">Pay with Card</h3>
                        <p className="text-sm text-copy-light mb-4">Powered by Stripe</p>
                        <div className="space-y-3">
                            <input type="text" placeholder="Card Number" className="w-full shadcn-input" required />
                            <div className="flex gap-3">
                                <input type="text" placeholder="MM / YY" className="w-1/2 shadcn-input" required />
                                <input type="text" placeholder="CVC" className="w-1/2 shadcn-input" required />
                            </div>
                        </div>
                        <button type="submit" disabled={isProcessing} className="w-full mt-6 bg-primary text-brand-charcoal font-bold py-3 rounded-lg disabled:bg-surface-light">
                             {isProcessing ? 'Processing...' : 'Pay Now'}
                        </button>
                    </form>
                );
            case 'mpesa':
                return (
                    <form onSubmit={(e) => { e.preventDefault(); onConfirm(); }}>
                        <h3 className="text-lg font-semibold mb-2 text-copy">Pay with M-Pesa</h3>
                        <p className="text-sm text-copy-light mb-4">You will receive an STK push on your phone.</p>
                        <input type="tel" placeholder="e.g. 0712345678" className="w-full shadcn-input" required />
                        <button type="submit" disabled={isProcessing} className="w-full mt-6 bg-brand-emerald text-white font-bold py-3 rounded-lg disabled:bg-gray-400">
                            {isProcessing ? 'Processing...' : 'Confirm Payment'}
                        </button>
                    </form>
                );
             case 'pesapal':
                return (
                    <form onSubmit={(e) => { e.preventDefault(); onConfirm(); }}>
                        <h3 className="text-lg font-semibold mb-2 text-copy">Pay with Pesapal</h3>
                        <p className="text-sm text-copy-light mb-4">You will be redirected to complete the payment.</p>
                        <input type="email" placeholder="e.g. your@email.com" className="w-full shadcn-input" required />
                         <button type="submit" disabled={isProcessing} className="w-full mt-6 bg-brand-sky text-white font-bold py-3 rounded-lg disabled:bg-gray-400">
                            {isProcessing ? 'Processing...' : 'Continue to Pesapal'}
                        </button>
                    </form>
                );
            default: return null;
        }
    }

    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-lg shadow-xl w-full max-w-sm p-6 relative bg-white">
                 <button onClick={onClose} className="absolute top-3 right-3 text-copy-light hover:text-copy">
                    <XIcon className="w-5 h-5" />
                </button>
                {renderContent()}
            </div>
        </div>
    )
}

const ReceiptView: React.FC<{ order: Order; onFinish: () => void }> = ({ order, onFinish }) => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-6 text-center bg-gradient-to-br from-secondary to-primary">
            <div className="w-full max-w-md bg-white text-brand-charcoal rounded-2xl shadow-2xl p-8">
                <CheckCircleIcon className="w-16 h-16 text-secondary mx-auto mb-4" />
                <h1 className="font-sans text-3xl font-bold mb-2">Payment Successful!</h1>
                <p className="text-gray-600 mb-6">Thank you for your order, {order.orderName}.</p>

                <div className="text-left border-t border-b border-gray-200 py-4 my-4 space-y-2">
                    <h2 className="font-bold text-lg mb-2">Order Summary</h2>
                    {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.name} x{item.quantity}</span>
                            <span className="font-medium">{order.restaurant.currency.symbol}{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                
                <div className="text-left space-y-1 my-4">
                     <div className="flex justify-between font-bold text-xl">
                        <span>Total Paid</span>
                        <span>{order.restaurant.currency.symbol}{order.total.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="font-semibold capitalize">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Order ID</span>
                        <span className="font-mono text-xs">{order.id}</span>
                    </div>
                </div>

                 <button 
                    onClick={onFinish}
                    className="w-full bg-brand-charcoal text-white font-bold py-3 px-8 rounded-lg text-lg transform hover:scale-105 transition-transform mt-6"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}


const PaymentScreen: React.FC<{ order: Order; onPaymentSuccess: (method: PaymentMethod) => void; onFinish: () => void; }> = ({ order, onPaymentSuccess, onFinish }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [activePaymentModal, setActivePaymentModal] = useState<PaymentMethod | null>(null);
    
    const handlePay = () => {
        if (!activePaymentModal) return;
        setIsProcessing(true);
        setTimeout(() => {
            onPaymentSuccess(activePaymentModal);
            setIsProcessing(false);
            setActivePaymentModal(null);
        }, 2000); // Simulate payment processing
    };
    
    const { theme, paymentSettings, currency } = order.restaurant;
    
    if (order.paymentStatus === 'paid') {
        return <ReceiptView order={order} onFinish={onFinish} />
    }

    return (
        <div className="min-h-screen p-6">
            <div className="text-center mb-8">
                 <img src={order.restaurant.logoUrl} alt={`${order.restaurant.name} Logo`} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover shadow" />
                <h1 className="font-sans text-4xl font-bold text-copy">Checkout</h1>
                <p className="text-copy-light">Order for <span className="font-semibold">{order.orderName}</span></p>
                 {order.tableNumber && <p className="text-sm text-copy-lighter">at Table {order.tableNumber}</p>}
            </div>
            
            <div className="glass-card rounded-2xl p-4 mb-6">
                <h2 className="font-bold text-lg mb-3">Order Summary</h2>
                <div className="space-y-2">
                    {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-copy-light">{item.name} x{item.quantity}</span>
                            <span className="font-medium">{currency.symbol}{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                 <div className="border-t border-primary/20 my-3"></div>
                 <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>{currency.symbol}{order.total.toFixed(2)}</span>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-lg mb-3">Payment Method</h3>
                <div className="space-y-3">
                    {paymentSettings.stripe.enabled && (
                        <button onClick={() => setActivePaymentModal('stripe')} className="w-full text-copy-rich font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition hover:bg-surface-light bg-surface shadow-sm border border-border">
                           <CreditCardIcon className="w-6 h-6" /> <span>Pay with Card</span>
                        </button>
                    )}
                     {paymentSettings.mpesa.enabled && (
                        <button onClick={() => setActivePaymentModal('mpesa')} className="w-full text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition hover:bg-opacity-90 bg-brand-emerald shadow-sm border border-brand-emerald">
                            <span className="font-bold text-xl">M-PESA</span>
                        </button>
                    )}
                     {paymentSettings.pesapal.enabled && (
                        <button onClick={() => setActivePaymentModal('pesapal')} className="w-full text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition hover:bg-opacity-90 bg-brand-sky shadow-sm border border-brand-sky">
                           <span>Pay with Pesapal</span>
                        </button>
                    )}
                </div>
            </div>

             <p className="text-xs text-center text-copy-lighter mt-6">Powered by ShopFast Secure Payments</p>

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
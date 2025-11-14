import React, { useState } from 'react';
import { Restaurant, OrderContext, OrderType } from '../types';
import { XIcon, QrCodeIcon } from './Icons';
import QrCodeScanner from './QrCodeScanner';

type Step = 'type' | 'table' | 'name' | 'address';

interface OrderContextModalProps {
    restaurant: Restaurant;
    onClose: () => void;
    onSubmit: (context: OrderContext) => void;
}

const OrderContextModal: React.FC<OrderContextModalProps> = ({ restaurant, onClose, onSubmit }) => {
    const [step, setStep] = useState<Step>('type');
    const [orderType, setOrderType] = useState<OrderType | null>(null);
    const [tableNumber, setTableNumber] = useState('');
    const [orderName, setOrderName] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const handleTypeSelect = (type: OrderType) => {
        setOrderType(type);
        if (type === 'dine-in') {
            setStep('table');
        } else {
            setStep('name');
        }
    };

    const handleTableSubmit = () => {
        if (tableNumber) {
            setStep('name');
        }
    };
    
    const handleScanSuccess = (data: string) => {
        setIsScannerOpen(false);
        try {
            const parsed = JSON.parse(data);
            if (parsed.tableNumber) {
                setTableNumber(parsed.tableNumber);
                setStep('name');
            } else {
                 alert('Invalid table QR code.');
            }
        } catch(e) {
            // Fallback for simple string table number
            if (!isNaN(parseInt(data))) {
                setTableNumber(data);
                setStep('name');
            } else {
                alert('Invalid table QR code.');
            }
        }
    };

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (orderName && orderType) {
            onSubmit({
                orderType,
                orderName,
                tableNumber: orderType === 'dine-in' ? parseInt(tableNumber, 10) : undefined,
            });
        }
    };
    
    const renderStep = () => {
        switch (step) {
            case 'table':
                return (
                    <div>
                        <h3 className="font-serif text-2xl font-bold mb-4">Dine-in Options</h3>
                        <p className="text-gray-600 mb-6">How would you like to identify your table?</p>
                        <div className="space-y-4">
                            <button onClick={() => setIsScannerOpen(true)} className="w-full flex items-center justify-center gap-2 bg-brand-charcoal text-white font-bold py-3 px-4 rounded-lg">
                                <QrCodeIcon className="w-5 h-5" /> Scan Table QR
                            </button>
                            <div className="flex items-center gap-2">
                                <hr className="flex-grow" /> <span className="text-xs text-gray-400">OR</span> <hr className="flex-grow" />
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); handleTableSubmit(); }} className="flex gap-2">
                                <input 
                                    type="number" 
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(e.target.value)}
                                    placeholder="Enter Table Number" 
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                    required
                                />
                                <button type="submit" className="bg-brand-gold text-white font-bold py-3 px-4 rounded-lg">Go</button>
                            </form>
                        </div>
                    </div>
                );
            case 'name':
                return (
                    <form onSubmit={handleNameSubmit}>
                        <h3 className="font-serif text-2xl font-bold mb-4">
                            {orderType === 'dine-in' && `Great, you're at Table ${tableNumber}.`}
                            {orderType === 'takeaway' && `Ready for Takeaway!`}
                            {orderType === 'delivery' && `Let's arrange your Delivery!`}
                        </h3>
                         <p className="text-gray-600 mb-6">What name should we put on the order?</p>
                         <input 
                            type="text" 
                            value={orderName}
                            onChange={(e) => setOrderName(e.target.value)}
                            placeholder="e.g., Gilbert" 
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            required
                        />
                         <button type="submit" className="w-full mt-4 bg-brand-charcoal text-white font-bold py-3 px-4 rounded-lg">
                            Start Ordering
                        </button>
                    </form>
                );
            case 'type':
            default:
                return (
                    <div>
                        <h3 className="font-serif text-2xl font-bold mb-4">How are you dining?</h3>
                        <div className="space-y-3">
                            <button onClick={() => handleTypeSelect('dine-in')} className="w-full text-left p-4 border rounded-lg hover:border-brand-gold hover:bg-yellow-50 transition">
                                <h4 className="font-bold">Dine-in</h4>
                                <p className="text-sm text-gray-500">Order from your table.</p>
                            </button>
                            <button onClick={() => handleTypeSelect('takeaway')} className="w-full text-left p-4 border rounded-lg hover:border-brand-gold hover:bg-yellow-50 transition">
                                <h4 className="font-bold">Takeaway</h4>
                                <p className="text-sm text-gray-500">Pick up your order from the restaurant.</p>
                            </button>
                            <button 
                                onClick={() => restaurant.subscription !== 'basic' && handleTypeSelect('delivery')} 
                                className={`w-full text-left p-4 border rounded-lg transition ${restaurant.subscription === 'basic' ? 'opacity-50 cursor-not-allowed' : 'hover:border-brand-gold hover:bg-yellow-50'}`}
                                disabled={restaurant.subscription === 'basic'}
                            >
                                <h4 className="font-bold">Delivery</h4>
                                <p className="text-sm text-gray-500">
                                    {restaurant.subscription === 'basic' ? 'Not available for this restaurant' : 'Get your order delivered to you.'}
                                </p>
                            </button>
                        </div>
                    </div>
                );
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative p-8">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="text-center mb-6">
                    <img src={restaurant.logoUrl} alt={restaurant.name} className="w-16 h-16 rounded-full mx-auto shadow-md" />
                    <h2 className="text-xl font-bold mt-2">{restaurant.name}</h2>
                </div>
                {renderStep()}
            </div>
            {isScannerOpen && (
                <QrCodeScanner
                    onScanSuccess={handleScanSuccess}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}
        </div>
    );
};

export default OrderContextModal;

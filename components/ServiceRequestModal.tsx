import React, { useState } from 'react';
import { ServiceRequest } from '../types';
import { XIcon, CheckCircleIcon, HandIcon, ReceiptIcon, BellIcon } from './Icons';

interface ServiceRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceRequests: ServiceRequest[];
    onSelectRequest: (request: string) => void;
    primaryColor: string;
}

const iconMap: { [key in ServiceRequest['icon']]: React.ElementType } = {
    HandIcon: HandIcon,
    ReceiptIcon: ReceiptIcon,
    BellIcon: BellIcon,
};

const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({ isOpen, onClose, serviceRequests, onSelectRequest, primaryColor }) => {
    const [isConfirmed, setIsConfirmed] = useState(false);

    const handleSelect = (requestLabel: string) => {
        onSelectRequest(requestLabel);
        setIsConfirmed(true);
        setTimeout(() => {
            onClose();
            // Reset for next time the modal is opened
            setTimeout(() => setIsConfirmed(false), 300); 
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative transition-all duration-300">
                {!isConfirmed ? (
                    <>
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                            <XIcon className="w-6 h-6" />
                        </button>
                        <h3 className="font-serif text-2xl font-bold mb-4 text-center">How can we help?</h3>
                        <div className="space-y-3">
                            {serviceRequests.map(request => {
                                const IconComponent = iconMap[request.icon];
                                return (
                                    <button
                                        key={request.id}
                                        onClick={() => handleSelect(request.label)}
                                        className="w-full text-left p-4 border rounded-lg hover:border-brand-gold hover:bg-yellow-50 transition flex items-center gap-4"
                                    >
                                        <IconComponent className="w-6 h-6" style={{ color: primaryColor }} />
                                        <span className="font-semibold text-brand-charcoal">{request.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="text-center p-8">
                        <CheckCircleIcon className="w-16 h-16 text-brand-emerald mx-auto mb-4 animate-pulse" />
                        <h3 className="font-serif text-2xl font-bold">Request Sent!</h3>
                        <p className="text-gray-600 mt-2">Help is on the way.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceRequestModal;

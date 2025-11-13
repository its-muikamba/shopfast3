import React from 'react';
import { CreditCardIcon } from '../Icons';

const HQBilling: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md h-full flex flex-col items-center justify-center text-center">
        <CreditCardIcon className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-brand-charcoal">Subscription & Billing</h2>
        <p className="mt-2 text-gray-500 max-w-md">
            Here, you'll manage subscription tiers, process payments for restaurant tenants, handle invoicing, and monitor the overall financial health of the platform.
        </p>
    </div>
  );
};

export default HQBilling;

import React from 'react';
import { LogoIcon } from '../Icons';

interface HQLoginScreenProps {
  onLogin: () => void;
}

const HQLoginScreen: React.FC<HQLoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-xl rounded-2xl">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <LogoIcon className="h-10 w-10 text-brand-gold" />
            <h1 className="font-serif text-3xl font-bold text-brand-charcoal">ShopFast HQ</h1>
          </div>
          <p className="text-gray-500">SuperAdmin SaaS Management Panel</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" autoComplete="email" required 
                     className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm" 
                     placeholder="Email address" defaultValue="admin@shopfast.co" />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required 
                     className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm" 
                     placeholder="Password" defaultValue="password" />
            </div>
          </div>

          <div>
            <button type="submit" 
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-charcoal hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold transition-colors">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HQLoginScreen;

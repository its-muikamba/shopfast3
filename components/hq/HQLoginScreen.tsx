import React from 'react';
import { LogoIcon } from '../Icons';

interface HQLoginScreenProps {
  onLogin: () => void;
}

const HQLoginScreen: React.FC<HQLoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 glass-card rounded-2xl">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <LogoIcon className="h-10 w-10 text-primary" />
            <h1 className="font-sans text-3xl font-bold text-copy">ShopFast HQ</h1>
          </div>
          <p className="text-copy-light">SuperAdmin SaaS Management Panel</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" autoComplete="email" required 
                     className="w-full shadcn-input" 
                     placeholder="Email address" defaultValue="admin@shopfast.co" />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required 
                     className="w-full shadcn-input" 
                     placeholder="Password" defaultValue="password" />
            </div>
          </div>

          <div>
            <button type="submit" 
                    className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md text-brand-charcoal bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-glow-primary">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HQLoginScreen;
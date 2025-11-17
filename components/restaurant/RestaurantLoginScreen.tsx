import React, { useState, useMemo } from 'react';
import { Restaurant } from '../../types';
import { LogoIcon, UserIcon, LockIcon } from '../Icons';

interface RestaurantLoginScreenProps {
  restaurants: Restaurant[];
  onLogin: (restaurantId: string, name: string, pin: string) => void;
}

const RestaurantLoginScreen: React.FC<RestaurantLoginScreenProps> = ({ restaurants, onLogin }) => {
    const activeRestaurants = useMemo(() => restaurants.filter(r => r.status === 'active'), [restaurants]);

    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(activeRestaurants[0]?.id || '');
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');

    const selectedRestaurant = useMemo(() => {
        return restaurants.find(r => r.id === selectedRestaurantId);
    }, [selectedRestaurantId, restaurants]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(selectedRestaurantId && name && pin) {
            onLogin(selectedRestaurantId, name, pin);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 space-y-8 glass-card rounded-2xl">
                <div className="text-center">
                    {selectedRestaurant ? (
                        <img src={selectedRestaurant.logoUrl} alt={`${selectedRestaurant.name} Logo`} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
                    ) : (
                        <div className="flex justify-center mb-4">
                            <LogoIcon className="h-20 w-20 text-surface-light" />
                        </div>
                    )}
                    <h1 className="font-sans text-3xl font-bold text-copy">Restaurant Portal</h1>
                    <p className="text-copy-light">Staff & Admin Login</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="restaurant" className="block text-sm font-medium text-copy-light mb-1">Select Restaurant</label>
                            <select 
                                id="restaurant" 
                                value={selectedRestaurantId} 
                                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                                className="w-full shadcn-input"
                            >
                                {activeRestaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div>
                           <label htmlFor="name" className="block text-sm font-medium text-copy-light mb-1">Your Name</label>
                           <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-copy-lighter" />
                                </div>
                                <input 
                                    type="text" 
                                    name="name" 
                                    id="name" 
                                    className="w-full shadcn-input pl-10" 
                                    placeholder="Gilbert Kareri"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                           </div>
                        </div>
                         <div>
                           <label htmlFor="pin" className="block text-sm font-medium text-copy-light mb-1">PIN Code</label>
                           <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockIcon className="h-5 w-5 text-copy-lighter" />
                                </div>
                                <input 
                                    type="password" 
                                    name="pin" 
                                    id="pin" 
                                    className="w-full shadcn-input pl-10" 
                                    placeholder="••••"
                                    value={pin}
                                    onChange={e => setPin(e.target.value)}
                                    maxLength={4}
                                    required
                                />
                           </div>
                        </div>
                    </div>

                    <div>
                        <button type="submit" 
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-brand-charcoal bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-glow-primary">
                        Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RestaurantLoginScreen;
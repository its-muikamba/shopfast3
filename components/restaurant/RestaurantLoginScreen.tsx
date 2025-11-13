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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-xl rounded-2xl">
                <div className="text-center">
                    {selectedRestaurant ? (
                        <img src={selectedRestaurant.logoUrl} alt={`${selectedRestaurant.name} Logo`} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
                    ) : (
                        <div className="flex justify-center mb-4">
                            <LogoIcon className="h-20 w-20 text-gray-300" />
                        </div>
                    )}
                    <h1 className="font-serif text-3xl font-bold text-brand-charcoal">Restaurant Portal</h1>
                    <p className="text-gray-500">Staff & Admin Login</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700">Select Restaurant</label>
                            <select 
                                id="restaurant" 
                                value={selectedRestaurantId} 
                                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-brand-gold focus:border-brand-gold sm:text-sm rounded-md"
                            >
                                {activeRestaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div>
                           <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name</label>
                           <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    name="name" 
                                    id="name" 
                                    className="focus:ring-brand-gold focus:border-brand-gold block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3" 
                                    placeholder="Gilbert Kareri"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                           </div>
                        </div>
                         <div>
                           <label htmlFor="pin" className="block text-sm font-medium text-gray-700">PIN Code</label>
                           <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="password" 
                                    name="pin" 
                                    id="pin" 
                                    className="focus:ring-brand-gold focus:border-brand-gold block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3" 
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
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-charcoal hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold transition-colors">
                        Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RestaurantLoginScreen;
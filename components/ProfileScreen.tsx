import React, { useState, useMemo } from 'react';
import { User, LiveOrder, Restaurant, Review } from '../types';
import { LogOutIcon, UserCircleIcon } from './Icons';
import UsageStats from './UsageStats';
import OrderHistoryCard from './OrderHistoryCard';
import { signIn, signUp, supabase } from '../services/supabase';

const LoginScreen: React.FC<{ onLogin: (user: User) => void, onSwitchToSignUp: () => void }> = ({ onLogin, onSwitchToSignUp }) => {
    const [email, setEmail] = useState('gilbert@example.com');
    const [password, setPassword] = useState('password');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (supabase) {
            setLoading(true);
            const { data, error } = await signIn(email, password);
            setLoading(false);
            
            if (error) {
                setError(error.message);
                return;
            }
            // Successful login is handled by App.tsx onAuthStateChange listener
        } else {
            // Mock login for fallback
            onLogin({ id: 'u1', name: 'Gilbert', email, orderHistory: [] });
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-8 glass-card rounded-2xl">
            <div className="text-center">
                <UserCircleIcon className="w-16 h-16 mx-auto text-copy-lighter" />
                <h1 className="font-sans text-3xl font-bold text-copy mt-4">Login</h1>
                <p className="text-copy-light">Access your profile and order history.</p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                 {error && <div className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">{error}</div>}
                <input 
                    type="email" 
                    placeholder="Email" 
                    className="w-full shadcn-input" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full shadcn-input" 
                    required 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button type="submit" disabled={loading} className="w-full bg-primary text-brand-charcoal font-bold py-3 rounded-lg shadow-glow-primary disabled:bg-gray-400">
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <p className="text-center text-sm">
                    <button type="button" onClick={onSwitchToSignUp} className="font-medium text-primary hover:underline">
                        Don't have an account? Sign up
                    </button>
                </p>
            </form>
        </div>
    );
};

const SignUpScreen: React.FC<{ onSignUp: (user: User) => void, onSwitchToLogin: () => void }> = ({ onSignUp, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (supabase) {
            setLoading(true);
            const { data, error } = await signUp(email, password, name);
            setLoading(false);
            
            if (error) {
                setError(error.message);
                return;
            }
            // Successful signup will automatically log in most cases or require confirmation
            if (data.user && !data.session) {
                setError('Account created! Please check your email to confirm.');
            }
        } else {
            // Mock signup for fallback
            onSignUp({ id: 'u1', name, email, orderHistory: [] });
        }
    };

    return (
         <div className="w-full max-w-md p-8 space-y-8 glass-card rounded-2xl">
            <div className="text-center">
                <UserCircleIcon className="w-16 h-16 mx-auto text-copy-lighter" />
                <h1 className="font-sans text-3xl font-bold text-copy mt-4">Create Account</h1>
                 <p className="text-copy-light">Join to get a personalized experience.</p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
                {error && <div className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">{error}</div>}
                <input 
                    type="text" 
                    placeholder="Full Name" 
                    className="w-full shadcn-input" 
                    required 
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <input 
                    type="email" 
                    placeholder="Email" 
                    className="w-full shadcn-input" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full shadcn-input" 
                    required 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button type="submit" disabled={loading} className="w-full bg-primary text-brand-charcoal font-bold py-3 rounded-lg shadow-glow-primary disabled:bg-gray-400">
                    {loading ? 'Signing up...' : 'Sign Up'}
                </button>
                 <p className="text-center text-sm">
                    <button type="button" onClick={onSwitchToLogin} className="font-medium text-primary hover:underline">
                        Already have an account? Login
                    </button>
                </p>
            </form>
        </div>
    );
}

interface ProfileScreenProps {
  user: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  orders: LiveOrder[];
  restaurants: Restaurant[];
  onAddReview: (restaurantId: string, orderId: string, reviewData: Omit<Review, 'id' | 'userId' | 'userName'>) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogin, onLogout, orders, restaurants, onAddReview }) => {
    const [showLogin, setShowLogin] = useState(true);

    const { userOrders, totalSpent, favoriteRestaurant, currencySymbol } = useMemo(() => {
        if (!user) {
            return { userOrders: [], totalSpent: 0, favoriteRestaurant: 'N/A', currencySymbol: null };
        }

        const userOrders = orders.filter(o => o.userId === user.id);
        const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);

        if (userOrders.length === 0) {
            return { userOrders, totalSpent, favoriteRestaurant: 'N/A', currencySymbol: null };
        }

        const restaurantCounts = userOrders.reduce((acc, order) => {
            acc[order.restaurantId] = (acc[order.restaurantId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const favoriteId = Object.keys(restaurantCounts).reduce((a, b) => restaurantCounts[a] > restaurantCounts[b] ? a : b);
        const favoriteRestaurant = restaurants.find(r => r.id === favoriteId)?.name || 'N/A';
        
        let symbol: string | null = null;
        const firstRestaurant = restaurants.find(r => r.id === userOrders[0].restaurantId);
        if (firstRestaurant) {
            const firstCurrencyCode = firstRestaurant.currency.code;
            const allSameCurrency = userOrders.every(order => {
                const restaurant = restaurants.find(r => r.id === order.restaurantId);
                return restaurant?.currency.code === firstCurrencyCode;
            });
            if (allSameCurrency) {
                symbol = firstRestaurant.currency.symbol;
            }
        }
        
        return { userOrders, totalSpent, favoriteRestaurant, currencySymbol: symbol };

    }, [user, orders, restaurants]);


    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 pb-28">
                {showLogin ? (
                    <LoginScreen onLogin={onLogin} onSwitchToSignUp={() => setShowLogin(false)} />
                ) : (
                    <SignUpScreen onSignUp={onLogin} onSwitchToLogin={() => setShowLogin(true)} />
                )}
            </div>
        );
    }

    return (
         <div className="min-h-screen pt-16 pb-28 px-6">
            <div className="text-center mb-8">
                <UserCircleIcon className="w-24 h-24 mx-auto text-copy-lighter mb-4" />
                <h1 className="text-3xl font-bold text-copy">{user.name}</h1>
                <p className="text-copy-light">{user.email}</p>
            </div>

            <UsageStats 
                totalSpent={totalSpent}
                orderCount={userOrders.length}
                favoriteRestaurant={favoriteRestaurant}
                currencySymbol={currencySymbol}
            />

            <div className="mt-8">
                <h2 className="text-xl font-bold text-copy mb-4">Order History</h2>
                {userOrders.length > 0 ? (
                    <div className="space-y-4">
                        {userOrders.map(order => {
                            const restaurant = restaurants.find(r => r.id === order.restaurantId);
                            if (!restaurant) return null;
                            return <OrderHistoryCard key={order.id} order={order} restaurant={restaurant} onAddReview={onAddReview} />;
                        })}
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl p-6 text-center text-copy-light">
                        <p>Your past orders will appear here.</p>
                    </div>
                )}
            </div>

            <div className="mt-8">
                <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-surface text-brand-red font-bold py-3 px-4 rounded-lg border border-surface-light hover:bg-red-900/20 transition">
                    <LogOutIcon className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfileScreen;



import React, { useState, useEffect, useMemo } from 'react';
import { GeneralAiRecommendation, Restaurant } from '../types';
import { getGeneralRecommendations } from '../services/geminiService';
import { SparklesIcon, MapPinIcon, TrendingUpIcon, StarIcon } from './Icons';

// Images for the background carousel
const carouselImages = [
    'https://images.unsplash.com/photo-1505253716362-afb74bf60b44?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Fries bowl
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Healthy quinoa bowl
    'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Sandwich
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1971&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Indian food
];

const SuggestionButton: React.FC<{ icon: React.ElementType, label: string, onClick: () => void, disabled?: boolean }> = ({ icon: Icon, label, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex-1 flex flex-col items-center justify-center gap-2 p-4 bg-surface/80 backdrop-blur-sm border border-white/20 rounded-2xl text-copy shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <Icon className="w-8 h-8 text-primary" />
        <span className="font-semibold text-sm">{label}</span>
    </button>
);

const RestaurantCarouselCard: React.FC<{ restaurant: Restaurant; onSelect: () => void; }> = ({ restaurant, onSelect }) => (
  <div onClick={onSelect} className="flex-shrink-0 w-64 h-80 rounded-2xl overflow-hidden relative group cursor-pointer">
    <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
    <div className="absolute bottom-0 left-0 p-4 text-white">
      <h4 className="font-bold text-lg">{restaurant.name}</h4>
      <p className="text-sm opacity-90">{restaurant.cuisine}</p>
      <div className="flex items-center gap-1 mt-1 text-sm">
        <StarIcon className="w-4 h-4 text-primary fill-current" />
        <span>{restaurant.rating} ({restaurant.reviews.length})</span>
      </div>
    </div>
  </div>
);


interface HomePageProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

const HomePage: React.FC<HomePageProps> = ({ restaurants, onSelectRestaurant }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<GeneralAiRecommendation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Background Image Carousel Effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Geolocation Effect
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
            },
            (err) => {
                console.warn("User denied geolocation access:", err.message);
            }
        );
    }, []);

    const handleSuggestionClick = async (type: 'trending' | 'location' | 'offers') => {
        setIsLoading(true);
        setRecommendations(null);
        setError(null);
        try {
            const result = await getGeneralRecommendations(type, userLocation);
            if (result) {
                setRecommendations(result);
            } else {
                setError('Could not get recommendations. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const topRatedRestaurants = useMemo(() => {
        return [...restaurants].sort((a, b) => b.rating - a.rating);
    }, [restaurants]);

    const popularNearYou = useMemo(() => {
        // Mocking "popular near you" by shuffling for now
        return [...restaurants].sort(() => 0.5 - Math.random());
    }, [restaurants]);

    return (
        <div className="min-h-screen w-full relative">
            {/* Background Carousel */}
            <div className="fixed inset-0 z-0">
                {carouselImages.map((src, index) => (
                    <img
                        key={src}
                        src={src}
                        alt="Food background"
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Scrollable Foreground Content */}
            <div className="relative z-10 h-screen overflow-y-auto pb-32">
                <div className="w-full max-w-4xl mx-auto px-6 space-y-10 pt-8">
                     <div className="text-center p-6 glass-card rounded-2xl">
                        <h1 className="font-sans text-4xl sm:text-5xl font-extrabold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                            Welcome!
                        </h1>
                        <p className="text-white/90 mt-2 text-lg" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>What are you craving today?</p>
                    </div>

                    <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <SparklesIcon className="w-8 h-8 text-primary" />
                            <h2 className="text-2xl font-bold text-white">AI Meal Suggester</h2>
                        </div>
                        <p className="text-white/90 mb-6">
                            Don't know what to eat? Let our AI find the perfect meal for you based on your location, trending dishes, or the best offers available.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <SuggestionButton icon={MapPinIcon} label="Near Me" onClick={() => handleSuggestionClick('location')} disabled={!userLocation} />
                            <SuggestionButton icon={TrendingUpIcon} label="Trending" onClick={() => handleSuggestionClick('trending')} />
                            <SuggestionButton icon={StarIcon} label="Top Offers" onClick={() => handleSuggestionClick('offers')} />
                        </div>
                    </div>

                    {(isLoading || error || recommendations) && (
                        <div className="glass-card rounded-2xl p-6">
                            {isLoading && (
                                <div className="text-center py-10">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                    <p className="mt-4 text-white/80">Generating your perfect meal...</p>
                                </div>
                            )}
                            {error && <p className="text-center text-red-300">{error}</p>}
                            {recommendations && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-xl text-white">Here are some ideas!</h3>
                                    {recommendations.suggestions.map((rec, index) => (
                                        <div key={index} className="bg-surface/20 p-4 rounded-xl animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                            <h4 className="font-bold text-primary">{rec.title}</h4>
                                            <p className="text-white/80 text-sm">{rec.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Restaurant Carousels Section */}
                    <div className="space-y-10">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>Top Rated</h3>
                            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
                                {topRatedRestaurants.map(r => <RestaurantCarouselCard key={r.id} restaurant={r} onSelect={() => onSelectRestaurant(r)} />)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>Popular Near You</h3>
                             <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
                                {popularNearYou.map(r => <RestaurantCarouselCard key={r.id} restaurant={r} onSelect={() => onSelectRestaurant(r)} />)}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
                /* Hide scrollbar for carousels */
                .overflow-x-auto::-webkit-scrollbar { display: none; }
                .overflow-x-auto { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default HomePage;
import React, { useState, useMemo } from 'react';
import { Restaurant } from '../types';
import { MapPinIcon, QrCodeIcon, StarIcon } from './Icons';
import QrCodeScanner from './QrCodeScanner';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onSelect: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onSelect }) => (
  <div
    className="glass-card rounded-2xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group hover:shadow-glow-primary flex flex-col"
    onClick={onSelect}
  >
    <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
    <div className="p-4 flex flex-col flex-grow">
      <h3 className="font-sans text-xl font-bold text-copy">{restaurant.name}</h3>
      <p className="text-sm text-copy-light">{restaurant.cuisine}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {restaurant.categories.slice(0, 3).map((category) => (
          <span
            key={category}
            className="bg-surface-light text-copy-light text-xs font-medium px-2 py-1 rounded-full"
          >
            {category}
          </span>
        ))}
      </div>
      <div className="flex-grow" />
      <div className="flex justify-between items-center mt-3 text-sm">
        <div className="flex items-center gap-1 text-secondary">
          <StarIcon className="w-4 h-4 fill-current" />
          <span className="font-semibold">{restaurant.rating}</span>
          <span className="text-copy-lighter text-xs">({restaurant.reviews.length})</span>
        </div>
        <div className="flex items-center gap-1 text-copy-light">
          <MapPinIcon className="w-4 h-4" />
          <span>{restaurant.distance}</span>
        </div>
      </div>
    </div>
  </div>
);

interface DiscoverScreenProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ restaurants, onSelectRestaurant }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(
      (r) =>
        (r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchTerm.toLowerCase())) &&
        r.status === 'active'
    );
  }, [restaurants, searchTerm]);

  const handleScanSuccess = (data: string) => {
    setIsScannerOpen(false);
    try {
      // Prefer JSON format for extensibility, e.g., {"restaurantId":"r1"}
      const parsedData = JSON.parse(data);
      if (parsedData && parsedData.restaurantId) {
        const foundRestaurant = restaurants.find(r => r.id === parsedData.restaurantId);
        if (foundRestaurant) {
          onSelectRestaurant(foundRestaurant);
        } else {
          alert(`Restaurant with ID "${parsedData.restaurantId}" not found.`);
        }
      } else {
        alert('Invalid QR code format.');
      }
    } catch (e) {
      // Fallback for simple string QR codes, e.g., "r1"
      const foundRestaurant = restaurants.find(r => r.id === data);
      if (foundRestaurant) {
        onSelectRestaurant(foundRestaurant);
      } else {
        alert(`Could not process QR code data: ${data}`);
      }
    }
  };


  return (
    <div className="min-h-screen pt-16 pb-28">
       <div className="text-center p-6">
            <h1 className="font-sans text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-brand-orange via-secondary to-green-400 animate-gradient-x">Find a Table</h1>
            <p className="text-copy-light mt-2">Discover unique dining experiences.</p>
       </div>
      
      <div className="px-6 pb-6 max-w-lg mx-auto">
        <input
          type="text"
          placeholder="Search by name or cuisine..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full shadcn-input"
        />
      </div>

      <div className="px-6 pb-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onSelect={() => onSelectRestaurant(restaurant)}
          />
        ))}
      </div>
      
      <div className="fixed bottom-24 left-0 w-full p-4 pointer-events-none">
         <div className="max-w-md mx-auto glass-card rounded-2xl p-2 pointer-events-auto">
              <button onClick={() => setIsScannerOpen(true)} className="w-full text-brand-charcoal font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 transition-all duration-300 transform hover:scale-105">
                <QrCodeIcon className="w-6 h-6" />
                <span>Scan QR Code</span>
              </button>
         </div>
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

export default DiscoverScreen;
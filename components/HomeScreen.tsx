
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
    className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    onClick={onSelect}
  >
    <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-40 object-cover" />
    <div className="p-4">
      <h3 className="font-serif text-xl font-bold text-brand-charcoal">{restaurant.name}</h3>
      <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
      <div className="flex justify-between items-center mt-3 text-sm">
        <div className="flex items-center gap-1 text-brand-gold">
          <StarIcon className="w-4 h-4 fill-current" />
          <span className="font-semibold">{restaurant.rating}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <MapPinIcon className="w-4 h-4" />
          <span>{restaurant.distance}</span>
        </div>
      </div>
    </div>
  </div>
);

interface HomeScreenProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ restaurants, onSelectRestaurant }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="bg-gray-50 min-h-screen">
       <div className="p-6">
            <h1 className="font-serif text-4xl font-extrabold text-brand-charcoal">Find a Table</h1>
            <p className="text-gray-500 mt-1">Discover restaurants near you.</p>
       </div>
      
      <div className="px-6 pb-6">
        <input
          type="text"
          placeholder="Search by name or cuisine..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-gold transition"
        />
      </div>

      <div className="px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onSelect={() => onSelectRestaurant(restaurant)}
          />
        ))}
      </div>
      
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl px-4">
         <div className="max-w-md mx-auto">
            <div className="p-4 bg-gradient-to-t from-white to-transparent">
              <button onClick={() => setIsScannerOpen(true)} className="w-full bg-brand-charcoal text-white font-bold py-4 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transform hover:scale-105 transition-transform duration-300">
                <QrCodeIcon className="w-6 h-6" />
                <span>Scan QR Code</span>
              </button>
            </div>
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

export default HomeScreen;
import React, { useState, useMemo, useEffect } from 'react';
import { Restaurant, MenuItem, CartItem, AiRecommendation } from '../types';
import getMenuRecommendations from '../services/geminiService';
import { ChevronLeftIcon, ShoppingCartIcon, SparklesIcon, XIcon, PlusIcon, MinusIcon, CheckCircleIcon } from './Icons';

const Tag: React.FC<{ label: string }> = ({ label }) => {
    const colors: { [key: string]: string } = {
        vegetarian: 'bg-emerald-100 text-emerald-800',
        spicy: 'bg-red-100 text-red-800',
        'gluten-free': 'bg-blue-100 text-blue-800',
        new: 'bg-yellow-100 text-yellow-800',
    };
    return <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${colors[label] || 'bg-gray-100 text-gray-800'}`}>{label}</span>
};

const MenuItemCard: React.FC<{ item: MenuItem; onAdd: () => void; primaryColor: string; }> = ({ item, onAdd, primaryColor }) => {
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        onAdd();
        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
        }, 500);
    };

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
            <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <h4 className="font-bold text-lg text-brand-charcoal">{item.name}</h4>
                <p className="text-gray-500 text-sm mt-1 flex-grow">{item.description}</p>
                 <div className="mt-2">
                    {item.tags.map(tag => <Tag key={tag} label={tag} />)}
                </div>
                <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-brand-charcoal text-lg">${item.price.toFixed(2)}</span>
                    <button 
                        onClick={handleAddToCart} 
                        style={isAdded ? { backgroundColor: '#1BAE89'} : { backgroundColor: primaryColor }}
                        className={`
                            text-white rounded-full w-10 h-10 flex items-center justify-center 
                            transform hover:scale-110 transition-all duration-300 ease-in-out
                            ${isAdded ? 'scale-125' : ''}
                        `}
                    >
                        {isAdded ? <CheckCircleIcon className="w-6 h-6"/> : <PlusIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Cart: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    onUpdateQuantity: (itemId: string, newQuantity: number) => void;
    onPlaceOrder: () => void;
    restaurantName: string;
}> = ({ isOpen, onClose, cart, onUpdateQuantity, onPlaceOrder, restaurantName }) => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="bg-white w-full rounded-t-3xl p-6 flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-serif text-2xl font-bold">Your Order</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <p className="text-gray-600 mb-4">from <span className="font-bold">{restaurantName}</span></p>
                
                {cart.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">Your cart is empty.</p>
                ) : (
                    <div className="overflow-y-auto space-y-4 flex-grow">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center gap-4">
                                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                                <div className="flex-grow">
                                    <h5 className="font-semibold">{item.name}</h5>
                                    <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2 border border-gray-200 rounded-full p-1">
                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"><MinusIcon className="w-4 h-4" /></button>
                                    <span className="font-bold w-6 text-center">{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"><PlusIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {cart.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                        <div className="flex justify-between items-center font-bold text-lg mb-4">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <button onClick={onPlaceOrder} className="w-full bg-brand-charcoal text-white font-bold py-4 rounded-full shadow-lg hover:bg-opacity-90 transition">
                            Place Order
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const RecommendationModal: React.FC<{ isOpen: boolean; onClose: () => void; recommendation: AiRecommendation | null; isLoading: boolean, primaryColor: string }> = ({ isOpen, onClose, recommendation, isLoading, primaryColor }) => {
    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2 mb-4">
                    <SparklesIcon className="w-6 h-6" style={{color: primaryColor}} />
                    <h3 className="font-serif text-2xl font-bold">AI Recommendation</h3>
                </div>
                {isLoading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: primaryColor}}></div>
                        <p className="mt-4 text-gray-600">Generating your perfect meal...</p>
                    </div>
                ) : recommendation ? (
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-bold">Starter: {recommendation.starter.name}</h4>
                            <p className="text-sm text-gray-600 italic">"{recommendation.starter.reasoning}"</p>
                        </div>
                         <div>
                            <h4 className="font-bold">Main: {recommendation.main.name}</h4>
                            <p className="text-sm text-gray-600 italic">"{recommendation.main.reasoning}"</p>
                        </div>
                         <div>
                            <h4 className="font-bold">Drink: {recommendation.drink.name}</h4>
                            <p className="text-sm text-gray-600 italic">"{recommendation.drink.reasoning}"</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg mt-4">
                             <h4 className="font-bold">Why it works:</h4>
                             <p className="text-sm text-gray-700">{recommendation.overallReasoning}</p>
                        </div>
                    </div>
                ) : <p>Sorry, we couldn't get a recommendation right now.</p>}
            </div>
        </div>
    );
}


interface MenuScreenProps {
  restaurant: Restaurant;
  menu: MenuItem[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateCartQuantity: (itemId: string, newQuantity: number) => void;
  onPlaceOrder: () => void;
  onBack: () => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ restaurant, menu, cart, onAddToCart, onUpdateCartQuantity, onPlaceOrder, onBack }) => {
  const [activeCategory, setActiveCategory] = useState<string>(restaurant.categories[0] || '');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRecoModalOpen, setIsRecoModalOpen] = useState(false);
  const [recommendation, setRecommendation] = useState<AiRecommendation | null>(null);
  const [isRecoLoading, setIsRecoLoading] = useState(false);

  const categories = useMemo(() => restaurant.categories, [restaurant.categories]);
  const filteredMenu = useMemo(() => menu.filter(item => item.category === activeCategory), [menu, activeCategory]);
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  
  useEffect(() => {
      // Ensure active category is valid if categories change
      if (categories.length > 0 && !categories.includes(activeCategory)) {
          setActiveCategory(categories[0]);
      }
  }, [categories, activeCategory]);

  const handleGetRecommendation = async () => {
    setIsRecoModalOpen(true);
    setIsRecoLoading(true);
    const result = await getMenuRecommendations(menu, cart);
    setRecommendation(result);
    setIsRecoLoading(false);
  }
  
  const { primaryColor, welcomeMessage, dailySpecial } = restaurant.theme;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="relative h-48">
        <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <button onClick={onBack} className="absolute top-4 left-4 bg-white bg-opacity-80 rounded-full p-2 text-brand-charcoal">
            <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div className="absolute bottom-0 left-0 p-4 flex items-center gap-4">
            <img src={restaurant.logoUrl} alt={`${restaurant.name} logo`} className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-lg" />
            <h1 className="font-serif text-3xl font-bold text-white shadow-text">{restaurant.name}</h1>
        </div>
      </div>
      
      {welcomeMessage && (
        <div className="p-4 bg-white border-b border-gray-200">
            <p className="text-center text-gray-700 italic">{welcomeMessage}</p>
        </div>
      )}

      {dailySpecial && dailySpecial.active && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">
                    <SparklesIcon className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                    <h3 className="font-bold text-yellow-800">{dailySpecial.title}</h3>
                    <p className="text-sm text-yellow-700 mt-1">{dailySpecial.description}</p>
                </div>
            </div>
        </div>
      )}

      <div className="p-4 sticky top-0 bg-gray-50 z-10 shadow-sm">
        <div className="flex justify-between items-center">
             <div className="flex space-x-2 overflow-x-auto pb-2 -mb-2">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${activeCategory === category ? 'text-white' : 'bg-white text-brand-charcoal'}`}
                        style={activeCategory === category ? { backgroundColor: primaryColor } : {}}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <button onClick={handleGetRecommendation} className="ml-2 p-2 rounded-full text-white flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                <SparklesIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMenu.map(item => <MenuItemCard key={item.id} item={item} onAdd={() => onAddToCart(item)} primaryColor={primaryColor} />)}
      </div>

      {cartItemCount > 0 && (
         <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 to-transparent md:max-w-md md:mx-auto md:left-auto md:right-auto md:bottom-4 md:rounded-b-lg">
          <button 
            onClick={() => setIsCartOpen(true)}
            style={{ backgroundColor: primaryColor }}
            className="w-full text-white font-bold py-4 px-6 rounded-full shadow-lg flex items-center justify-between transform hover:scale-105 transition-transform duration-300"
        >
             <div className="flex items-center gap-2">
                <ShoppingCartIcon className="w-6 h-6" />
                <span>View Order</span>
             </div>
            <span className="bg-white font-bold rounded-full w-8 h-8 flex items-center justify-center" style={{ color: primaryColor }}>{cartItemCount}</span>
          </button>
      </div>
      )}

      {/* FIX: Corrected prop name from onUpdateQuantity to onUpdateCartQuantity */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} onUpdateQuantity={onUpdateCartQuantity} onPlaceOrder={() => { onPlaceOrder(); setIsCartOpen(false); }} restaurantName={restaurant.name} />
      <RecommendationModal isOpen={isRecoModalOpen} onClose={() => setIsRecoModalOpen(false)} recommendation={recommendation} isLoading={isRecoLoading} primaryColor={primaryColor} />
    </div>
  );
};

export default MenuScreen;
import React, { useState, useMemo, useEffect } from 'react';
import { Restaurant, MenuItem, CartItem, AiRecommendation, OrderContext } from '../types';
import getMenuRecommendations from '../services/geminiService';
import { ChevronLeftIcon, ShoppingCartIcon, SparklesIcon, XIcon, PlusIcon, MinusIcon, CheckCircleIcon, HandIcon } from './Icons';
import FloatingActionButton from './FloatingActionButton';
import ServiceRequestModal from './ServiceRequestModal';

const Tag: React.FC<{ label: string }> = ({ label }) => {
    const colors: { [key: string]: string } = {
        vegetarian: 'bg-green-100 text-green-800',
        spicy: 'bg-red-100 text-red-800',
        'gluten-free': 'bg-blue-100 text-blue-800',
        new: 'bg-yellow-100 text-yellow-800',
    };
    return <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${colors[label] || 'bg-slate-200 text-slate-800'}`}>{label}</span>
};

const MenuItemCard: React.FC<{ item: MenuItem; onAdd: () => void; }> = ({ item, onAdd }) => {
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        onAdd();
        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
        }, 500);
    };

    return (
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col group">
            <div className="overflow-hidden">
                <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h4 className="font-bold text-lg text-copy">{item.name}</h4>
                <p className="text-copy-light text-sm mt-1 flex-grow">{item.description}</p>
                 <div className="mt-2">
                    {item.tags.map(tag => <Tag key={tag} label={tag} />)}
                </div>
                <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-copy text-lg">${item.price.toFixed(2)}</span>
                    <button 
                        onClick={handleAddToCart} 
                        className={`
                            ${isAdded ? 'bg-secondary text-white' : 'bg-primary text-brand-charcoal'}
                            rounded-full w-10 h-10 flex items-center justify-center 
                            transform hover:scale-110 transition-all duration-300 ease-in-out shadow-lg
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
    onUpdateCartQuantity: (itemId: string, newQuantity: number) => void;
    onPlaceOrder: () => void;
    restaurant: Restaurant;
    orderContext: OrderContext | null;
}> = ({ isOpen, onClose, cart, onUpdateCartQuantity, onPlaceOrder, restaurant, orderContext }) => {
    
    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
    
    const deliveryFee = useMemo(() => {
        if (orderContext?.orderType === 'delivery' && restaurant.deliveryConfig?.enabledByAdmin) {
            return restaurant.deliveryConfig.deliveryFee;
        }
        return 0;
    }, [orderContext, restaurant]);

    const total = subtotal + deliveryFee;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end">
            <div className="glass-card w-full max-w-7xl mx-auto rounded-t-3xl p-6 flex flex-col max-h-[80vh] border-b-0 bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-sans text-2xl font-bold text-copy">Your Order</h2>
                    <button onClick={onClose} className="text-copy-light hover:text-copy">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <p className="text-copy-light mb-4">from <span className="font-bold text-copy">{restaurant.name}</span></p>
                
                {cart.length === 0 ? (
                    <p className="text-center text-copy-light py-12">Your cart is empty.</p>
                ) : (
                    <div className="overflow-y-auto space-y-4 flex-grow pr-2">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center gap-4">
                                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                                <div className="flex-grow">
                                    <h5 className="font-semibold text-copy">{item.name}</h5>
                                    <p className="text-sm text-copy-light">${item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-surface-light rounded-full p-1">
                                    <button onClick={() => onUpdateCartQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white hover:bg-primary"><MinusIcon className="w-4 h-4" /></button>
                                    <span className="font-bold w-6 text-center text-copy">{item.quantity}</span>
                                    <button onClick={() => onUpdateCartQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white hover:bg-primary"><PlusIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {cart.length > 0 && (
                    <div className="mt-6 border-t border-primary/20 pt-4">
                        <div className="space-y-1 text-sm mb-4 text-copy-light">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            {deliveryFee > 0 && (
                                <div className="flex justify-between">
                                    <span>Delivery Fee</span>
                                    <span>${deliveryFee.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-center font-bold text-lg mb-4 text-copy">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <button onClick={onPlaceOrder} className="w-full bg-primary text-brand-charcoal font-bold py-4 rounded-xl shadow-lg hover:bg-primary/90 transition shadow-glow-primary">
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
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-2xl p-6 w-full max-w-md relative bg-white">
                 <button onClick={onClose} className="absolute top-4 right-4 text-copy-light hover:text-copy">
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2 mb-4">
                    <SparklesIcon className="w-6 h-6 text-primary" />
                    <h3 className="font-sans text-2xl font-bold text-copy">AI Recommendation</h3>
                </div>
                {isLoading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="mt-4 text-copy-light">Generating your perfect meal...</p>
                    </div>
                ) : recommendation ? (
                    <div className="space-y-4 text-copy">
                        <div>
                            <h4 className="font-bold">Starter: {recommendation.starter.name}</h4>
                            <p className="text-sm text-copy-light italic">"{recommendation.starter.reasoning}"</p>
                        </div>
                         <div>
                            <h4 className="font-bold">Main: {recommendation.main.name}</h4>
                            <p className="text-sm text-copy-light italic">"{recommendation.main.reasoning}"</p>
                        </div>
                         <div>
                            <h4 className="font-bold">Drink: {recommendation.drink.name}</h4>
                            <p className="text-sm text-copy-light italic">"{recommendation.drink.reasoning}"</p>
                        </div>
                        <div className="bg-surface-light p-3 rounded-lg mt-4">
                             <h4 className="font-bold">Why it works:</h4>
                             <p className="text-sm text-copy-light">{recommendation.overallReasoning}</p>
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
  orderContext: OrderContext | null;
  onAddToCart: (item: MenuItem) => void;
  onUpdateCartQuantity: (itemId: string, newQuantity: number) => void;
  onPlaceOrder: () => void;
  onBack: () => void;
  onCallServer: (request: string) => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ restaurant, menu, cart, orderContext, onAddToCart, onUpdateCartQuantity, onPlaceOrder, onBack, onCallServer }) => {
  const [activeCategory, setActiveCategory] = useState<string>(restaurant.categories[0] || '');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRecoModalOpen, setIsRecoModalOpen] = useState(false);
  const [recommendation, setRecommendation] = useState<AiRecommendation | null>(null);
  const [isRecoLoading, setIsRecoLoading] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

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

  const handleSelectServiceRequest = (request: string) => {
    onCallServer(request);
    // The modal will show a confirmation and then close itself.
  };
  
  const { primaryColor, welcomeMessage, dailySpecial } = restaurant.theme;

  return (
    <div className="min-h-screen pb-32">
      <div className="relative h-48 md:h-64">
        <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        <button onClick={onBack} className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm rounded-full p-2 text-white">
            <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div className="absolute bottom-0 left-0 p-4 md:p-6 flex items-center gap-4">
            <img src={restaurant.logoUrl} alt={`${restaurant.name} logo`} className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-surface object-cover shadow-lg" />
            <h1 className="font-sans text-3xl md:text-5xl font-bold text-white" style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>{restaurant.name}</h1>
        </div>
      </div>
      
      {welcomeMessage && (
        <div className="p-4 bg-surface-light my-4 rounded-xl">
            <p className="text-center text-copy-light italic">{welcomeMessage}</p>
        </div>
      )}

      {dailySpecial && dailySpecial.active && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl my-4">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-1">
                    <SparklesIcon className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                    <h3 className="font-bold text-yellow-700">{dailySpecial.title}</h3>
                    <p className="text-sm text-yellow-600/80 mt-1">{dailySpecial.description}</p>
                </div>
            </div>
        </div>
      )}

      <div className="p-4 sticky top-0 bg-background/80 backdrop-blur-xl z-10 shadow-sm -mx-4">
        <div className="flex justify-between items-center container mx-auto">
             <div className="flex space-x-2 overflow-x-auto pb-2 -mb-2">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors ${activeCategory === category ? 'bg-primary text-brand-charcoal shadow-glow-primary' : 'bg-surface-light text-copy-light hover:bg-surface'}`}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <button onClick={handleGetRecommendation} className="ml-2 p-2 rounded-full text-brand-charcoal flex-shrink-0 bg-primary shadow-glow-primary">
                <SparklesIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 -mx-4">
        {filteredMenu.map(item => <MenuItemCard key={item.id} item={item} onAdd={() => onAddToCart(item)} />)}
      </div>

      {cartItemCount > 0 && (
         <div className="fixed bottom-28 left-0 w-full p-4 pointer-events-none">
            <div className="max-w-md mx-auto glass-card rounded-2xl p-2 pointer-events-auto">
                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="w-full text-brand-charcoal font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-between bg-primary hover:bg-primary/80 transition-all transform hover:scale-105"
                  >
                     <div className="flex items-center gap-2">
                        <ShoppingCartIcon className="w-6 h-6" />
                        <span>View Order</span>
                     </div>
                    <span className="bg-white text-primary font-bold rounded-full w-8 h-8 flex items-center justify-center">{cartItemCount}</span>
                  </button>
            </div>
        </div>
      )}

      {orderContext?.orderType === 'dine-in' && restaurant.serviceRequests.length > 0 && (
          <FloatingActionButton
              onClick={() => setIsServiceModalOpen(true)}
              label="Hail Waiter"
              icon={HandIcon}
          />
      )}

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        onUpdateCartQuantity={onUpdateCartQuantity} 
        onPlaceOrder={() => { onPlaceOrder(); setIsCartOpen(false); }} 
        restaurant={restaurant}
        orderContext={orderContext}
       />
      <RecommendationModal isOpen={isRecoModalOpen} onClose={() => setIsRecoModalOpen(false)} recommendation={recommendation} isLoading={isRecoLoading} primaryColor={primaryColor} />
      <ServiceRequestModal 
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        serviceRequests={restaurant.serviceRequests}
        onSelectRequest={handleSelectServiceRequest}
        primaryColor={primaryColor}
      />
    </div>
  );
};

export default MenuScreen;
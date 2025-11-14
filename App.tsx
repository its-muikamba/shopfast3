import React, { useState, useEffect, useCallback } from 'react';
import { View, Restaurant, CartItem, Order, StaffRole, StaffMember, MenuItem, OrderContext } from './types';
import { RESTAURANTS, MENUS, STAFF_MEMBERS } from './constants';
import HomeScreen from './components/HomeScreen';
import MenuScreen from './components/MenuScreen';
import OrderTrackerScreen from './components/OrderTrackerScreen';
import PaymentScreen from './components/PaymentScreen';
import { LogoIcon } from './components/Icons';
import HQLoginScreen from './components/hq/HQLoginScreen';
import HQDashboard from './components/hq/HQDashboard';
import RestaurantLoginScreen from './components/restaurant/RestaurantLoginScreen';
import RestaurantDashboard from './components/restaurant/RestaurantDashboard';
import OrderContextModal from './components/OrderContextModal';

const DinerApp: React.FC<{
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
  selectedRestaurant: Restaurant | null;
  menu: MenuItem[];
  view: View;
  cart: CartItem[];
  handleAddToCart: (item: any, quantity?: number) => void;
  handleUpdateCartQuantity: (itemId: string, newQuantity: number) => void;
  handlePlaceOrder: () => void;
  handleBackToHome: () => void;
  order: Order | null;
  setOrder: (order: Order | null) => void;
  setView: (view: View) => void;
  handlePaymentSuccess: () => void;
  resetApp: () => void;
}> = (props) => {
  const {
    restaurants, onSelectRestaurant, selectedRestaurant, menu, view, cart, 
    handleAddToCart, handleUpdateCartQuantity, handlePlaceOrder, 
    handleBackToHome, order, setOrder, setView, handlePaymentSuccess, resetApp
  } = props;

  const renderContent = () => {
    switch (view) {
      case View.MENU:
        if (selectedRestaurant) {
          return (
            <MenuScreen
              restaurant={selectedRestaurant}
              menu={menu}
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateCartQuantity={handleUpdateCartQuantity}
              onPlaceOrder={handlePlaceOrder}
              onBack={handleBackToHome}
            />
          );
        }
      case View.TRACKING:
        if (order) {
          return <OrderTrackerScreen order={order} setOrder={setOrder} onOrderServed={() => setView(View.PAYMENT)} />;
        }
      case View.PAYMENT:
        if (order) {
            return <PaymentScreen order={order} onPaymentSuccess={handlePaymentSuccess} onFinish={resetApp} />
        }
      case View.HOME:
      default:
        return <HomeScreen restaurants={restaurants} onSelectRestaurant={onSelectRestaurant} />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-brand-charcoal md:max-w-md md:mx-auto md:shadow-2xl md:my-4 md:rounded-lg">
      <main className="relative">{renderContent()}</main>
      <footer className="text-center p-4 text-xs text-gray-400">
        <div className="flex justify-center items-center gap-2 mb-2">
            <LogoIcon className="h-6 w-6 text-brand-gold" />
            <p className="font-serif text-lg text-brand-charcoal">ShopFast</p>
        </div>
        &copy; {new Date().getFullYear()} ShopFast Restaurant Mode. All rights reserved.
      </footer>
    </div>
  );
};


type AppMode = 'diner' | 'hq' | 'restaurant';

const getAppModeFromHash = (): AppMode => {
    const hash = window.location.hash;
    if (hash === '#/hq') return 'hq';
    if (hash === '#/restaurant') return 'restaurant';
    return 'diner';
};


const App: React.FC = () => {
  // Global State
  const [restaurants, setRestaurants] = useState<Restaurant[]>(RESTAURANTS);
  const [menus, setMenus] = useState<Record<string, MenuItem[]>>(MENUS);
  const [appMode, setAppMode] = useState<AppMode>(getAppModeFromHash());

  // App Routing
  const handleHashChange = useCallback(() => {
    setAppMode(getAppModeFromHash());
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [handleHashChange]);

  // Diner App State
  const [view, setView] = useState<View>(View.HOME);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [isOrderContextModalOpen, setIsOrderContextModalOpen] = useState(false);
  const [orderContext, setOrderContext] = useState<OrderContext | null>(null);

  // HQ App State
  const [isHqLoggedIn, setIsHqLoggedIn] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>(STAFF_MEMBERS);

  // Restaurant App State
  const [loggedInRestaurant, setLoggedInRestaurant] = useState<Restaurant | null>(null);
  const [loggedInRole, setLoggedInRole] = useState<StaffRole | null>(null);

  // Diner App Logic
  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsOrderContextModalOpen(true);
  };

  const handleOrderContextSet = (context: OrderContext) => {
    setOrderContext(context);
    setIsOrderContextModalOpen(false);
    setView(View.MENU);
  };

  const handleAddToCart = (item: any, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        ).filter(cartItem => cartItem.quantity > 0);
      } else if (quantity > 0) {
        return [...prevCart, { ...item, quantity }];
      }
      return prevCart;
    });
  };
  
  const handleUpdateCartQuantity = (itemId: string, newQuantity: number) => {
    setCart(prevCart => {
      if(newQuantity <= 0) {
        return prevCart.filter(item => item.id !== itemId);
      }
      return prevCart.map(item => item.id === itemId ? {...item, quantity: newQuantity} : item);
    });
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0 || !selectedRestaurant || !orderContext) return;
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      restaurant: selectedRestaurant,
      items: cart,
      total,
      status: 'Received',
      ...orderContext,
    };
    setOrder(newOrder);
    setCart([]);
    setView(View.TRACKING);
  };
  
  const handlePaymentSuccess = () => {
      if (!order) return;
      setOrder({...order, status: 'Paid'});
  };
  
  const resetApp = () => {
      setView(View.HOME);
      setSelectedRestaurant(null);
      setCart([]);
      setOrder(null);
      setOrderContext(null);
      window.location.hash = '';
  };

  const handleBackToHome = () => {
    setSelectedRestaurant(null);
    setOrderContext(null);
    setView(View.HOME);
  };

  // HQ App Logic
  const handleHqLogin = () => setIsHqLoggedIn(true);
  const handleHqLogout = () => {
    setIsHqLoggedIn(false);
  };
  const handleAddRestaurant = (payload: { restaurantData: Omit<Restaurant, 'id' | 'rating' | 'distance' | 'theme'>, adminData: Omit<StaffMember, 'id' | 'restaurantId' | 'role' | 'status'>}) => {
    const { restaurantData, adminData } = payload;
    const newRestaurantId = `r${Date.now()}`;
    
    const newRestaurant: Restaurant = {
      ...restaurantData,
      id: newRestaurantId,
      rating: 0,
      distance: 'new',
      theme: {
          welcomeMessage: `Welcome to ${restaurantData.name}!`,
          primaryColor: '#C5A052', // Default gold
          dailySpecial: {
            title: '',
            description: '',
            active: false,
          }
      }
    };
    
    const newAdmin: StaffMember = {
        ...adminData,
        id: `s${Date.now()}`,
        restaurantId: newRestaurantId,
        role: StaffRole.ADMIN,
        status: 'active'
    };
    
    setRestaurants(prev => [newRestaurant, ...prev]);
    setStaff(prev => [...prev, newAdmin]);
  };
  const handleUpdateRestaurant = (updatedRestaurant: Restaurant) => {
    setRestaurants(prev => prev.map(r => r.id === updatedRestaurant.id ? updatedRestaurant : r));
    if (loggedInRestaurant && loggedInRestaurant.id === updatedRestaurant.id) {
        setLoggedInRestaurant(updatedRestaurant);
    }
  };
   const handleAddStaffMember = (staffData: Omit<StaffMember, 'id' | 'status'>) => {
    const newStaffMember: StaffMember = {
      ...staffData,
      id: `s${Date.now()}`,
      status: 'active',
    };
    setStaff(prev => [...prev, newStaffMember]);
  };

  const handleDeleteRestaurant = (restaurantId: string) => {
    setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
    setStaff(prev => prev.filter(s => s.restaurantId !== restaurantId));
  };

  const handleUpdateStaffMember = (updatedStaff: StaffMember) => {
    setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
  };

  const handleDeleteStaffMember = (staffId: string) => {
    setStaff(prev => prev.filter(s => s.id !== staffId));
  };

  const handleUpdateMenuItem = (restaurantId: string, updatedItem: MenuItem) => {
    setMenus(prevMenus => ({
      ...prevMenus,
      [restaurantId]: prevMenus[restaurantId].map(item => item.id === updatedItem.id ? updatedItem : item)
    }));
  };
  
  // Restaurant App Logic
  const handleRestaurantLogin = (restaurantId: string, name: string, pin: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (!restaurant) {
      alert('Restaurant not found.');
      return;
    }
    if (restaurant.status === 'disabled') {
      alert('This restaurant account is currently suspended. Please contact HQ.');
      return;
    }

    const staffMember = staff.find(s => s.restaurantId === restaurantId && s.name.toLowerCase() === name.toLowerCase() && s.pin === pin);
    if (staffMember) {
        if (staffMember.status === 'suspended') {
            alert('Your account has been suspended. Please contact your administrator.');
            return;
        }
        setLoggedInRestaurant(restaurant);
        setLoggedInRole(staffMember.role);
    } else {
      alert('Invalid staff name or PIN. Please try again.');
    }
  };
  const handleRestaurantLogout = () => {
    setLoggedInRestaurant(null);
    setLoggedInRole(null);
  };

  const renderApp = () => {
    switch(appMode) {
      case 'hq':
        if (!isHqLoggedIn) {
          return <HQLoginScreen onLogin={handleHqLogin} />;
        }
        return <HQDashboard 
                  restaurants={restaurants} 
                  staff={staff}
                  onLogout={handleHqLogout}
                  onAddRestaurant={handleAddRestaurant} 
                  onUpdateRestaurant={handleUpdateRestaurant}
                  onDeleteRestaurant={handleDeleteRestaurant}
                  onAddStaffMember={handleAddStaffMember}
               />;
      case 'restaurant':
        if (!loggedInRestaurant || !loggedInRole) {
          return <RestaurantLoginScreen restaurants={restaurants} onLogin={handleRestaurantLogin} />;
        }
        return <RestaurantDashboard 
                  restaurant={loggedInRestaurant} 
                  role={loggedInRole} 
                  staff={staff}
                  menu={menus[loggedInRestaurant.id] || []}
                  onAddStaffMember={handleAddStaffMember}
                  onUpdateStaffMember={handleUpdateStaffMember}
                  onDeleteStaffMember={handleDeleteStaffMember}
                  onUpdateRestaurant={handleUpdateRestaurant}
                  onUpdateMenuItem={(item) => handleUpdateMenuItem(loggedInRestaurant.id, item)}
                  onLogout={handleRestaurantLogout} 
               />;
      case 'diner':
      default:
        const dinerAppProps = {
          restaurants, onSelectRestaurant: handleSelectRestaurant, selectedRestaurant, 
          menu: selectedRestaurant ? menus[selectedRestaurant.id] : [],
          view, cart, handleAddToCart, handleUpdateCartQuantity, handlePlaceOrder, 
          handleBackToHome, order, setOrder, setView, handlePaymentSuccess, resetApp
        };
        return (
          <>
            <DinerApp {...dinerAppProps} />
            {isOrderContextModalOpen && selectedRestaurant && (
                <OrderContextModal
                    restaurant={selectedRestaurant}
                    onClose={() => {
                        setIsOrderContextModalOpen(false);
                        setSelectedRestaurant(null);
                    }}
                    onSubmit={handleOrderContextSet}
                />
            )}
          </>
        );
    }
  }

  return (
    <div className="bg-gray-100">
      {renderApp()}
    </div>
  );
};

export default App;


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Restaurant, CartItem, Order, StaffRole, StaffMember, MenuItem, OrderContext, ServerAlert, OrderStatus, RestaurantReportData, BillingHistory, SupportTicket, TicketStatus, Tab, User, LiveOrder, Transaction, PaymentMethod, Review } from './types';
import { RESTAURANTS, MENUS, STAFF_MEMBERS, INITIAL_ACTIVE_ORDERS, RESTAURANT_REPORTS, BILLING_HISTORY, SUPPORT_TICKETS } from './constants';
import DiscoverScreen from './components/DiscoverScreen';
import MenuScreen from './components/MenuScreen';
import PaymentScreen from './components/PaymentScreen';
import HQLoginScreen from './components/hq/HQLoginScreen';
import HQDashboard from './components/hq/HQDashboard';
import RestaurantLoginScreen from './components/restaurant/RestaurantLoginScreen';
import RestaurantDashboard from './components/restaurant/RestaurantDashboard';
import OrderContextModal from './components/OrderContextModal';
import ServiceRequestModal from './components/ServiceRequestModal';
import BottomNavBar from './components/common/BottomNavBar';
import HomePage from './components/HomePage';
import OrderPage from './components/OrderPage';
import ProfileScreen from './components/ProfileScreen';
import { syncState, supabase, signOut } from './services/supabase';

// Keys for localStorage / Supabase Tables
const LIVE_ORDERS_KEY = 'shopfast_liveOrders';
const SERVER_ALERTS_KEY = 'shopfast_serverAlerts';
const CURRENT_USER_KEY = 'shopfast_currentUser';
const TRANSACTIONS_KEY = 'shopfast_transactions';
const RESTAURANTS_KEY = 'shopfast_restaurants';
const MENUS_KEY = 'shopfast_menus';
const STAFF_KEY = 'shopfast_staff';


// Helper to safely parse JSON from localStorage
const getFromStorage = <T,>(key: string, fallback: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return fallback;
    }
};

// Custom Hook: Handles Data Synchronization (LocalStorage <-> State <-> Supabase)
function useDataSync<T>(
    key: string, 
    tableName: string, 
    state: T, 
    setState: React.Dispatch<React.SetStateAction<T>>, 
    delay: number = 1000
) {
    const [isLoaded, setIsLoaded] = useState(false);
    const firstRender = useRef(true);

    // 1. Initial Load
    useEffect(() => {
        const loadData = async () => {
            // If Supabase is active, syncState handles fetching
            // If Supabase is inactive, we manually load from LS here for the initial state
            if (!supabase) {
                const localData = getFromStorage<T>(key, state);
                // Merge logic for migration (e.g. restaurants) could go here
                if (JSON.stringify(localData) !== JSON.stringify(state)) {
                     setState(localData);
                }
                setIsLoaded(true);
            } else {
                // Supabase Load
                 await syncState(tableName, key, state, setState, true);
                 setIsLoaded(true);
            }
        };
        loadData();
        firstRender.current = false;
    }, []);

    // 2. Sync on Change (Debounced)
    useEffect(() => {
        if (!isLoaded) return;

        const handler = setTimeout(() => {
            syncState(tableName, key, state, setState, false);
        }, delay);

        return () => clearTimeout(handler);
    }, [state, key, tableName, delay, isLoaded]);

    return isLoaded;
}


type AppMode = 'diner' | 'hq' | 'restaurant';

const getAppModeFromHash = (): AppMode => {
    const hash = window.location.hash;
    if (hash === '#/hq') return 'hq';
    if (hash === '#/restaurant') return 'restaurant';
    return 'diner';
};


const App: React.FC = () => {
  
  // Global State Initialization with Defaults
  const [restaurants, setRestaurants] = useState<Restaurant[]>(RESTAURANTS);
  const [menus, setMenus] = useState<Record<string, MenuItem[]>>(MENUS);
  const [staff, setStaff] = useState<StaffMember[]>(STAFF_MEMBERS);
  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>(INITIAL_ACTIVE_ORDERS);
  const [serverAlerts, setServerAlerts] = useState<ServerAlert[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Data Sync Hooks
  const restaurantsLoaded = useDataSync(RESTAURANTS_KEY, 'restaurants', restaurants, setRestaurants);
  const menusLoaded = useDataSync(MENUS_KEY, 'menus', menus, setMenus);
  const staffLoaded = useDataSync(STAFF_KEY, 'staff', staff, setStaff);
  const ordersLoaded = useDataSync(LIVE_ORDERS_KEY, 'orders', liveOrders, setLiveOrders, 500);
  const alertsLoaded = useDataSync(SERVER_ALERTS_KEY, 'alerts', serverAlerts, setServerAlerts, 500);
  const transactionsLoaded = useDataSync(TRANSACTIONS_KEY, 'transactions', transactions, setTransactions);
  
  // User Auth Initialization (Supabase or Fallback)
  useEffect(() => {
    if (supabase) {
        // 1. Check active session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setCurrentUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata.full_name || 'User',
                    orderHistory: []
                });
            }
        });

        // 2. Listen for auth changes (Login/Logout/Signup)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setCurrentUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata.full_name || 'User',
                    orderHistory: []
                });
            } else {
                setCurrentUser(null);
            }
        });

        return () => subscription.unsubscribe();
    } else {
        // Fallback: Load from LocalStorage for prototype mode
        const localUser = getFromStorage<User | null>(CURRENT_USER_KEY, null);
        if (localUser) setCurrentUser(localUser);
    }
  }, []);

  // Sync User to LocalStorage ONLY if Supabase is NOT active (Fallback mode)
  useEffect(() => {
      if (!supabase) {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      }
  }, [currentUser]);


  // Ensure data migration for currency/reviews/serviceRequests/notifications happens after load
  useEffect(() => {
      if (restaurantsLoaded) {
           setRestaurants(prev => prev.map(r => ({
              ...r,
              currency: r.currency || { code: 'KES', symbol: 'Ksh' },
              reviews: r.reviews || [],
              // Ensure service requests are populated for existing restaurants
              serviceRequests: (r.serviceRequests && r.serviceRequests.length > 0) ? r.serviceRequests : [
                  { id: `sr-def-1-${r.id}`, label: 'Request Waiter', icon: 'HandIcon' },
                  { id: `sr-def-2-${r.id}`, label: 'Request Bill', icon: 'ReceiptIcon' },
                  { id: `sr-def-3-${r.id}`, label: 'General Assistance', icon: 'BellIcon' },
              ],
              // Ensure notification settings are populated
              notificationSettings: r.notificationSettings || {
                  emailDailyReport: false,
                  pushNewOrder: true,
                  pushOrderStatus: false,
                  pushTableAlert: true,
              }
            })));
      }
  }, [restaurantsLoaded]);


  const [appMode, setAppMode] = useState<AppMode>(getAppModeFromHash());
  const [restaurantReports, setRestaurantReports] = useState<Record<string, RestaurantReportData>>(RESTAURANT_REPORTS);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>(BILLING_HISTORY);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS);

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
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [isOrderContextModalOpen, setIsOrderContextModalOpen] = useState(false);
  const [orderContext, setOrderContext] = useState<OrderContext | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  // HQ App State
  const [isHqLoggedIn, setIsHqLoggedIn] = useState(false);

  // Restaurant App State
  const [loggedInRestaurant, setLoggedInRestaurant] = useState<Restaurant | null>(null);
  const [loggedInRole, setLoggedInRole] = useState<StaffRole | null>(null);
  
  // Cross-tab synchronization (LocalStorage event listener for multi-tab support in LS mode)
  useEffect(() => {
    if (supabase) return; // Skip LS sync if using Supabase

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LIVE_ORDERS_KEY && e.newValue) setLiveOrders(JSON.parse(e.newValue));
      if (e.key === SERVER_ALERTS_KEY && e.newValue) setServerAlerts(JSON.parse(e.newValue));
      if (e.key === CURRENT_USER_KEY && e.newValue) setCurrentUser(JSON.parse(e.newValue));
      if (e.key === TRANSACTIONS_KEY && e.newValue) setTransactions(JSON.parse(e.newValue));
      if (e.key === RESTAURANTS_KEY && e.newValue) setRestaurants(JSON.parse(e.newValue));
      if (e.key === STAFF_KEY && e.newValue) setStaff(JSON.parse(e.newValue));
      if (e.key === MENUS_KEY && e.newValue) setMenus(JSON.parse(e.newValue));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  
  // Custom setters that only update state (persistence is handled by hook)
  const updateLiveOrders = useCallback((updater: React.SetStateAction<LiveOrder[]>) => {
    setLiveOrders(prevOrders => {
      return typeof updater === 'function' ? updater(prevOrders) : updater;
    });
  }, []);

  const updateServerAlerts = useCallback((updater: React.SetStateAction<ServerAlert[]>) => {
    setServerAlerts(prevAlerts => {
      return typeof updater === 'function' ? updater(prevAlerts) : updater;
    });
  }, []);

  const updateUser = useCallback((user: User | null) => {
    setCurrentUser(user);
  }, []);

   const updateTransactions = useCallback((updater: React.SetStateAction<Transaction[]>) => {
    setTransactions(prev => {
      return typeof updater === 'function' ? updater(prev) : updater;
    });
  }, []);

  const updateRestaurants = useCallback((updater: React.SetStateAction<Restaurant[]>) => {
    setRestaurants(prev => {
        return typeof updater === 'function' ? updater(prev) : updater;
    });
  }, []);

  const updateStaff = useCallback((updater: React.SetStateAction<StaffMember[]>) => {
      setStaff(prev => {
          return typeof updater === 'function' ? updater(prev) : updater;
      });
  }, []);

  const updateMenus = useCallback((updater: React.SetStateAction<Record<string, MenuItem[]>>) => {
      setMenus(prev => {
          return typeof updater === 'function' ? updater(prev) : updater;
      });
  }, []);


  // Diner App Logic
  const handleLogin = (user: User) => updateUser(user);
  
  const handleLogout = async () => {
      if (supabase) {
          await signOut();
      }
      updateUser(null);
  };

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsOrderContextModalOpen(true);
  };

  const handleOrderContextSet = (context: OrderContext) => {
    setOrderContext(context);
    setIsOrderContextModalOpen(false);
    setView(View.MENU); // Switch to menu view
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
    
    let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (orderContext.orderType === 'delivery' && selectedRestaurant.deliveryConfig?.enabledByAdmin) {
        total += selectedRestaurant.deliveryConfig.deliveryFee;
    }

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      restaurant: selectedRestaurant,
      items: cart,
      total,
      status: 'Pending',
      paymentStatus: 'unpaid',
      userId: currentUser?.id,
      ...orderContext,
    };
    
    setOrder(newOrder);
    setCart([]);
    setView(View.HOME); // Reset sub-view
    setActiveTab(Tab.ORDER); // Switch to order tab
    
    const newLiveOrder: LiveOrder = {
        id: newOrder.id,
        restaurantId: selectedRestaurant.id,
        items: newOrder.items,
        total: newOrder.total,
        status: newOrder.status,
        paymentStatus: 'unpaid',
        userId: newOrder.userId,
        isReviewed: false,
        ...orderContext,
    };
    updateLiveOrders(prev => [newLiveOrder, ...prev]);

    if (newOrder.orderType === 'dine-in' && newOrder.tableNumber) {
      updateRestaurants(prev => prev.map(r => {
        if (r.id === selectedRestaurant.id) {
          const updatedTables = r.tables.map(t =>
            t.number === newOrder.tableNumber
              ? { ...t, orderCount: t.orderCount + 1 }
              : t
          );
          return { ...r, tables: updatedTables };
        }
        return r;
      }));
    }
  };
  
  const handlePaymentSuccess = (method: PaymentMethod) => {
      if (!order) return;

      // Update local diner state, only affecting payment status
      const updatedOrder = {...order, paymentStatus: 'paid' as const, paymentMethod: method};
      setOrder(updatedOrder);

      // Update live order for restaurant dashboard
      updateLiveOrders(prev => prev.map(o => o.id === order.id ? {...o, paymentStatus: 'paid', paymentMethod: method} : o));

      // Create a transaction record
      const newTransaction: Transaction = {
          id: `txn-${Date.now()}`,
          orderId: order.id,
          restaurantId: order.restaurant.id,
          amount: order.total,
          paymentMethod: method,
          timestamp: Date.now(),
      };
      updateTransactions(prev => [...prev, newTransaction]);
  };
  
  const resetApp = () => {
      setView(View.HOME);
      setSelectedRestaurant(null);
      setCart([]);
      setOrder(null);
      setOrderContext(null);
      setActiveTab(Tab.HOME);
      window.location.hash = '';
  };

  const handleBackToHome = () => {
    setSelectedRestaurant(null);
    setOrderContext(null);
    setView(View.HOME);
  };

  const handleCallServer = (request: string) => {
    const context = order || orderContext;
    if (!selectedRestaurant || !context || context.orderType !== 'dine-in' || !context.tableNumber) {
        console.warn("Cannot call server: missing context or not a dine-in order.");
        return;
    };
    
    const newAlert: ServerAlert = {
        id: `alert-${Date.now()}`,
        restaurantId: selectedRestaurant.id,
        tableNumber: context.tableNumber,
        request: request,
        timestamp: Date.now(),
    };
    updateServerAlerts(prev => [...prev, newAlert]);
  };

  const handleResolveAlert = (alertId: string) => {
    updateServerAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const handleAddReview = (restaurantId: string, orderId: string, reviewData: Omit<Review, 'id' | 'userId' | 'userName'>) => {
    if (!currentUser) {
        alert("You must be logged in to leave a review.");
        return;
    }

    const newReview: Review = {
        id: `rev-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        ...reviewData,
    };

    updateRestaurants(prev => {
        const newRestaurants = prev.map(r => {
            if (r.id === restaurantId) {
                const updatedReviews = [...r.reviews, newReview];
                const newTotalRating = updatedReviews.reduce((sum, rev) => sum + rev.rating, 0);
                const newAverageRating = updatedReviews.length > 0 ? parseFloat((newTotalRating / updatedReviews.length).toFixed(1)) : 0;
                
                return { ...r, reviews: updatedReviews, rating: newAverageRating };
            }
            return r;
        });
        return newRestaurants;
    });

    updateLiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, isReviewed: true } : o));
};


  // HQ App Logic
  const handleHqLogin = () => setIsHqLoggedIn(true);
  const handleHqLogout = () => setIsHqLoggedIn(false);
  const handleAddRestaurant = (payload: { restaurantData: Omit<Restaurant, 'id' | 'rating' | 'distance' | 'theme' | 'currency' | 'categories' | 'tables' | 'serviceRequests' | 'paymentSettings' | 'nextBillingDate' | 'deliveryConfig' | 'reviews' | 'notificationSettings'>, adminData: Omit<StaffMember, 'id' | 'restaurantId' | 'role' | 'status'>}) => {
    const { restaurantData, adminData } = payload;
    const newRestaurantId = `r${Date.now()}`;
    
    const newRestaurant: Restaurant = {
      ...restaurantData,
      id: newRestaurantId,
      rating: 0,
      distance: 'new',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: { code: 'KES', symbol: 'Ksh' },
      categories: ['Starters', 'Mains', 'Desserts', 'Drinks'],
      tables: [],
      serviceRequests: [
        { id: `sr-${Date.now()}-1`, label: 'Request Waiter', icon: 'HandIcon' },
        { id: `sr-${Date.now()}-2`, label: 'Request Bill', icon: 'ReceiptIcon' },
        { id: `sr-${Date.now()}-3`, label: 'General Assistance', icon: 'BellIcon' },
      ],
      reviews: [],
       paymentSettings: { stripe: { enabled: false }, mpesa: { enabled: false }, pesapal: { enabled: false } },
      deliveryConfig: { enabledByAdmin: false, deliveryFee: 0, deliveryRadius: 0, estimatedTime: 0, },
      notificationSettings: {
          emailDailyReport: false,
          pushNewOrder: true,
          pushOrderStatus: false,
          pushTableAlert: true,
      },
      theme: {
          welcomeMessage: `Welcome to ${restaurantData.name}!`,
          primaryColor: '#8A5DFF',
          specials: [],
      }
    };
    
    const newAdmin: StaffMember = { ...adminData, id: `s${Date.now()}`, restaurantId: newRestaurantId, role: StaffRole.ADMIN, status: 'active' };
    updateRestaurants(prev => [newRestaurant, ...prev]);
    updateStaff(prev => [...prev, newAdmin]);
    updateMenus(prev => ({ ...prev, [newRestaurantId]: [] }));
  };
  const handleUpdateRestaurant = (updatedRestaurant: Restaurant) => {
    updateRestaurants(prev => prev.map(r => r.id === updatedRestaurant.id ? updatedRestaurant : r));
    if (loggedInRestaurant && loggedInRestaurant.id === updatedRestaurant.id) {
        setLoggedInRestaurant(updatedRestaurant);
    }
  };
   const handleAddStaffMember = (staffData: Omit<StaffMember, 'id' | 'status'>) => {
    const newStaffMember: StaffMember = { ...staffData, id: `s${Date.now()}`, status: 'active' };
    updateStaff(prev => [...prev, newStaffMember]);
  };
  const handleDeleteRestaurant = (restaurantId: string) => {
    updateRestaurants(prev => prev.filter(r => r.id !== restaurantId));
    updateStaff(prev => prev.filter(s => s.restaurantId !== restaurantId));
    updateMenus(prev => {
      const newMenus = {...prev};
      delete newMenus[restaurantId];
      return newMenus;
    });
  };
  const handleUpdateStaffMember = (updatedStaff: StaffMember) => {
    updateStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
  };
  const handleDeleteStaffMember = (staffId: string) => {
    updateStaff(prev => prev.filter(s => s.id !== staffId));
  };
  const handleAddMenuItem = (restaurantId: string, newItemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = { ...newItemData, status: 'active', id: `m-${restaurantId}-${Date.now()}` };
    updateMenus(prevMenus => ({ ...prevMenus, [restaurantId]: [...(prevMenus[restaurantId] || []), newItem] }));
  };
  const handleUpdateMenuItem = (restaurantId: string, updatedItem: MenuItem) => {
    updateMenus(prevMenus => ({ ...prevMenus, [restaurantId]: prevMenus[restaurantId].map(item => item.id === updatedItem.id ? updatedItem : item) }));
  };
  const handleDeleteMenuItem = (restaurantId: string, itemId: string) => {
    updateMenus(prevMenus => ({ ...prevMenus, [restaurantId]: prevMenus[restaurantId].filter(item => item.id !== itemId) }));
  };
  const handleUpdateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
  };
  const handleUpdateMenuItemsStatus = (restaurantId: string, itemIds: string[], status: 'active' | 'disabled') => {
      updateMenus(prevMenus => {
          const newMenus = { ...prevMenus };
          newMenus[restaurantId] = newMenus[restaurantId].map(item => 
              itemIds.includes(item.id) ? { ...item, status } : item
          );
          return newMenus;
      });
  };
  const handleDeleteMenuItems = (restaurantId: string, itemIds: string[]) => {
      updateMenus(prevMenus => {
          const newMenus = { ...prevMenus };
          newMenus[restaurantId] = newMenus[restaurantId].filter(item => !itemIds.includes(item.id));
          return newMenus;
      });
  };

  
  // Restaurant App Logic
  const handleRestaurantLogin = (restaurantId: string, name: string, pin: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (!restaurant) { alert('Restaurant not found.'); return; }
    if (restaurant.status === 'disabled') { alert('This restaurant account is currently suspended. Please contact HQ.'); return; }
    const staffMember = staff.find(s => s.restaurantId === restaurantId && s.name.toLowerCase() === name.toLowerCase() && s.pin === pin);
    if (staffMember) {
        if (staffMember.status === 'suspended') { alert('Your account has been suspended. Please contact your administrator.'); return; }
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
  const handleAcceptOrder = (orderId: string, prepTime: number) => {
    updateLiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Received', preparationTime: prepTime, acceptedAt: Date.now() } : o ));
  };
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    updateLiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };
  const handleResetTable = (orderId: string) => {
    updateLiveOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const renderDinerContent = () => {
    if (view === View.MENU && selectedRestaurant) {
      return (
        <MenuScreen
          restaurant={selectedRestaurant}
          menu={menus[selectedRestaurant.id]}
          cart={cart}
          orderContext={orderContext}
          onAddToCart={handleAddToCart}
          onUpdateCartQuantity={handleUpdateCartQuantity}
          onPlaceOrder={handlePlaceOrder}
          onBack={handleBackToHome}
          onCallServer={handleCallServer}
        />
      );
    }

    // Main tabbed view
    return (
      <div className="min-h-screen font-sans w-full">
        <main className={`relative ${activeTab !== Tab.HOME ? 'container mx-auto px-4 py-8' : ''}`}>
            {activeTab === Tab.HOME && <HomePage restaurants={restaurants} onSelectRestaurant={handleSelectRestaurant} />}
            {activeTab === Tab.DISCOVER && <DiscoverScreen restaurants={restaurants} onSelectRestaurant={handleSelectRestaurant} />}
            {activeTab === Tab.ORDER && (
                <OrderPage 
                    order={order}
                    setOrder={setOrder}
                    onPaymentSuccess={() => handlePaymentSuccess(order?.paymentMethod || 'stripe')}
                    resetApp={resetApp}
                    liveOrders={liveOrders}
                />
            )}
            {activeTab === Tab.PROFILE && <ProfileScreen user={currentUser} onLogin={handleLogin} onLogout={handleLogout} orders={liveOrders} restaurants={restaurants} onAddReview={handleAddReview} />}
        </main>
        <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} hasActiveOrder={!!order} />
      </div>
    );
  };

  const renderApp = () => {
      // Display loading if using Supabase and data isn't ready
      if (supabase && (!restaurantsLoaded || !menusLoaded || !staffLoaded)) {
          return (
              <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
                  <p className="mt-4 text-copy-light">Syncing with Supabase...</p>
              </div>
          )
      }

    switch(appMode) {
      case 'hq':
        if (!isHqLoggedIn) return <HQLoginScreen onLogin={handleHqLogin} />;
        return <HQDashboard 
                  restaurants={restaurants} staff={staff} billingHistory={billingHistory} supportTickets={supportTickets}
                  liveOrders={liveOrders} transactions={transactions}
                  onUpdateTicketStatus={handleUpdateTicketStatus} onLogout={handleHqLogout} onAddRestaurant={handleAddRestaurant} 
                  onUpdateRestaurant={handleUpdateRestaurant} onDeleteRestaurant={handleDeleteRestaurant} onAddStaffMember={handleAddStaffMember}
               />;
      case 'restaurant':
        if (!loggedInRestaurant || !loggedInRole) return <RestaurantLoginScreen restaurants={restaurants} onLogin={handleRestaurantLogin} />;
        return <RestaurantDashboard 
                  restaurant={loggedInRestaurant} role={loggedInRole} staff={staff} menu={menus[loggedInRestaurant.id] || []}
                  liveOrders={liveOrders} transactions={transactions} onUpdateLiveOrders={updateLiveOrders} onAcceptOrder={handleAcceptOrder}
                  onUpdateOrderStatus={handleUpdateOrderStatus} serverAlerts={serverAlerts.filter(a => a.restaurantId === loggedInRestaurant.id)}
                  onResolveAlert={handleResolveAlert} onAddStaffMember={handleAddStaffMember} onUpdateStaffMember={handleUpdateStaffMember}
                  onDeleteStaffMember={handleDeleteStaffMember} onUpdateRestaurant={handleUpdateRestaurant}
                  onAddMenuItem={(item) => handleAddMenuItem(loggedInRestaurant.id, item)}
                  onUpdateMenuItem={(item) => handleUpdateMenuItem(loggedInRestaurant.id, item)}
                  onDeleteMenuItem={(itemId) => handleDeleteMenuItem(loggedInRestaurant.id, itemId)}
                  onUpdateMenuItemsStatus={(itemIds, status) => handleUpdateMenuItemsStatus(loggedInRestaurant.id, itemIds, status)}
                  onDeleteMenuItems={(itemIds) => handleDeleteMenuItems(loggedInRestaurant.id, itemIds)}
                  reportData={restaurantReports[loggedInRestaurant.id]} onLogout={handleLogout} 
                  onResetTable={handleResetTable}
               />;
      case 'diner':
      default:
        return (
          <>
            {renderDinerContent()}
            {isOrderContextModalOpen && selectedRestaurant && (
                <OrderContextModal
                    restaurant={selectedRestaurant}
                    onClose={() => { setIsOrderContextModalOpen(false); setSelectedRestaurant(null); }}
                    onSubmit={handleOrderContextSet}
                />
            )}
          </>
        );
    }
  }

  return (
    <div>
      {renderApp()}
    </div>
  );
};

export default App;

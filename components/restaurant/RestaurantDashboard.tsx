import React, { useState, useEffect } from 'react';
import { Restaurant, StaffRole, RestaurantView, StaffMember, MenuItem, Order, ServerAlert, OrderStatus, RestaurantReportData, LiveOrder, Transaction } from '../../types';
import { 
    LayoutDashboardIcon, ClipboardListIcon, UtensilsCrossedIcon, CreditCardIcon, 
    FileTextIcon, UsersIcon, SettingsIcon, LogOutIcon, ArmchairIcon, TruckIcon,
    SunIcon, MoonIcon
} from '../Icons';
import RestaurantAdminOverview from './RestaurantAdminOverview';
import ServerView from './ServerView';
import KitchenView from './KitchenView';
import RestaurantStaffManagement from './RestaurantStaffManagement';
import RestaurantSettings from './RestaurantSettings';
import MenuBuilder from './MenuBuilder';
import TableManagement from './TableManagement';
import RestaurantReports from './RestaurantReports';
import DeliveryManagementView from './DeliveryManagementView';

type Theme = 'light' | 'dark';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-primary text-brand-charcoal' : 'text-copy-light hover:bg-surface-light hover:text-copy'}`}>
        <Icon className="w-5 h-5 mr-3" />
        <span>{label}</span>
    </button>
);

interface RestaurantDashboardProps {
  restaurant: Restaurant;
  role: StaffRole;
  staff: StaffMember[];
  menu: MenuItem[];
  liveOrders: LiveOrder[];
  transactions: Transaction[];
  onUpdateLiveOrders: (orders: LiveOrder[]) => void;
  onAcceptOrder: (orderId: string, prepTime: number) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onResetTable: (orderId: string) => void;
  serverAlerts: ServerAlert[];
  onResolveAlert: (alertId: string) => void;
  onAddStaffMember: (staffData: Omit<StaffMember, 'id' | 'status'>) => void;
  onUpdateStaffMember: (staffMember: StaffMember) => void;
  onDeleteStaffMember: (staffId: string) => void;
  onUpdateRestaurant: (restaurant: Restaurant) => void;
  onAddMenuItem: (itemData: Omit<MenuItem, 'id'>) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onUpdateMenuItemsStatus: (itemIds: string[], status: 'active' | 'disabled') => void;
  onDeleteMenuItems: (itemIds: string[]) => void;
  reportData: RestaurantReportData;
  onLogout: () => void;
}

const RestaurantDashboard: React.FC<RestaurantDashboardProps> = (props) => {
  const { restaurant, role, staff, menu, liveOrders, transactions, onLogout } = props;
  const [currentView, setCurrentView] = useState<RestaurantView>(RestaurantView.DASHBOARD);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('restaurantTheme') as Theme) || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'diner-mode');
    root.classList.add(`theme-${theme}`);
    localStorage.setItem('restaurantTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const getAccessibleViews = () => {
    const baseViews = [
        { view: RestaurantView.DASHBOARD, label: "Overview", icon: LayoutDashboardIcon, roles: [StaffRole.ADMIN] },
        { view: RestaurantView.ORDERS, label: "Live Floor View", icon: ArmchairIcon, roles: [StaffRole.ADMIN, StaffRole.SERVER] },
        { view: RestaurantView.KITCHEN, label: "Kitchen View", icon: UtensilsCrossedIcon, roles: [StaffRole.ADMIN, StaffRole.KITCHEN] },
    ];
    
    if (restaurant.subscription !== 'basic' && restaurant.deliveryConfig.enabledByAdmin) {
        baseViews.push({ view: RestaurantView.DELIVERIES, label: "Delivery Management", icon: TruckIcon, roles: [StaffRole.ADMIN] })
    }
    
    const adminViews = [
        { view: RestaurantView.MENU_BUILDER, label: "Menu Builder", icon: ClipboardListIcon, roles: [StaffRole.ADMIN] },
        { view: RestaurantView.TABLE_MANAGEMENT, label: "Table Management", icon: ArmchairIcon, roles: [StaffRole.ADMIN] },
        { view: RestaurantView.STAFF, label: "Staff Management", icon: UsersIcon, roles: [StaffRole.ADMIN] },
        { view: RestaurantView.REPORTS, label: "Reports & Analytics", icon: FileTextIcon, roles: [StaffRole.ADMIN] },
        { view: RestaurantView.SETTINGS, label: "Settings", icon: SettingsIcon, roles: [StaffRole.ADMIN] },
    ];

    return [...baseViews, ...adminViews].filter(v => v.roles.includes(role));
  };
  
  const accessibleViews = getAccessibleViews();

  useEffect(() => {
    // If the current view is not accessible, default to the first accessible one
    if (!accessibleViews.some(v => v.view === currentView)) {
      setCurrentView(accessibleViews[0]?.view || RestaurantView.DASHBOARD);
    }
  }, [role, restaurant.subscription, restaurant.deliveryConfig.enabledByAdmin]);

  const renderView = () => {
    const restaurantStaff = staff.filter(s => s.restaurantId === restaurant.id);
    const restaurantLiveOrders = liveOrders.filter(o => o.restaurantId === restaurant.id);

    switch (currentView) {
      case RestaurantView.ORDERS:
        return <ServerView restaurant={restaurant} liveOrders={restaurantLiveOrders.filter(o => o.orderType === 'dine-in')} serverAlerts={props.serverAlerts} onResolveAlert={props.onResolveAlert} onUpdateOrderStatus={props.onUpdateOrderStatus} onResetTable={props.onResetTable} />;
      case RestaurantView.KITCHEN:
        return <KitchenView orders={restaurantLiveOrders} onUpdateOrderStatus={props.onUpdateOrderStatus} onAcceptOrder={props.onAcceptOrder} />;
      case RestaurantView.STAFF:
        return <RestaurantStaffManagement staff={restaurantStaff} onAddStaffMember={(data) => props.onAddStaffMember({...data, restaurantId: restaurant.id})} onUpdateStaffMember={props.onUpdateStaffMember} onDeleteStaffMember={props.onDeleteStaffMember} />;
      case RestaurantView.SETTINGS:
        return <RestaurantSettings restaurant={restaurant} onUpdateRestaurant={props.onUpdateRestaurant} />;
      case RestaurantView.MENU_BUILDER:
        return <MenuBuilder 
                    restaurant={restaurant} 
                    menu={menu} 
                    onUpdateRestaurant={props.onUpdateRestaurant} 
                    onAddMenuItem={props.onAddMenuItem} 
                    onUpdateMenuItem={props.onUpdateMenuItem} 
                    onDeleteMenuItem={props.onDeleteMenuItem}
                    onUpdateMenuItemsStatus={props.onUpdateMenuItemsStatus}
                    onDeleteMenuItems={props.onDeleteMenuItems}
                />;
      case RestaurantView.TABLE_MANAGEMENT:
        return <TableManagement restaurant={restaurant} onUpdateRestaurant={props.onUpdateRestaurant} />;
      case RestaurantView.REPORTS:
        return <RestaurantReports data={props.reportData} />;
      case RestaurantView.DELIVERIES:
        return <DeliveryManagementView liveOrders={restaurantLiveOrders} onUpdateOrderStatus={props.onUpdateOrderStatus} />;
      case RestaurantView.DASHBOARD:
      default:
        return <RestaurantAdminOverview restaurant={restaurant} liveOrders={restaurantLiveOrders} transactions={transactions} />;
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans text-copy">
      <aside className="w-64 bg-surface flex flex-col border-r border-border">
        <div className="flex items-center justify-center h-20 border-b border-border px-4">
           <div className="flex items-center gap-3">
            <img src={restaurant.logoUrl} alt={`${restaurant.name} Logo`} className="h-10 w-10 rounded-full object-cover" />
            <h1 className="font-sans text-xl font-bold text-copy-rich truncate">{restaurant.name}</h1>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            {accessibleViews.map(item => (
                <NavItem 
                    key={item.view}
                    icon={item.icon}
                    label={item.label}
                    isActive={currentView === item.view}
                    onClick={() => setCurrentView(item.view)}
                />
            ))}
        </nav>
        <div className="p-4 border-t border-border">
            <button onClick={onLogout} className="flex items-center w-full px-4 py-3 text-sm font-medium text-copy-light rounded-lg hover:bg-red-500/10 hover:text-red-600 transition-colors">
                <LogOutIcon className="w-5 h-5 mr-3" />
                <span>Logout</span>
            </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-surface border-b border-border flex items-center px-8 justify-between">
            <h2 className="text-2xl font-bold text-copy-rich">
                {accessibleViews.find(i => i.view === currentView)?.label || 'Dashboard'}
            </h2>
             <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-surface-light text-copy-light">
                {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default RestaurantDashboard;
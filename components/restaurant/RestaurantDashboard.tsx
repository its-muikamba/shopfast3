import React, { useState } from 'react';
import { Restaurant, StaffRole, RestaurantView, StaffMember, MenuItem, Order, ServerAlert, OrderStatus } from '../../types';
import { 
    LayoutDashboardIcon, ClipboardListIcon, UtensilsCrossedIcon, CreditCardIcon, 
    FileTextIcon, UsersIcon, SettingsIcon, LogOutIcon, ArmchairIcon 
} from '../Icons';
import RestaurantAdminOverview from './RestaurantAdminOverview';
import ServerView from './ServerView';
import KitchenView from './KitchenView';
import RestaurantStaffManagement from './RestaurantStaffManagement';
import RestaurantSettings from './RestaurantSettings';
import MenuBuilder from './MenuBuilder';
import TableManagement from './TableManagement';


interface NavItemProps {
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-brand-gold text-white' : 'text-gray-600 hover:bg-gray-200 hover:text-brand-charcoal'}`}>
        <Icon className="w-5 h-5 mr-3" />
        <span>{label}</span>
    </button>
);

const PlaceholderView: React.FC<{title: string}> = ({title}) => (
    <div className="bg-white p-8 rounded-lg shadow-md h-full flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-brand-charcoal">{title}</h2>
        <p className="mt-2 text-gray-500">This feature is under construction.</p>
    </div>
);


interface RestaurantDashboardProps {
  restaurant: Restaurant;
  role: StaffRole;
  staff: StaffMember[];
  menu: MenuItem[];
  liveOrders: Omit<Order, 'restaurant'>[];
  onUpdateLiveOrders: React.Dispatch<React.SetStateAction<Omit<Order, 'restaurant'>[]>>;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  serverAlerts: ServerAlert[];
  onResolveAlert: (alertId: string) => void;
  onAddStaffMember: (staffData: Omit<StaffMember, 'id' | 'status'>) => void;
  onUpdateStaffMember: (staffMember: StaffMember) => void;
  onDeleteStaffMember: (staffId: string) => void;
  onUpdateRestaurant: (restaurant: Restaurant) => void;
  onAddMenuItem: (itemData: Omit<MenuItem, 'id'>) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onLogout: () => void;
}

const RestaurantDashboard: React.FC<RestaurantDashboardProps> = ({ 
    restaurant, 
    role, 
    staff, 
    menu, 
    liveOrders,
    onUpdateLiveOrders,
    onUpdateOrderStatus,
    serverAlerts,
    onResolveAlert,
    onAddStaffMember, 
    onUpdateStaffMember, 
    onDeleteStaffMember, 
    onUpdateRestaurant,
    onAddMenuItem,
    onUpdateMenuItem,
    onDeleteMenuItem,
    onLogout 
}) => {
    
    const getInitialView = (role: StaffRole) => {
        switch(role) {
            case StaffRole.ADMIN: return RestaurantView.DASHBOARD;
            case StaffRole.SERVER: return RestaurantView.ORDERS;
            case StaffRole.KITCHEN: return RestaurantView.KITCHEN;
            case StaffRole.CASHIER: return RestaurantView.CASHIER;
            default: return RestaurantView.DASHBOARD;
        }
    }

    const [currentView, setCurrentView] = useState<RestaurantView>(getInitialView(role));
    
    const adminNav = [
        { view: RestaurantView.DASHBOARD, label: "Dashboard", icon: LayoutDashboardIcon },
        { view: RestaurantView.ORDERS, label: "Live Floor View", icon: ClipboardListIcon },
        { view: RestaurantView.KITCHEN, label: "Kitchen View", icon: UtensilsCrossedIcon },
        { view: RestaurantView.MENU_BUILDER, label: "Menu Builder", icon: FileTextIcon },
        { view: RestaurantView.TABLE_MANAGEMENT, label: "Table Management", icon: ArmchairIcon },
        { view: RestaurantView.STAFF, label: "Staff", icon: UsersIcon },
        { view: RestaurantView.REPORTS, label: "Reports", icon: CreditCardIcon },
        { view: RestaurantView.SETTINGS, label: "Settings", icon: SettingsIcon },
    ];

    const staffNav = {
        [StaffRole.SERVER]: [ { view: RestaurantView.ORDERS, label: "Live Floor View", icon: ClipboardListIcon } ],
        [StaffRole.KITCHEN]: [ { view: RestaurantView.KITCHEN, label: "Kitchen View", icon: UtensilsCrossedIcon } ],
        [StaffRole.CASHIER]: [ { view: RestaurantView.CASHIER, label: "Cashier View", icon: CreditCardIcon } ],
    };

    const availableNavItems = role === StaffRole.ADMIN ? adminNav : staffNav[role] || [];
    
    const renderView = () => {
        const restaurantStaff = staff.filter(s => s.restaurantId === restaurant.id);
        switch (currentView) {
            case RestaurantView.DASHBOARD:
                return <RestaurantAdminOverview />;
            case RestaurantView.ORDERS:
                return <ServerView 
                            restaurant={restaurant} 
                            liveOrders={liveOrders} 
                            serverAlerts={serverAlerts} 
                            onResolveAlert={onResolveAlert}
                            onUpdateOrderStatus={onUpdateOrderStatus}
                        />;
            case RestaurantView.KITCHEN:
                 return <KitchenView orders={liveOrders} onUpdateOrders={onUpdateLiveOrders} />;
            case RestaurantView.MENU_BUILDER:
                return <MenuBuilder 
                            restaurant={restaurant}
                            menu={menu}
                            onUpdateRestaurant={onUpdateRestaurant}
                            onAddMenuItem={onAddMenuItem}
                            onUpdateMenuItem={onUpdateMenuItem}
                            onDeleteMenuItem={onDeleteMenuItem}
                        />;
            case RestaurantView.TABLE_MANAGEMENT:
                 return <TableManagement restaurant={restaurant} onUpdateRestaurant={onUpdateRestaurant} />;
            case RestaurantView.STAFF:
                return <RestaurantStaffManagement 
                            staff={restaurantStaff} 
                            onAddStaffMember={(data) => onAddStaffMember({...data, restaurantId: restaurant.id})} 
                            onUpdateStaffMember={onUpdateStaffMember}
                            onDeleteStaffMember={onDeleteStaffMember}
                        />;
            case RestaurantView.REPORTS:
                return <PlaceholderView title="Reports & Analytics" />;
            case RestaurantView.SETTINGS:
                return <RestaurantSettings restaurant={restaurant} onUpdateRestaurant={onUpdateRestaurant} />;
            case RestaurantView.CASHIER:
                return <PlaceholderView title="Cashier View" />;
            default:
                return <RestaurantAdminOverview />;
        }
    };
    
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <aside className="w-64 bg-white text-brand-charcoal flex flex-col border-r">
                <div className="flex items-center justify-center h-20 border-b">
                   <div className="flex items-center gap-3 text-center">
                    <img src={restaurant.logoUrl} alt={restaurant.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <h1 className="font-bold text-md leading-tight">{restaurant.name}</h1>
                        <p className="text-xs text-gray-500">{role}</p>
                    </div>
                  </div>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {availableNavItems.map(item => (
                        <NavItem 
                            key={item.view}
                            icon={item.icon}
                            label={item.label}
                            isActive={currentView === item.view}
                            onClick={() => setCurrentView(item.view)}
                        />
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <button onClick={onLogout} className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors">
                        <LogOutIcon className="w-5 h-5 mr-3" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white border-b border-gray-200 flex items-center px-8 justify-between">
                    <h2 className="text-2xl font-bold text-brand-charcoal">
                        {availableNavItems.find(i => i.view === currentView)?.label}
                    </h2>
                </header>
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

export default RestaurantDashboard;
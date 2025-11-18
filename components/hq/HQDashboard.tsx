import React, { useState } from 'react';
import { Restaurant, StaffMember, BillingHistory, SupportTicket, TicketStatus, LiveOrder, Transaction } from '../../types';
import { HQView } from '../../types';
import HQOverview from './HQOverview';
import HQRestaurants from './HQRestaurants';
import HQReports from './HQReports';
import HQBilling from './HQBilling';
import HQAuditLogs from './HQAuditLogs';
import HQStaff from './HQStaff';
import { 
    LogoIcon, LayoutDashboardIcon, Building2Icon, FileTextIcon, 
    CreditCardIcon, HistoryIcon, LogOutIcon, UsersIcon
} from '../Icons';

interface HQDashboardProps {
  restaurants: Restaurant[];
  staff: StaffMember[];
  billingHistory: BillingHistory[];
  supportTickets: SupportTicket[];
  liveOrders: LiveOrder[];
  transactions: Transaction[];
  onUpdateTicketStatus: (ticketId: string, newStatus: TicketStatus) => void;
  onLogout: () => void;
  onAddRestaurant: (payload: { 
    restaurantData: Omit<Restaurant, 'id' | 'rating' | 'distance' | 'theme' | 'categories' | 'tables' | 'serviceRequests' | 'paymentSettings' | 'nextBillingDate' | 'deliveryConfig'>;
    adminData: Omit<StaffMember, 'id' | 'restaurantId' | 'role' | 'status'>;
  }) => void;
  onUpdateRestaurant: (restaurant: Restaurant) => void;
  onDeleteRestaurant: (restaurantId: string) => void;
  onAddStaffMember: (staffData: Omit<StaffMember, 'id' | 'status'>) => void;
}

const NavItem: React.FC<{ icon: React.ElementType, label: string, isActive: boolean, onClick: () => void }> = ({ icon: Icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-primary text-brand-charcoal' : 'text-copy-light hover:bg-primary/10 hover:text-copy'}`}>
        <Icon className="w-5 h-5 mr-3" />
        <span>{label}</span>
    </button>
);

const HQDashboard: React.FC<HQDashboardProps> = ({ 
    restaurants, 
    staff, 
    billingHistory,
    supportTickets,
    liveOrders,
    transactions,
    onUpdateTicketStatus,
    onLogout, 
    onAddRestaurant, 
    onUpdateRestaurant, 
    onDeleteRestaurant, 
    onAddStaffMember 
}) => {
  const [currentView, setCurrentView] = useState<HQView>(HQView.BILLING);

  const renderView = () => {
    switch (currentView) {
      case HQView.RESTAURANTS:
        return <HQRestaurants restaurants={restaurants} onAddRestaurant={onAddRestaurant} onUpdateRestaurant={onUpdateRestaurant} onDeleteRestaurant={onDeleteRestaurant} />;
      case HQView.ADMINS:
        return <HQStaff restaurants={restaurants} staff={staff} onAddStaffMember={onAddStaffMember} />;
      case HQView.REPORTS:
        return <HQReports tickets={supportTickets} onUpdateTicketStatus={onUpdateTicketStatus} />;
      case HQView.BILLING:
        return <HQBilling restaurants={restaurants} billingHistory={billingHistory} onUpdateRestaurant={onUpdateRestaurant} />;
      case HQView.AUDIT_LOGS:
        return <HQAuditLogs />;
      case HQView.OVERVIEW:
      default:
        return <HQOverview restaurants={restaurants} liveOrders={liveOrders} transactions={transactions} supportTickets={supportTickets} />;
    }
  };
  
  const navItems = [
      { view: HQView.OVERVIEW, label: "Overview", icon: LayoutDashboardIcon },
      { view: HQView.RESTAURANTS, label: "Restaurants", icon: Building2Icon },
      { view: HQView.ADMINS, label: "Restaurant Admins", icon: UsersIcon },
      { view: HQView.BILLING, label: "Subscription & Billing", icon: CreditCardIcon },
      { view: HQView.REPORTS, label: "Support & Escalations", icon: FileTextIcon },
      { view: HQView.AUDIT_LOGS, label: "Audit Logs", icon: HistoryIcon },
  ];

  return (
    <div className="flex h-screen bg-background font-sans text-copy">
      <aside className="w-64 bg-surface flex flex-col border-r border-gray-200">
        <div className="flex items-center justify-center h-20 border-b border-gray-200">
           <div className="flex items-center gap-2">
            <LogoIcon className="h-8 w-8 text-primary" />
            <h1 className="font-sans text-2xl font-bold">ShopFast HQ</h1>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            {navItems.map(item => (
                <NavItem 
                    key={item.view}
                    icon={item.icon}
                    label={item.label}
                    isActive={currentView === item.view}
                    onClick={() => setCurrentView(item.view)}
                />
            ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
            <button onClick={onLogout} className="flex items-center w-full px-4 py-3 text-sm font-medium text-copy-light rounded-lg hover:bg-red-500/10 hover:text-red-600 transition-colors">
                <LogOutIcon className="w-5 h-5 mr-3" />
                <span>Logout</span>
            </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-surface border-b border-gray-200 flex items-center px-8 justify-between">
            <h2 className="text-2xl font-bold text-copy">
                {navItems.find(i => i.view === currentView)?.label || 'Dashboard'}
            </h2>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default HQDashboard;

export enum View {
  HOME,
  MENU,
  TRACKING,
  PAYMENT,
}

export enum HQView {
  OVERVIEW,
  RESTAURANTS,
  REPORTS,
  BILLING,
  AUDIT_LOGS,
  ADMINS,
}

export enum RestaurantView {
    DASHBOARD,
    ORDERS,
    KITCHEN,
    CASHIER,
    MENU_BUILDER,
    STAFF,
    REPORTS,
    SETTINGS
}

export enum StaffRole {
    ADMIN = 'Admin',
    SERVER = 'Server',
    KITCHEN = 'Kitchen Staff',
    CASHIER = 'Cashier'
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  distance: string;
  imageUrl: string;
  logoUrl: string;
  status: 'active' | 'disabled';
  createdAt: string;
  subscription: 'basic' | 'premium' | 'enterprise';
  theme: {
    welcomeMessage: string;
    primaryColor: string;
    dailySpecial?: {
      title: string;
      description: string;
      active: boolean;
    };
  };
}

export type MenuItemCategory = 'Starters' | 'Mains' | 'Desserts' | 'Drinks';

export type MenuItemTag = 'vegetarian' | 'spicy' | 'gluten-free' | 'new';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: MenuItemCategory;
  tags: MenuItemTag[];
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type OrderStatus = 'Received' | 'Preparing' | 'On Route' | 'Served' | 'Paid' | 'Verified';

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export interface OrderContext {
  orderType: OrderType;
  orderName: string;
  tableNumber?: number;
  deliveryAddress?: string;
}

export interface Order extends OrderContext {
    id: string;
    restaurant: Restaurant;
    items: CartItem[];
    total: number;
    status: OrderStatus;
}

export interface AiRecommendation {
    starter: { name: string; reasoning: string };
    main: { name: string; reasoning: string };
    drink: { name: string; reasoning: string };
    overallReasoning: string;
}

export interface HQMetrics {
  totalRestaurants: number;
  activeRestaurants: number;
  totalOrders: number;
  totalRevenue: number;
  openIssues: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export interface StaffMember {
    id: string;
    name: string;
    role: StaffRole;
    pin: string; // for login
    restaurantId: string;
    status: 'active' | 'suspended';
}

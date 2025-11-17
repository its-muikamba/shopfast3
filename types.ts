export enum View {
  HOME,
  MENU,
  TRACKING,
  PAYMENT,
}

export enum Tab {
  HOME,
  DISCOVER,
  ORDER,
  PROFILE,
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
    SETTINGS,
    TABLE_MANAGEMENT,
    DELIVERIES,
}

export enum StaffRole {
    ADMIN = 'Admin',
    SERVER = 'Server',
    KITCHEN = 'Kitchen Staff',
    CASHIER = 'Cashier'
}

export interface User {
  id: string;
  name: string;
  email: string;
  orderHistory: string[]; // Array of order IDs
}

export interface PaymentProviderSettings {
    enabled: boolean;
    [key: string]: any; // for credentials
}

export interface PaymentSettings {
    stripe: PaymentProviderSettings & { publicKey?: string; secretKey?: string; };
    mpesa: PaymentProviderSettings & { shortCode?: string; consumerKey?: string; consumerSecret?: string; };
    pesapal: PaymentProviderSettings & { consumerKey?: string; consumerSecret?: string; };
}

export type IconName = 'HandIcon' | 'ReceiptIcon' | 'BellIcon';

export interface ServiceRequest {
    id: string;
    label: string;
    icon: IconName;
}

export interface Table {
    id: string;
    number: number;
    capacity: number;
    status: 'available' | 'occupied' | 'needs-attention';
    orderCount: number;
}

export interface DeliveryConfig {
    enabledByAdmin: boolean;
    deliveryFee: number;
    deliveryRadius: number; // in miles/km
    estimatedTime: number; // in minutes
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
  nextBillingDate: string;
  paymentSettings: PaymentSettings;
  deliveryConfig: DeliveryConfig;
  categories: string[];
  tables: Table[];
  serviceRequests: ServiceRequest[];
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

export type MenuItemCategory = string;

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

export type OrderStatus = 'Pending' | 'Received' | 'Preparing' | 'On Route' | 'Out for Delivery' | 'Served' | 'Paid' | 'Verified' | 'Delivered';

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
    preparationTime?: number; // in minutes
    acceptedAt?: number; // timestamp
    userId?: string;
}

export interface LiveOrder extends OrderContext {
    id: string;
    restaurantId: string;
    items: CartItem[];
    total: number;
    status: OrderStatus;
    preparationTime?: number;
    acceptedAt?: number;
    userId?: string;
}

export interface ServerAlert {
    id: string;
    restaurantId: string;
    tableNumber: number;
    request: string; // e.g., "Requesting Waiter"
    timestamp: number;
}


export interface AiRecommendation {
    starter: { name: string; reasoning: string };
    main: { name: string; reasoning: string };
    drink: { name: string; reasoning: string };
    overallReasoning: string;
}

export interface GeneralAiSuggestion {
    title: string;
    description: string;
}

export interface GeneralAiRecommendation {
    suggestions: GeneralAiSuggestion[];
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

// Analytics Types
export interface ReportMetrics {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    abandonedCarts: number;
    abandonedCartValue: number;
}

export interface HourlyActivity {
    hour: string; // "9am", "10am", etc.
    orders: number;
}

export interface PopularItem {
    id: string;
    name: string;
    orderCount: number;
}

export interface RestaurantReportData {
    metrics: ReportMetrics;
    hourlyActivity: HourlyActivity[];
    popularItems: PopularItem[];
}

// HQ Billing and Support Types
export interface BillingHistory {
    id: string;
    restaurantId: string;
    date: string;
    amount: number;
    status: 'paid' | 'failed';
    invoiceId: string;
}

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type TicketPriority = 'high' | 'medium' | 'low';

export interface SupportTicket {
    id: string;
    restaurantId: string;
    restaurantName: string;
    subject: string;
    priority: TicketPriority;
    status: TicketStatus;
    createdAt: string;
    conversation: {
        author: string;
        timestamp: string;
        message: string;
    }[];
}
import { Restaurant, MenuItem, HQMetrics, AuditLog, StaffMember, StaffRole, Order } from './types';

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'The Golden Spoon',
    cuisine: 'Italian',
    rating: 4.8,
    distance: '0.5 miles',
    imageUrl: 'https://picsum.photos/seed/restaurant1/800/600',
    logoUrl: 'https://picsum.photos/seed/logo1/200/200',
    status: 'active',
    createdAt: '2023-10-26',
    subscription: 'premium',
    theme: {
      welcomeMessage: 'Experience the taste of authentic Italian cuisine!',
      primaryColor: '#C5A052',
      dailySpecial: {
        title: "Chef's Special: Truffle Risotto",
        description: "A creamy risotto infused with black truffle oil and topped with fresh parmesan.",
        active: true
      }
    }
  },
  {
    id: 'r2',
    name: 'Emerald Garden',
    cuisine: 'Asian Fusion',
    rating: 4.6,
    distance: '1.2 miles',
    imageUrl: 'https://picsum.photos/seed/restaurant2/800/600',
    logoUrl: 'https://picsum.photos/seed/logo2/200/200',
    status: 'active',
    createdAt: '2023-09-15',
    subscription: 'premium',
    theme: {
      welcomeMessage: 'A culinary journey through Asia.',
      primaryColor: '#1BAE89',
      dailySpecial: {
        title: "Today's Special: Dragon Roll",
        description: "Eel and cucumber topped with avocado, tobiko, and eel sauce.",
        active: true
      }
    }
  },
  {
    id: 'r3',
    name: 'The Rustic Table',
    cuisine: 'American',
    rating: 4.5,
    distance: '2.0 miles',
    imageUrl: 'https://picsum.photos/seed/restaurant3/800/600',
    logoUrl: 'https://picsum.photos/seed/logo3/200/200',
    status: 'disabled',
    createdAt: '2023-11-01',
    subscription: 'basic',
    theme: {
      welcomeMessage: 'Hearty meals, just like home.',
      primaryColor: '#b91c1c',
      dailySpecial: {
        title: "Weekend Deal: BBQ Ribs",
        description: "Full rack of slow-cooked pork ribs with our signature BBQ sauce.",
        active: false
      }
    }
  },
   {
    id: 'r4',
    name: 'Aqua Blue',
    cuisine: 'Seafood',
    rating: 4.9,
    distance: '0.8 miles',
    imageUrl: 'https://picsum.photos/seed/restaurant4/800/600',
    logoUrl: 'https://picsum.photos/seed/logo4/200/200',
    status: 'active',
    createdAt: '2023-08-05',
    subscription: 'enterprise',
    theme: {
      welcomeMessage: 'The freshest catch in town, served daily.',
      primaryColor: '#58A9E0',
      dailySpecial: {
        title: "Catch of the Day: Grilled Swordfish",
        description: "Served with a lemon-caper sauce and roasted vegetables.",
        active: true
      }
    }
  },
];

export const MENUS: Record<string, MenuItem[]> = {
  r1: [
    { id: 'm1-s1', name: 'Bruschetta', description: 'Grilled bread with tomatoes, garlic, and basil.', price: 8.50, imageUrl: 'https://picsum.photos/seed/item1/400/300', category: 'Starters', tags: ['vegetarian'] },
    { id: 'm1-s2', name: 'Calamari Fritti', description: 'Lightly fried squid with marinara sauce.', price: 12.00, imageUrl: 'https://picsum.photos/seed/item2/400/300', category: 'Starters', tags: [] },
    { id: 'm1-m1', name: 'Spaghetti Carbonara', description: 'Pasta with eggs, cheese, pancetta, and pepper.', price: 18.00, imageUrl: 'https://picsum.photos/seed/item3/400/300', category: 'Mains', tags: [] },
    { id: 'm1-m2', name: 'Margherita Pizza', description: 'Classic pizza with tomatoes, mozzarella, and basil.', price: 15.00, imageUrl: 'https://picsum.photos/seed/item4/400/300', category: 'Mains', tags: ['vegetarian', 'new'] },
    { id: 'm1-d1', name: 'Tiramisu', description: 'Coffee-flavoured Italian dessert.', price: 9.00, imageUrl: 'https://picsum.photos/seed/item5/400/300', category: 'Desserts', tags: [] },
    { id: 'm1-k1', name: 'Espresso', description: 'Strong Italian coffee.', price: 3.00, imageUrl: 'https://picsum.photos/seed/item6/400/300', category: 'Drinks', tags: [] },
    { id: 'm1-k2', name: 'Red Wine', description: 'Glass of house Chianti.', price: 7.00, imageUrl: 'https://picsum.photos/seed/item7/400/300', category: 'Drinks', tags: [] },
  ],
  r2: [
    { id: 'm2-s1', name: 'Spring Rolls', description: 'Crispy rolls with vegetables.', price: 7.00, imageUrl: 'https://picsum.photos/seed/item8/400/300', category: 'Starters', tags: ['vegetarian'] },
    { id: 'm2-m1', name: 'Pad Thai', description: 'Stir-fried rice noodles with shrimp.', price: 16.50, imageUrl: 'https://picsum.photos/seed/item9/400/300', category: 'Mains', tags: ['spicy'] },
    { id: 'm2-d1', name: 'Mango Sticky Rice', description: 'Sweet sticky rice with fresh mango.', price: 8.00, imageUrl: 'https://picsum.photos/seed/item10/400/300', category: 'Desserts', tags: ['gluten-free'] },
    { id: 'm2-k1', name: 'Thai Iced Tea', description: 'Sweet and creamy black tea.', price: 4.50, imageUrl: 'https://picsum.photos/seed/item11/400/300', category: 'Drinks', tags: [] },
  ],
  r3: [
    { id: 'm3-s1', name: 'Onion Rings', description: 'Classic battered onion rings.', price: 9.00, imageUrl: 'https://picsum.photos/seed/item12/400/300', category: 'Starters', tags: ['vegetarian'] },
    { id: 'm3-m1', name: 'Classic Burger', description: 'Beef patty, lettuce, tomato, and cheese.', price: 17.00, imageUrl: 'https://picsum.photos/seed/item13/400/300', category: 'Mains', tags: [] },
    { id: 'm3-d1', name: 'Apple Pie', description: 'Warm apple pie with a scoop of vanilla ice cream.', price: 7.50, imageUrl: 'https://picsum.photos/seed/item14/400/300', category: 'Desserts', tags: [] },
    { id: 'm3-k1', name: 'Craft Beer', description: 'Local IPA.', price: 8.00, imageUrl: 'https://picsum.photos/seed/item15/400/300', category: 'Drinks', tags: [] },
  ],
  r4: [
    { id: 'm4-s1', name: 'Oysters', description: 'Half a dozen fresh oysters.', price: 18.00, imageUrl: 'https://picsum.photos/seed/item16/400/300', category: 'Starters', tags: ['new'] },
    { id: 'm4-m1', name: 'Grilled Salmon', description: 'Served with asparagus and lemon.', price: 25.00, imageUrl: 'https://picsum.photos/seed/item17/400/300', category: 'Mains', tags: ['gluten-free'] },
    { id: 'm4-d1', name: 'Key Lime Pie', description: 'Tangy and sweet.', price: 8.50, imageUrl: 'https://picsum.photos/seed/item18/400/300', category: 'Desserts', tags: [] },
    { id: 'm4-k1', name: 'White Wine', description: 'Glass of Sauvignon Blanc.', price: 9.00, imageUrl: 'https://picsum.photos/seed/item19/400/300', category: 'Drinks', tags: [] },
  ],
};


export const HQ_METRICS: HQMetrics = {
    totalRestaurants: 104,
    activeRestaurants: 98,
    totalOrders: 12593,
    totalRevenue: 314825.75,
    openIssues: 12,
};

export const AUDIT_LOGS: AuditLog[] = [
    { id: 'log1', timestamp: '2023-11-20 14:30:15', actor: 'HQ Admin', action: 'CREATE_TENANT', details: 'Created new restaurant tenant: "The Spicy Spoon"' },
    { id: 'log2', timestamp: '2023-11-20 13:05:00', actor: 'System', action: 'BILLING_SUCCESS', details: 'Subscription payment for "Emerald Garden" successful.' },
    { id: 'log3', timestamp: '2023-11-20 11:45:22', actor: 'HQ Admin', action: 'DISABLE_TENANT', details: 'Disabled restaurant tenant: "The Rustic Table"' },
    { id: 'log4', timestamp: '2023-11-19 18:00:00', actor: 'System', action: 'REPORT_GENERATED', details: 'Generated monthly revenue report.' },
];

export const STAFF_MEMBERS: StaffMember[] = [
    { id: 's1', name: 'Gilbert Kareri', role: StaffRole.ADMIN, pin: '1234', restaurantId: 'r1', status: 'active' },
    { id: 's5', name: 'Diana', role: StaffRole.ADMIN, pin: '4321', restaurantId: 'r2', status: 'active' },
    { id: 's6', name: 'Charles Xavier', role: StaffRole.ADMIN, pin: '1122', restaurantId: 'r4', status: 'active'},
];

export const ACTIVE_ORDERS: Omit<Order, 'restaurant'>[] = [
    { id: 'ORD-101', tableNumber: 5, items: [{...MENUS.r1[0], quantity: 1}, {...MENUS.r1[2], quantity: 1}], total: 26.50, status: 'Received' },
    { id: 'ORD-102', tableNumber: 12, items: [{...MENUS.r1[1], quantity: 2}], total: 24.00, status: 'Received' },
    { id: 'ORD-103', tableNumber: 8, items: [{...MENUS.r1[3], quantity: 1}, {...MENUS.r1[6], quantity: 2}], total: 29.00, status: 'Preparing' },
    { id: 'ORD-104', tableNumber: 3, items: [{...MENUS.r1[4], quantity: 1}], total: 9.00, status: 'On Route' },
];
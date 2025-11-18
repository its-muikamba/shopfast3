import { Restaurant, MenuItem, HQMetrics, AuditLog, StaffMember, StaffRole, LiveOrder, RestaurantReportData, BillingHistory, SupportTicket, Currency, Review } from './types';

export const CURRENCIES: Currency[] = [
  { code: 'KES', symbol: 'Ksh' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
];

export const defaultPaymentSettings = {
    stripe: { enabled: false, publicKey: '', secretKey: '' },
    mpesa: { enabled: false, shortCode: '', consumerKey: '', consumerSecret: '' },
    pesapal: { enabled: false, consumerKey: '', consumerSecret: '' }
};

const defaultTables = Array.from({ length: 12 }, (_, i) => ({
    id: `t${i + 1}`,
    number: i + 1,
    capacity: (i % 3 === 0) ? 6 : (i % 2 === 0 ? 4 : 2),
    status: 'available' as 'available' | 'occupied' | 'needs-attention',
    orderCount: 0,
}));

const defaultServiceRequests = [
    { id: 'sr1', label: 'Request Waiter', icon: 'HandIcon' as 'HandIcon' },
    { id: 'sr2', label: 'Request Bill', icon: 'ReceiptIcon' as 'ReceiptIcon' },
    { id: 'sr3', label: 'General Assistance', icon: 'BellIcon' as 'BellIcon' },
];

const MOCK_REVIEWS_R1: Review[] = [
    { id: 'rev1', userId: 'u1', userName: 'Gilbert', rating: 5, comment: 'Absolutely fantastic! The Carbonara was the best I have ever had. Great atmosphere and friendly staff.', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000 },
    { id: 'rev2', userId: 'u2', userName: 'Diana', rating: 4, comment: 'Lovely place for a date night. The Tiramisu was divine. Service was a little slow, but it was a busy Saturday.', timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    { id: 'rev3', userId: 'u3', userName: 'Charles', rating: 5, comment: 'A true gem. The pizza was authentic and delicious. Will definitely be back!', timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000 },
];

const MOCK_REVIEWS_R2: Review[] = [
     { id: 'rev4', userId: 'u1', userName: 'Gilbert', rating: 4, comment: 'Great Pad Thai, very flavorful. The ambiance is nice and modern.', timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
     { id: 'rev5', userId: 'u2', userName: 'Diana', rating: 5, comment: 'The sushi is so fresh! The Dragon Roll was a highlight. Highly recommend this place.', timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000 },
];

const calculateAverageRating = (reviews: Review[]): number => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return parseFloat((total / reviews.length).toFixed(1));
};

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'The Golden Spoon',
    cuisine: 'Italian',
    rating: calculateAverageRating(MOCK_REVIEWS_R1),
    distance: '0.5 miles',
    imageUrl: 'https://picsum.photos/seed/restaurant1/800/600',
    logoUrl: 'https://picsum.photos/seed/logo1/200/200',
    status: 'active',
    createdAt: '2023-10-26',
    subscription: 'premium',
    nextBillingDate: '2024-07-26',
    currency: { code: 'KES', symbol: 'Ksh' },
    categories: ['Starters', 'Mains', 'Desserts', 'Drinks'],
    tables: defaultTables,
    serviceRequests: defaultServiceRequests,
    reviews: MOCK_REVIEWS_R1,
    paymentSettings: {
        stripe: { enabled: true, publicKey: 'pk_test_demo', secretKey: 'sk_test_demo' },
        mpesa: { enabled: true, shortCode: '123456', consumerKey: 'mpesa_key', consumerSecret: 'mpesa_secret' },
        pesapal: { enabled: false, consumerKey: '', consumerSecret: '' }
    },
    deliveryConfig: {
        enabledByAdmin: true,
        deliveryFee: 5.00,
        deliveryRadius: 5,
        estimatedTime: 30,
    },
    theme: {
      welcomeMessage: 'Experience the taste of authentic Italian cuisine!',
      primaryColor: '#f2b154',
      specials: [
        {
          id: 'r1s1',
          title: "Chef's Special: Truffle Risotto",
          description: "A creamy risotto infused with black truffle oil and topped with fresh parmesan.",
          active: true,
          mediaUrl: 'https://images.unsplash.com/photo-1548943487-a2e4e64b4859?q=80&w=1974&auto=format&fit=crop',
          mediaType: 'image',
        },
        {
          id: 'r1s2',
          title: "Live Music Saturdays",
          description: "Enjoy live jazz music every Saturday from 7 PM to 10 PM.",
          active: true,
          mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop',
          mediaType: 'image',
        },
      ],
    }
  },
  {
    id: 'r2',
    name: 'Emerald Garden',
    cuisine: 'Asian Fusion',
    rating: calculateAverageRating(MOCK_REVIEWS_R2),
    distance: '1.2 miles',
    imageUrl: 'https://picsum.photos/seed/restaurant2/800/600',
    logoUrl: 'https://picsum.photos/seed/logo2/200/200',
    status: 'active',
    createdAt: '2023-09-15',
    subscription: 'premium',
    nextBillingDate: '2024-07-15',
    currency: { code: 'KES', symbol: 'Ksh' },
    categories: ['Appetizers', 'Main Courses', 'Sushi', 'Beverages'],
    tables: defaultTables,
    serviceRequests: defaultServiceRequests,
    reviews: MOCK_REVIEWS_R2,
    paymentSettings: {
        stripe: { enabled: true, publicKey: 'pk_test_demo2', secretKey: 'sk_test_demo2' },
        mpesa: { enabled: false, shortCode: '', consumerKey: '', consumerSecret: '' },
        pesapal: { enabled: false, consumerKey: '', consumerSecret: '' }
    },
    deliveryConfig: {
        enabledByAdmin: false, // Admin has not enabled it yet
        deliveryFee: 4.50,
        deliveryRadius: 3,
        estimatedTime: 25,
    },
    theme: {
      welcomeMessage: 'A culinary journey through Asia.',
      primaryColor: '#f2b154',
      specials: [
        {
          id: 'r2s1',
          title: "Today's Special: Dragon Roll",
          description: "Eel and cucumber topped with avocado, tobiko, and eel sauce.",
          active: true,
          mediaUrl: 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?q=80&w=2070&auto=format&fit=crop',
          mediaType: 'image',
        }
      ],
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
    subscription: 'basic', // Basic tier does not get delivery
    nextBillingDate: '2024-08-01',
    currency: { code: 'USD', symbol: '$' },
    categories: ['Starters', 'Burgers & Sandwiches', 'Desserts', 'Drinks'],
    tables: defaultTables,
    serviceRequests: defaultServiceRequests,
    reviews: [],
    paymentSettings: defaultPaymentSettings,
    deliveryConfig: {
        enabledByAdmin: false,
        deliveryFee: 0,
        deliveryRadius: 0,
        estimatedTime: 0,
    },
    theme: {
      welcomeMessage: 'Hearty meals, just like home.',
      primaryColor: '#f2b154',
      specials: [
         {
          id: 'r3s1',
          title: "Weekend Deal: BBQ Ribs",
          description: "Full rack of slow-cooked pork ribs with our signature BBQ sauce.",
          active: false
        }
      ],
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
    nextBillingDate: '2024-07-05',
    currency: { code: 'KES', symbol: 'Ksh' },
    categories: ['Oysters & Raw Bar', 'Main Catch', 'Sides', 'Wine List'],
    tables: defaultTables,
    serviceRequests: defaultServiceRequests,
    reviews: [],
    paymentSettings: defaultPaymentSettings,
    deliveryConfig: {
        enabledByAdmin: true,
        deliveryFee: 7.50,
        deliveryRadius: 10,
        estimatedTime: 40,
    },
    theme: {
      welcomeMessage: 'The freshest catch in town, served daily.',
      primaryColor: '#f2b154',
      specials: [
        {
          id: 'r4s1',
          title: "Catch of the Day: Grilled Swordfish",
          description: "Served with a lemon-caper sauce and roasted vegetables.",
          active: true,
          mediaUrl: 'https://images.unsplash.com/photo-1622234033983-e1a53a0b5b13?q=80&w=1932&auto=format&fit=crop',
          mediaType: 'image'
        },
         {
          id: 'r4s2',
          title: "Behind the Scenes",
          description: "Watch our chefs masterfully prepare your meals.",
          active: true,
          mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-kitchen-of-a-restaurant-4447-large.mp4',
          mediaType: 'video'
        }
      ]
    }
  },
];

export const MENUS: Record<string, MenuItem[]> = {
  r1: [
    { id: 'm1-s1', name: 'Bruschetta', description: 'Grilled bread with tomatoes, garlic, and basil.', price: 8.50, imageUrl: 'https://picsum.photos/seed/item1/400/300', category: 'Starters', tags: ['vegetarian'], status: 'active' },
    { id: 'm1-s2', name: 'Calamari Fritti', description: 'Lightly fried squid with marinara sauce.', price: 12.00, imageUrl: 'https://picsum.photos/seed/item2/400/300', category: 'Starters', tags: [], status: 'active' },
    { id: 'm1-m1', name: 'Spaghetti Carbonara', description: 'Pasta with eggs, cheese, pancetta, and pepper.', price: 18.00, imageUrl: 'https://picsum.photos/seed/item3/400/300', category: 'Mains', tags: [], status: 'active' },
    { id: 'm1-m2', name: 'Margherita Pizza', description: 'Classic pizza with tomatoes, mozzarella, and basil.', price: 15.00, imageUrl: 'https://picsum.photos/seed/item4/400/300', category: 'Mains', tags: ['vegetarian', 'new'], status: 'active' },
    { id: 'm1-d1', name: 'Tiramisu', description: 'Coffee-flavoured Italian dessert.', price: 9.00, imageUrl: 'https://picsum.photos/seed/item5/400/300', category: 'Desserts', tags: [], status: 'active' },
    { id: 'm1-k1', name: 'Espresso', description: 'Strong Italian coffee.', price: 3.00, imageUrl: 'https://picsum.photos/seed/item6/400/300', category: 'Drinks', tags: [], status: 'active' },
    { id: 'm1-k2', name: 'Red Wine', description: 'Glass of house Chianti.', price: 7.00, imageUrl: 'https://picsum.photos/seed/item7/400/300', category: 'Drinks', tags: [], status: 'active' },
  ],
  r2: [
    { id: 'm2-s1', name: 'Spring Rolls', description: 'Crispy rolls with vegetables.', price: 7.00, imageUrl: 'https://picsum.photos/seed/item8/400/300', category: 'Appetizers', tags: ['vegetarian'], status: 'active' },
    { id: 'm2-m1', name: 'Pad Thai', description: 'Stir-fried rice noodles with shrimp.', price: 16.50, imageUrl: 'https://picsum.photos/seed/item9/400/300', category: 'Main Courses', tags: ['spicy'], status: 'active' },
    { id: 'm2-d1', name: 'Mango Sticky Rice', description: 'Sweet sticky rice with fresh mango.', price: 8.00, imageUrl: 'https://picsum.photos/seed/item10/400/300', category: 'Sushi', tags: ['gluten-free'], status: 'active' },
    { id: 'm2-k1', name: 'Thai Iced Tea', description: 'Sweet and creamy black tea.', price: 4.50, imageUrl: 'https://picsum.photos/seed/item11/400/300', category: 'Beverages', tags: [], status: 'active' },
  ],
  r3: [
    { id: 'm3-s1', name: 'Onion Rings', description: 'Classic battered onion rings.', price: 9.00, imageUrl: 'https://picsum.photos/seed/item12/400/300', category: 'Starters', tags: ['vegetarian'], status: 'active' },
    { id: 'm3-m1', name: 'Classic Burger', description: 'Beef patty, lettuce, tomato, and cheese.', price: 17.00, imageUrl: 'https://picsum.photos/seed/item13/400/300', category: 'Burgers & Sandwiches', tags: [], status: 'active' },
    { id: 'm3-d1', name: 'Apple Pie', description: 'Warm apple pie with a scoop of vanilla ice cream.', price: 7.50, imageUrl: 'https://picsum.photos/seed/item14/400/300', category: 'Desserts', tags: [], status: 'active' },
    { id: 'm3-k1', name: 'Craft Beer', description: 'Local IPA.', price: 8.00, imageUrl: 'https://picsum.photos/seed/item15/400/300', category: 'Drinks', tags: [], status: 'active' },
  ],
  r4: [
    { id: 'm4-s1', name: 'Oysters', description: 'Half a dozen fresh oysters.', price: 18.00, imageUrl: 'https://picsum.photos/seed/item16/400/300', category: 'Oysters & Raw Bar', tags: ['new'], status: 'active' },
    { id: 'm4-m1', name: 'Grilled Salmon', description: 'Served with asparagus and lemon.', price: 25.00, imageUrl: 'https://picsum.photos/seed/item17/400/300', category: 'Main Catch', tags: ['gluten-free'], status: 'active' },
    { id: 'm4-d1', name: 'Key Lime Pie', description: 'Tangy and sweet.', price: 8.50, imageUrl: 'https://picsum.photos/seed/item18/400/300', category: 'Sides', tags: [], status: 'active' },
    { id: 'm4-k1', name: 'White Wine', description: 'Glass of Sauvignon Blanc.', price: 9.00, imageUrl: 'https://picsum.photos/seed/item19/400/300', category: 'Wine List', tags: [], status: 'active' },
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

export const INITIAL_ACTIVE_ORDERS: LiveOrder[] = [
    { id: 'ORD-101', restaurantId: 'r1', tableNumber: 5, items: [{...MENUS.r1[0], quantity: 1}, {...MENUS.r1[2], quantity: 1}], total: 26.50, status: 'Served', orderType: 'dine-in', orderName: 'Gilbert', userId: 'u1', isReviewed: false, paymentStatus: 'paid' },
    { id: 'ORD-102', restaurantId: 'r2', tableNumber: 12, items: [{...MENUS.r2[1], quantity: 2}], total: 33.00, status: 'Served', orderType: 'dine-in', orderName: 'Gilbert', userId: 'u1', isReviewed: true, paymentStatus: 'paid' },
    { id: 'ORD-103', restaurantId: 'r1', tableNumber: 8, items: [{...MENUS.r1[3], quantity: 1}, {...MENUS.r1[6], quantity: 2}], total: 29.00, status: 'Preparing', orderType: 'dine-in', orderName: 'Diana', acceptedAt: Date.now() - (1000 * 60 * 3), preparationTime: 15 },
    { id: 'ORD-104', restaurantId: 'r1', tableNumber: 3, items: [{...MENUS.r1[4], quantity: 1}], total: 9.00, status: 'On Route', orderType: 'dine-in', orderName: 'Charles', acceptedAt: Date.now() - (1000 * 60 * 10), preparationTime: 10, userId: 'u1' },
];

export const RESTAURANT_REPORTS: Record<string, RestaurantReportData> = {
    'r1': {
        metrics: {
            totalRevenue: 4520.50,
            totalOrders: 180,
            totalCustomers: 155,
            averageOrderValue: 25.11,
            abandonedCarts: 25,
            abandonedCartValue: 312.75,
        },
        hourlyActivity: [
            { hour: '11am', orders: 15 },
            { hour: '12pm', orders: 25 },
            { hour: '1pm', orders: 30 },
            { hour: '2pm', orders: 20 },
            { hour: '6pm', orders: 28 },
            { hour: '7pm', orders: 40 },
            { hour: '8pm', orders: 22 },
        ],
        popularItems: [
            { id: 'm1-m1', name: 'Spaghetti Carbonara', orderCount: 75 },
            { id: 'm1-m2', name: 'Margherita Pizza', orderCount: 62 },
            { id: 'm1-s2', name: 'Calamari Fritti', orderCount: 55 },
            { id: 'm1-d1', name: 'Tiramisu', orderCount: 40 },
            { id: 'm1-s1', name: 'Bruschetta', orderCount: 35 },
        ]
    },
    'r2': {
        metrics: {
            totalRevenue: 3890.00,
            totalOrders: 150,
            totalCustomers: 120,
            averageOrderValue: 25.93,
            abandonedCarts: 18,
            abandonedCartValue: 240.50,
        },
        hourlyActivity: [
            { hour: '12pm', orders: 28 },
            { hour: '1pm', orders: 35 },
            { hour: '6pm', orders: 32 },
            { hour: '7pm', orders: 45 },
            { hour: '8pm', orders: 10 },
        ],
        popularItems: [
            { id: 'm2-m1', name: 'Pad Thai', orderCount: 88 },
            { id: 'm2-s1', name: 'Spring Rolls', orderCount: 70 },
            { id: 'm2-k1', name: 'Thai Iced Tea', orderCount: 65 },
            { id: 'm2-d1', name: 'Mango Sticky Rice', orderCount: 50 },
        ]
    }
};

export const BILLING_HISTORY: BillingHistory[] = [
    { id: 'bh1', restaurantId: 'r1', date: '2024-06-26', amount: 99.00, status: 'paid', invoiceId: 'INV-001' },
    { id: 'bh2', restaurantId: 'r1', date: '2024-05-26', amount: 99.00, status: 'paid', invoiceId: 'INV-002' },
    { id: 'bh3', restaurantId: 'r2', date: '2024-06-15', amount: 99.00, status: 'paid', invoiceId: 'INV-003' },
    { id: 'bh4', restaurantId: 'r3', date: '2024-07-01', amount: 49.00, status: 'failed', invoiceId: 'INV-004' },
    { id: 'bh5', restaurantId: 'r4', date: '2024-06-05', amount: 199.00, status: 'paid', invoiceId: 'INV-005' },
];

export const SUPPORT_TICKETS: SupportTicket[] = [
    {
        id: 'tkt1',
        restaurantId: 'r2',
        restaurantName: 'Emerald Garden',
        subject: 'Payment gateway issue',
        priority: 'high',
        status: 'open',
        createdAt: '2024-07-02 10:00 AM',
        conversation: [
            { author: 'Emerald Garden', timestamp: '2024-07-02 10:00 AM', message: 'Our Stripe connection is failing. Can you please check?' },
        ]
    },
    {
        id: 'tkt2',
        restaurantId: 'r1',
        restaurantName: 'The Golden Spoon',
        subject: 'How to add a new menu category?',
        priority: 'low',
        status: 'in-progress',
        createdAt: '2024-07-01 03:20 PM',
        conversation: [
            { author: 'The Golden Spoon', timestamp: '2024-07-01 03:20 PM', message: 'We are trying to add a "Specials" category but cannot find the option.' },
            { author: 'HQ Support', timestamp: '2024-07-01 04:00 PM', message: 'Hi there, you can manage this from the "Menu Builder" section. I am assigning this to a support agent to guide you.' },
        ]
    },
    {
        id: 'tkt3',
        restaurantId: 'r4',
        restaurantName: 'Aqua Blue',
        subject: 'QR Code not downloading',
        priority: 'medium',
        status: 'resolved',
        createdAt: '2024-06-30 11:00 AM',
        conversation: [
            { author: 'Aqua Blue', timestamp: '2024-06-30 11:00 AM', message: 'When we click "Download QR" for our tables, nothing happens.' },
            { author: 'HQ Support', timestamp: '2024-06-30 11:30 AM', message: 'We have identified the issue and pushed a fix. Please try again now.' },
            { author: 'Aqua Blue', timestamp: '2024-06-30 11:35 AM', message: 'It works! Thank you.' },
        ]
    },
];
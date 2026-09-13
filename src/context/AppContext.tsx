import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Car,
  Address,
  ServiceItem,
  StoreProduct,
  CartItem,
  AddonProduct,
  ServiceOrder,
  OrderStatus,
  OrderTimelineEvent,
  WalletTransaction,
  Coupon,
  Captain,
  CoverageZone,
  TimeSlotCapacity,
  AppNotification,
  SupportTicket,
  StaticContent,
  UserSubscription,
  ServiceBookingStoreContext
} from '../types';
import {
  INITIAL_CARS,
  INITIAL_ADDRESSES,
  INITIAL_SERVICES,
  INITIAL_PACKAGES,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_ADDONS,
  INITIAL_STORE_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_CAPTAINS,
  INITIAL_ZONES,
  INITIAL_CAPACITY_SLOTS,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STATIC_CONTENT,
  INITIAL_USER_SUBSCRIPTIONS
} from '../data/initialData';

export type AppScreen =
  | 'home'
  | 'category_services'
  | 'packages'
  | 'package_detail'
  | 'subscriptions'
  | 'offers'
  | 'store'
  | 'orders'
  | 'order_detail'
  | 'cart'
  | 'wallet'
  | 'menu'
  | 'cars'
  | 'addresses'
  | 'profile'
  | 'auth'
  | 'booking'
  | 'referral'
  | 'gifts'
  | 'send_gift'
  | 'help'
  | 'support'
  | 'static_page'
  | 'admin'
  | 'settings';

export interface UserProfile {
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  isLoggedIn: boolean;
}

export const CARPET_ORDER_STAGES: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'confirmed', label: 'تم تأكيد الطلب', description: 'تم استلام وتأكيد طلب غسيل السجاد' },
  { status: 'on_the_way', label: 'في الطريق', description: 'المندوب في الطريق إلى موقع العميل' },
  { status: 'arrived', label: 'تم وصول المندوب', description: 'وصل المندوب إلى موقع العميل' },
  { status: 'carpet_received_from_client', label: 'تم الاستلام من العميل', description: 'تم استلام السجاد وفحص المقاسات' },
  { status: 'carpet_delivered_to_laundry', label: 'تم تسليم لمغسلة', description: 'تم تسليم السجاد للمغسلة لبدء الغسيل والتطهير' },
  { status: 'carpet_received_from_laundry', label: 'تم الاستلام من المغسلة', description: 'تم الانتهاء من الغسيل والتعقيم والتغليف والاستلام من المغسلة' },
  { status: 'carpet_on_the_way_delivery', label: 'في الطريق للعميل للتسليم', description: 'المندوب في الطريق للعميل لتسليم السجاد' },
  { status: 'completed', label: 'مكتمل', description: 'تم تسليم السجاد واكتمال الطلب بنجاح' },
];

export const createCarpetTimeline = (currentStatus: OrderStatus = 'confirmed'): OrderTimelineEvent[] => {
  const stageIndex = CARPET_ORDER_STAGES.findIndex(s => s.status === currentStatus);
  const activeIdx = stageIndex >= 0 ? stageIndex : 0;
  const timeNow = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  return CARPET_ORDER_STAGES.map((stage, idx) => ({
    status: stage.status,
    label: stage.label,
    time: idx === 0 ? '08:00 ص' : idx < activeIdx ? 'مكتمل' : idx === activeIdx ? 'الآن' : '--',
    done: idx <= activeIdx,
    notes: stage.description,
  }));
};

/**
 * Validates whether a given subscription package is strictly eligible for the requested service.
 * Enforces rule: No cross-service package usage (e.g. Car wash != Polish != Carpet != AC).
 */
export const isSubscriptionEligibleForService = (
  sub: UserSubscription,
  service: ServiceItem
): boolean => {
  if (sub.status !== 'active' || sub.remainingWashes <= 0) return false;

  // 1. Explicit allowed service IDs
  if (sub.allowedServiceIds && sub.allowedServiceIds.length > 0) {
    return sub.allowedServiceIds.includes(service.id);
  }

  // 2. Explicit single service ID
  if (sub.serviceId) {
    return sub.serviceId === service.id;
  }

  // 3. Category isolation: e.g. cars package cannot be used for carpets or ac
  if (sub.serviceCategory && service.category && sub.serviceCategory !== service.category) {
    return false;
  }

  // 4. Form type isolation: WASH_CAR vs POLISH_CAR vs WASH_CARPET vs WASH_AC
  if (sub.formType && service.formType && sub.formType !== service.formType) {
    return false;
  }

  // 5. Semantic title check for Polish vs Normal wash
  const subName = (sub.planName || '').toLowerCase();
  const srvTitle = (service.title || '').toLowerCase();
  const isPolishService = srvTitle.includes('تلميع') || service.formType === 'POLISH_CAR';
  const isPolishSub = subName.includes('تلميع');

  if (isPolishService && !isPolishSub) return false;
  if (!isPolishService && isPolishSub) return false;

  const isCarpetService = service.category === 'carpets' || service.category === 'carpets_furniture' || service.formType === 'WASH_CARPET';
  const isCarpetSub = subName.includes('سجاد') || sub.serviceCategory === 'carpets';
  if (isCarpetService !== isCarpetSub) return false;

  const isACService = service.category === 'ac' || service.formType === 'WASH_AC';
  const isACSub = subName.includes('مكيف') || sub.serviceCategory === 'ac';
  if (isACService !== isACSub) return false;

  return true;
};

interface AppContextType {
  // Navigation & View Mode
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  navigateToCategoryServices: (categoryId: string) => void;
  activeCategory: 'all' | 'cars' | 'carpets' | 'furniture' | 'carpets_furniture' | 'wash_offers' | string;
  setActiveCategory: (cat: any) => void;
  activeServiceTab: 'services' | 'packages' | 'subscriptions' | 'discounts';
  setActiveServiceTab: (tab: 'services' | 'packages' | 'subscriptions' | 'discounts') => void;
  viewLayout: 'web' | 'mobile_preview';
  setViewLayout: (layout: 'web' | 'mobile_preview') => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;

  // Auth
  user: UserProfile;
  login: (phone: string, name?: string) => void;
  logout: () => void;
  updateProfile: (name: string, phone: string, email?: string) => void;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  deleteAccount: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;

  // User Subscriptions
  userSubscriptions: UserSubscription[];
  renewUserSubscription: (subId: string) => void;
  useSubscriptionWash: (subId: string) => boolean;
  pauseOrResumeSubscription: (subId: string) => void;

  // Cars & Addresses
  cars: Car[];
  selectedCar: Car | null;
  setSelectedCar: (car: Car | null) => void;
  addCar: (car: Omit<Car, 'id'>) => Car;
  deleteCar: (id: string) => void;
  setDefaultCar: (id: string) => void;

  addresses: Address[];
  selectedAddress: Address | null;
  setSelectedAddress: (addr: Address | null) => void;
  addAddress: (addr: Omit<Address, 'id'>) => Address;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Services, Packages, Subscriptions
  services: ServiceItem[];
  packages: ServiceItem[];
  subscriptions: ServiceItem[];
  addons: AddonProduct[];
  addService: (srv: Omit<ServiceItem, 'id'>) => void;
  updateService: (id: string, srv: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;
  toggleServiceActive: (id: string) => void;

  // Package Details Flow
  selectedPackageForDetail: ServiceItem | null;
  isPackageDetailOpen: boolean;
  openPackageDetail: (pkg: ServiceItem) => void;
  closePackageDetail: () => void;
  purchasePackage: (
    pkg: ServiceItem,
    paymentMethod?: 'wallet' | 'card' | 'apple_pay',
    useWallet?: boolean
  ) => { success: boolean; subscription: UserSubscription };

  // Booking Flow
  bookingService: ServiceItem | null;
  setBookingService: (srv: ServiceItem | null) => void;
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
  openBookingModal: (service: ServiceItem) => void;
  closeBookingModal: () => void;
  bookingDate: string;
  setBookingDate: (date: string) => void;
  bookingTimeSlot: string;
  setBookingTimeSlot: (slot: string) => void;
  bookingStep: number;
  setBookingStep: (step: number) => void;
  serviceBookingContext: ServiceBookingStoreContext | null;
  setServiceBookingContext: React.Dispatch<React.SetStateAction<ServiceBookingStoreContext | null>>;
  openStoreForServiceBooking: (step?: number, preferredCategory?: string) => void;
  returnToServiceBooking: () => void;
  exitServiceBookingStoreContext: () => void;
  addStoreProductToBooking: (product: StoreProduct, qty?: number) => void;
  updateStoreProductBookingQuantity: (productId: string, quantity: number) => void;
  bookingAddons: AddonProduct[];
  toggleBookingAddon: (addon: AddonProduct) => void;
  updateBookingAddonQuantity: (addonId: string, quantity: number) => void;
  bookingNotes: string;
  setBookingNotes: (notes: string) => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string; discount: number };
  removeCoupon: () => void;
  useWalletBalance: boolean;
  setUseWalletBalance: (use: boolean) => void;
  createBookingOrder: (
    paymentMethod: 'wallet' | 'moyasar_card' | 'tabby' | 'tamara' | 'package' | 'cash',
    paymentMode?: 'ONE_TIME' | 'PACKAGE',
    selectedSubscriptionId?: string
  ) => ServiceOrder;

  // Store & Cart
  storeProducts: StoreProduct[];
  cart: CartItem[];
  addToCart: (product: StoreProduct, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  addProduct: (prod: Omit<StoreProduct, 'id'>) => void;
  updateProduct: (id: string, prod: Partial<StoreProduct>) => void;
  deleteProduct: (id: string) => void;
  checkoutCart: (paymentMethod: 'wallet' | 'moyasar_card' | 'tabby' | 'tamara') => ServiceOrder;
  requestStoreOrderReturn: (orderId: string, reason: string) => { success: boolean; message: string };

  // Orders
  orders: ServiceOrder[];
  selectedOrderForDetail: ServiceOrder | null;
  setSelectedOrderForDetail: (order: ServiceOrder | null) => void;
  openOrderDetail: (order: ServiceOrder) => void;
  closeOrderDetail: () => void;
  selectedOrderForTracking: ServiceOrder | null;
  setSelectedOrderForTracking: (order: ServiceOrder | null) => void;
  cancelOrder: (orderId: string) => { success: boolean; message: string };
  rateOrder: (orderId: string, stars: number, comment?: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, captainId?: string) => void;
  modifyOrderAdmin: (orderId: string, updates: Partial<ServiceOrder>) => void;
  confirmCarpetInspection: (orderId: string) => void;
  adjustCarpetInspection: (orderId: string, updatedAddons: AddonProduct[], reasonNotes: string) => void;
  payCarpetOrder: (orderId: string, paymentMethod: 'wallet' | 'moyasar_card' | 'tabby' | 'tamara' | 'mixed') => void;
  setCaptainOnDelivery: (orderId: string) => void;
  updateCarpetOrderStatus: (orderId: string, status: OrderStatus, customNotes?: string) => void;

  // Wallet
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  rechargeWallet: (amount: number) => void;
  sendGift: (recipientPhone: string, recipientName: string, giftType: 'amount' | 'package', amount: number, packageItem?: ServiceItem, paymentMethod?: 'credit_card' | 'wallet' | 'apple_pay') => { success: boolean; message: string; giftCode: string };

  // Coupons & Offers
  coupons: Coupon[];
  addCoupon: (c: Omit<Coupon, 'id' | 'usedCount'>) => void;
  updateCoupon: (id: string, c: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;

  // Captains & Zones & Capacity
  captains: Captain[];
  addCaptain: (cap: Omit<Captain, 'id' | 'completedOrdersCount' | 'rating'>) => void;
  updateCaptain: (id: string, cap: Partial<Captain>) => void;
  deleteCaptain: (id: string) => void;
  zones: CoverageZone[];
  addZone: (z: Omit<CoverageZone, 'id'>) => void;
  updateZone: (id: string, z: Partial<CoverageZone>) => void;
  deleteZone: (id: string) => void;
  capacitySlots: TimeSlotCapacity[];
  updateCapacitySlots: (slots: TimeSlotCapacity[]) => void;

  // Notifications & Support & Static CMS
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  sendNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  supportTickets: SupportTicket[];
  addSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => void;
  addTicketMessage: (ticketId: string, text: string, sender?: 'customer' | 'support') => void;
  updateSupportTicketStatus: (id: string, status: 'open' | 'in_review' | 'in_progress' | 'resolved' | 'closed') => void;
  staticContent: StaticContent;
  updateStaticContent: (content: Partial<StaticContent>) => void;

  // Active static page viewer
  activeStaticPageKey: 'about' | 'terms' | 'privacy' | 'faq' | null;
  setActiveStaticPageKey: (key: 'about' | 'terms' | 'privacy' | 'faq' | null) => void;

  // Settings: Notifications & Language
  notificationSettings: {
    enabled: boolean;
    bookings: boolean;
    offers: boolean;
    sms: boolean;
    wallet: boolean;
  };
  setNotificationSettings: React.Dispatch<React.SetStateAction<{
    enabled: boolean;
    bookings: boolean;
    offers: boolean;
    sms: boolean;
    wallet: boolean;
  }>>;
  toggleNotificationSetting: (key: 'enabled' | 'bookings' | 'offers' | 'sms' | 'wallet') => void;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>('cars');
  const [activeCategory, setActiveCategory] = useState<'all' | 'cars' | 'carpets' | 'furniture' | 'carpets_furniture' | 'wash_offers' | string>('all');
  const [activeServiceTab, setActiveServiceTab] = useState<'services' | 'packages' | 'subscriptions' | 'discounts'>('services');

  const navigateToCategoryServices = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setActiveCategory(categoryId);
    setCurrentScreen('category_services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [viewLayout, setViewLayout] = useState<'web' | 'mobile_preview'>('web');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [activeStaticPageKey, setActiveStaticPageKey] = useState<'about' | 'terms' | 'privacy' | 'faq' | null>(null);

  // User Auth
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nixt_user');
    return saved ? JSON.parse(saved) : {
      name: 'شركة ترو فينتشر',
      phone: '966505555555',
      email: 'info@trueventure.sa',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isLoggedIn: true,
    };
  });

  // User Subscriptions
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>(() => {
    const saved = localStorage.getItem('nixt_user_subscriptions');
    return saved ? JSON.parse(saved) : INITIAL_USER_SUBSCRIPTIONS;
  });

  // Language state
  const [language, setLanguageState] = useState<'ar' | 'en'>(() => {
    const saved = localStorage.getItem('nixt_app_language');
    return (saved === 'en' || saved === 'ar') ? saved : 'ar';
  });

  const setLanguage = (lang: 'ar' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('nixt_app_language', lang);
  };

  // Notification toggles state
  const [notificationSettings, setNotificationSettings] = useState<{
    enabled: boolean;
    bookings: boolean;
    offers: boolean;
    sms: boolean;
    wallet: boolean;
  }>(() => {
    const saved = localStorage.getItem('nixt_notification_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      enabled: true,
      bookings: true,
      offers: true,
      sms: false,
      wallet: true,
    };
  });

  useEffect(() => {
    localStorage.setItem('nixt_notification_settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  const toggleNotificationSetting = (key: 'enabled' | 'bookings' | 'offers' | 'sms' | 'wallet') => {
    setNotificationSettings(prev => {
      if (key === 'enabled') {
        const nextEnabled = !prev.enabled;
        return {
          ...prev,
          enabled: nextEnabled,
        };
      }
      return {
        ...prev,
        [key]: !prev[key],
      };
    });
  };

  // Cars
  const [cars, setCars] = useState<Car[]>(() => {
    const saved = localStorage.getItem('nixt_cars');
    return saved ? JSON.parse(saved) : INITIAL_CARS;
  });
  const [selectedCar, setSelectedCar] = useState<Car | null>(() => cars.find(c => c.isDefault) || cars[0] || null);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>(() => {
    const saved = localStorage.getItem('nixt_addresses');
    return saved ? JSON.parse(saved) : INITIAL_ADDRESSES;
  });
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(() => addresses.find(a => a.isDefault) || addresses[0] || null);

  // Services & Products
  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('nixt_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });
  const [packages, setPackages] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('nixt_packages');
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });
  const [subscriptions, setSubscriptions] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('nixt_subscriptions');
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
  });
  const [addons] = useState<AddonProduct[]>(INITIAL_ADDONS);

  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>(() => {
    const saved = localStorage.getItem('nixt_products');
    return saved ? JSON.parse(saved) : INITIAL_STORE_PRODUCTS;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('nixt_cart');
    return saved ? JSON.parse(saved) : [
      { product: INITIAL_STORE_PRODUCTS[0], quantity: 1 },
      { product: INITIAL_STORE_PRODUCTS[1], quantity: 1 },
    ];
  });

  // Booking temporary flow state
  const [bookingService, setBookingService] = useState<ServiceItem | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingDate, setBookingDate] = useState<string>('2026-08-03');
  const [bookingTimeSlot, setBookingTimeSlot] = useState<string>('20:50');
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [serviceBookingContext, setServiceBookingContext] = useState<ServiceBookingStoreContext | null>(null);
  const [bookingAddons, setBookingAddons] = useState<AddonProduct[]>([]);
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [useWalletBalance, setUseWalletBalance] = useState<boolean>(true);

  const openStoreForServiceBooking = (step?: number, preferredCategory?: string, customService?: ServiceItem | null) => {
    const targetStep = step !== undefined ? step : bookingStep;
    if (step !== undefined) {
      setBookingStep(targetStep);
    }
    const currentService = customService || bookingService || services[0];
    if (currentService && !bookingService) {
      setBookingService(currentService);
    }
    setServiceBookingContext({
      isActive: true,
      serviceId: currentService?.id,
      serviceName: currentService?.title || (currentService as any)?.name || 'طلب الخدمة الحالية',
      serviceCategory: currentService?.category,
      bookingStep: targetStep,
      returnScreen: 'booking',
      preferredCategory: preferredCategory || (currentService?.category === 'carpets' || currentService?.category === 'furniture' ? 'carpets' : 'cars'),
    });
    setCurrentScreen('store');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const returnToServiceBooking = () => {
    if (serviceBookingContext?.bookingStep !== undefined) {
      setBookingStep(serviceBookingContext.bookingStep);
    }
    setCurrentScreen('booking');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const exitServiceBookingStoreContext = () => {
    setServiceBookingContext(null);
  };

  const addStoreProductToBooking = (product: StoreProduct, qty: number = 1) => {
    const addonId = `store-${product.id}`;
    setBookingAddons(prev => {
      const existing = prev.find(a => a.id === addonId);
      if (existing) {
        return prev.map(a => a.id === addonId ? { ...a, quantity: (a.quantity || 1) + qty } : a);
      }
      const newAddon: AddonProduct = {
        id: addonId,
        name: product.name,
        description: 'منتج من المتجر (يصل مع الكابتن 🚚)',
        price: product.price,
        quantity: qty,
        image: product.image,
        category: (product.mainCategory === 'carpets' || product.category === 'carpets') ? 'carpets' : 'cars'
      };
      return [...prev, newAddon];
    });
  };

  const updateStoreProductBookingQuantity = (productId: string, quantity: number) => {
    const addonId = `store-${productId}`;
    updateBookingAddonQuantity(addonId, quantity);
  };

  // Package Details Flow State
  const [selectedPackageForDetail, setSelectedPackageForDetail] = useState<ServiceItem | null>(null);
  const [isPackageDetailOpen, setIsPackageDetailOpen] = useState<boolean>(false);

  const openPackageDetail = (pkg: ServiceItem) => {
    setSelectedPackageForDetail(pkg);
    setIsPackageDetailOpen(true);
    setCurrentScreen('package_detail');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closePackageDetail = () => {
    setIsPackageDetailOpen(false);
    if (currentScreen === 'package_detail') {
      setCurrentScreen('packages');
    }
  };

  const purchasePackage = (
    pkg: ServiceItem,
    paymentMethod: 'wallet' | 'card' | 'apple_pay' = 'card',
    useWallet: boolean = false
  ): { success: boolean; subscription: UserSubscription } => {
    const washCount = pkg.id === 'pkg-2' ? 5 : pkg.id === 'pkg-3' ? 8 : 3;
    const price = pkg.price;

    let walletDeducted = 0;
    if (useWallet && walletBalance > 0) {
      walletDeducted = Math.min(walletBalance, price);
      setWalletBalance(prev => prev - walletDeducted);
      const tx: WalletTransaction = {
        id: `tx-pkg-${Date.now()}`,
        transactionNumber: `TX-PKG-${Math.floor(10000 + Math.random() * 90000)}`,
        type: 'payment',
        typeLabel: 'شراء باقة غسيل',
        amount: -walletDeducted,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
        description: `شراء ${pkg.title} (${washCount} غسلات)`,
      };
      setWalletTransactions(prev => [tx, ...prev]);
    }

    const newSub: UserSubscription = {
      id: `sub-${Date.now()}`,
      planName: pkg.title,
      planType: 'package',
      totalWashes: washCount,
      remainingWashes: washCount,
      usedWashes: 0,
      startDate: new Date().toISOString().split('T')[0],
      renewalDate: new Date(Date.now() + (pkg.id === 'pkg-2' ? 60 : pkg.id === 'pkg-3' ? 90 : 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: pkg.price,
      status: 'active',
      features: pkg.includes || []
    };

    setUserSubscriptions(prev => [newSub, ...prev]);

    // Send in-app notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `🎉 تم تفعيل ${pkg.title} بنجاح!`,
      message: `تم إضافة ${washCount} غسلات شاملة إلى حسابك مع الهدايا المجانية، صالحة للاستخدام المباشر.`,
      target: 'customers',
      channel: 'in_app',
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true, subscription: newSub };
  };

  const openBookingModal = (service: ServiceItem) => {
    setBookingService(service);
    setIsBookingModalOpen(true);
    setBookingStep(1);
    setServiceBookingContext(null);
    setCurrentScreen('booking');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setServiceBookingContext(null);
    if (currentScreen === 'booking') {
      setCurrentScreen('home');
    }
  };

  // Orders
  const [orders, setOrders] = useState<ServiceOrder[]>(() => {
    const saved = localStorage.getItem('nixt_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<ServiceOrder | null>(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<ServiceOrder | null>(null);

  const openOrderDetail = (order: ServiceOrder) => {
    setSelectedOrderForDetail(order);
    setCurrentScreen('order_detail');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closeOrderDetail = () => {
    setCurrentScreen('orders');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Wallet
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('nixt_wallet_balance');
    return saved !== null ? parseFloat(saved) : 0.0;
  });
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem('nixt_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('nixt_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  // Admin entities
  const [captains, setCaptains] = useState<Captain[]>(() => {
    const saved = localStorage.getItem('nixt_captains');
    return saved ? JSON.parse(saved) : INITIAL_CAPTAINS;
  });
  const [zones, setZones] = useState<CoverageZone[]>(() => {
    const saved = localStorage.getItem('nixt_zones');
    return saved ? JSON.parse(saved) : INITIAL_ZONES;
  });
  const [capacitySlots, setCapacitySlots] = useState<TimeSlotCapacity[]>(() => {
    const saved = localStorage.getItem('nixt_capacity');
    return saved ? JSON.parse(saved) : INITIAL_CAPACITY_SLOTS;
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('nixt_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('nixt_support');
    return saved ? JSON.parse(saved) : [
      {
        id: 'tkt-1',
        customerName: 'شركة ترو فينتشر',
        customerPhone: '966505555555',
        subject: 'استفسار عن خدمة التلميع السيراميك',
        message: 'هل يتطلب التلميع وجود السيارة في مكان مظلل؟',
        type: 'inquiry',
        status: 'resolved',
        createdAt: '2026-08-01T10:00:00Z',
      }
    ];
  });
  const [staticContent, setStaticContent] = useState<StaticContent>(() => {
    const saved = localStorage.getItem('nixt_static');
    return saved ? JSON.parse(saved) : INITIAL_STATIC_CONTENT;
  });

  // Save to localStorage effects
  useEffect(() => { localStorage.setItem('nixt_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('nixt_cars', JSON.stringify(cars)); }, [cars]);
  useEffect(() => { localStorage.setItem('nixt_addresses', JSON.stringify(addresses)); }, [addresses]);
  useEffect(() => { localStorage.setItem('nixt_services', JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem('nixt_packages', JSON.stringify(packages)); }, [packages]);
  useEffect(() => { localStorage.setItem('nixt_subscriptions', JSON.stringify(subscriptions)); }, [subscriptions]);
  useEffect(() => { localStorage.setItem('nixt_products', JSON.stringify(storeProducts)); }, [storeProducts]);
  useEffect(() => { localStorage.setItem('nixt_user_subscriptions', JSON.stringify(userSubscriptions)); }, [userSubscriptions]);
  useEffect(() => { localStorage.setItem('nixt_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('nixt_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('nixt_wallet_balance', walletBalance.toString()); }, [walletBalance]);
  useEffect(() => { localStorage.setItem('nixt_transactions', JSON.stringify(walletTransactions)); }, [walletTransactions]);
  useEffect(() => { localStorage.setItem('nixt_coupons', JSON.stringify(coupons)); }, [coupons]);
  useEffect(() => { localStorage.setItem('nixt_captains', JSON.stringify(captains)); }, [captains]);
  useEffect(() => { localStorage.setItem('nixt_zones', JSON.stringify(zones)); }, [zones]);
  useEffect(() => { localStorage.setItem('nixt_capacity', JSON.stringify(capacitySlots)); }, [capacitySlots]);
  useEffect(() => { localStorage.setItem('nixt_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('nixt_support', JSON.stringify(supportTickets)); }, [supportTickets]);
  useEffect(() => { localStorage.setItem('nixt_static', JSON.stringify(staticContent)); }, [staticContent]);

  // Auth methods
  const login = (phone: string, name: string = 'العميل الجديد') => {
    setUser({
      name: name || 'عميل نيكست',
      phone,
      email: `${phone}@nixt.sa`,
      isLoggedIn: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    });
    setShowAuthModal(false);
  };

  const logout = () => {
    setUser({ name: '', phone: '', email: '', isLoggedIn: false });
  };

  const updateProfile = (name: string, phone: string, email?: string) => {
    setUser(prev => ({
      ...prev,
      name,
      phone,
      email: email || prev.email || `${phone}@nixt.sa`
    }));
  };

  const changePassword = (oldPass: string, newPass: string) => {
    if (!oldPass || !newPass) {
      return { success: false, message: 'يرجى إدخال كلمة المرور الحالية والجديدة' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'كلمة المرور الجديدة يجب أن تكون 6 خانات أو أكثر' };
    }
    // Simulation
    return { success: true, message: 'تم تحديث كلمة المرور بنجاح وبشكل آمن' };
  };

  const deleteAccount = () => {
    localStorage.removeItem('nixt_user');
    localStorage.removeItem('nixt_cars');
    localStorage.removeItem('nixt_addresses');
    localStorage.removeItem('nixt_user_subscriptions');
    setUser({ name: '', phone: '', isLoggedIn: false });
    setCurrentScreen('home');
  };

  // User Subscription Operations
  const renewUserSubscription = (subId: string) => {
    setUserSubscriptions(prev => prev.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          remainingWashes: s.totalWashes,
          usedWashes: 0,
          status: 'active',
          renewalDate: '2026-10-01'
        };
      }
      return s;
    }));
  };

  const useSubscriptionWash = (subId: string) => {
    let success = false;
    setUserSubscriptions(prev => prev.map(s => {
      if (s.id === subId && s.remainingWashes > 0) {
        success = true;
        return {
          ...s,
          remainingWashes: s.remainingWashes - 1,
          usedWashes: s.usedWashes + 1,
          status: s.remainingWashes - 1 === 0 ? 'expired' : 'active'
        };
      }
      return s;
    }));
    return success;
  };

  const pauseOrResumeSubscription = (subId: string) => {
    setUserSubscriptions(prev => prev.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          status: s.status === 'active' ? 'paused' : 'active'
        };
      }
      return s;
    }));
  };

  // Car methods
  const addCar = (newCar: Omit<Car, 'id'>) => {
    const id = `car-${Date.now()}`;
    const car: Car = { ...newCar, id };
    if (car.isDefault || cars.length === 0) {
      setCars(prev => prev.map(c => ({ ...c, isDefault: false })).concat(car));
      setSelectedCar(car);
    } else {
      setCars(prev => [...prev, car]);
      if (!selectedCar) setSelectedCar(car);
    }
    return car;
  };

  const deleteCar = (id: string) => {
    setCars(prev => prev.filter(c => c.id !== id));
    if (selectedCar?.id === id) {
      setSelectedCar(cars.find(c => c.id !== id) || null);
    }
  };

  const setDefaultCar = (id: string) => {
    setCars(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
    const c = cars.find(item => item.id === id);
    if (c) setSelectedCar(c);
  };

  // Address methods
  const addAddress = (newAddr: Omit<Address, 'id'>) => {
    const id = `addr-${Date.now()}`;
    const addr: Address = { ...newAddr, id };
    if (addr.isDefault || addresses.length === 0) {
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(addr));
      setSelectedAddress(addr);
    } else {
      setAddresses(prev => [...prev, addr]);
      if (!selectedAddress) setSelectedAddress(addr);
    }
    return addr;
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    if (selectedAddress?.id === id) {
      setSelectedAddress(addresses.find(a => a.id !== id) || null);
    }
  };

  const setDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    const a = addresses.find(item => item.id === id);
    if (a) setSelectedAddress(a);
  };

  // Services CRUD
  const addService = (srv: Omit<ServiceItem, 'id'>) => {
    const newSrv: ServiceItem = { ...srv, id: `srv-${Date.now()}` };
    if (srv.type === 'package') {
      setPackages(prev => [...prev, newSrv]);
    } else if (srv.type === 'subscription') {
      setSubscriptions(prev => [...prev, newSrv]);
    } else {
      setServices(prev => [...prev, newSrv]);
    }
  };

  const updateService = (id: string, updates: Partial<ServiceItem>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    setPackages(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    setPackages(prev => prev.filter(s => s.id !== id));
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  const toggleServiceActive = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    setPackages(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  // Store CRUD & Cart
  const addProduct = (prod: Omit<StoreProduct, 'id'>) => {
    const newP: StoreProduct = { ...prod, id: `prod-${Date.now()}` };
    setStoreProducts(prev => [newP, ...prev]);
  };

  const updateProduct = (id: string, prod: Partial<StoreProduct>) => {
    setStoreProducts(prev => prev.map(p => p.id === id ? { ...p, ...prod } : p));
  };

  const deleteProduct = (id: string) => {
    setStoreProducts(prev => prev.filter(p => p.id !== id));
  };

  const addToCart = (product: StoreProduct, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Booking Flow Helpers
  const toggleBookingAddon = (addon: AddonProduct) => {
    setBookingAddons(prev => {
      const exists = prev.some(a => a.id === addon.id);
      if (exists) {
        return prev.filter(a => a.id !== addon.id);
      }
      return [...prev, { ...addon, quantity: 1 }];
    });
  };

  const updateBookingAddonQuantity = (addonId: string, quantity: number) => {
    setBookingAddons(prev => {
      if (quantity <= 0) {
        return prev.filter(a => a.id !== addonId);
      }
      return prev.map(a => a.id === addonId ? { ...a, quantity } : a);
    });
  };

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === clean && c.isActive);
    if (!found) {
      return { success: false, message: 'كود الخصم غير صالح أو منتهي الصلاحية', discount: 0 };
    }
    setAppliedCoupon(found);
    return { success: true, message: `تم تفعيل ${found.title} بنجاح`, discount: found.discountValue };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Wallet Actions
  const rechargeWallet = (amount: number) => {
    if (amount <= 0) return;
    const newBalance = walletBalance + amount;
    setWalletBalance(newBalance);
    const tx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      transactionNumber: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'recharge',
      typeLabel: 'شحن رصيد للمحفظة',
      amount,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      description: 'شحن رصيد إلكتروني عبر بوابة ميسر',
    };
    setWalletTransactions(prev => [tx, ...prev]);
  };

  const sendGift = (
    recipientPhone: string,
    recipientName: string,
    giftType: 'amount' | 'package',
    amount: number,
    packageItem?: ServiceItem,
    paymentMethod: 'credit_card' | 'wallet' | 'apple_pay' = 'credit_card'
  ): { success: boolean; message: string; giftCode: string } => {
    const giftCode = `GIFT-${Math.floor(100000 + Math.random() * 900000)}`;

    if (paymentMethod === 'wallet') {
      if (walletBalance < amount) {
        return { success: false, message: 'رصيد المحفظة الحالي لا يكفي لإرسال الهدية', giftCode: '' };
      }
      setWalletBalance(prev => prev - amount);
    }

    const giftDesc = giftType === 'package' && packageItem
      ? `إهداء ${packageItem.title} إلى (${recipientName || recipientPhone})`
      : `إهداء رصيد بقيمة ${amount.toFixed(2)} ر.س إلى (${recipientName || recipientPhone})`;

    const tx: WalletTransaction = {
      id: `tx-gift-${Date.now()}`,
      transactionNumber: `TX-GFT-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'gift',
      typeLabel: giftType === 'package' ? 'إهداء باقة' : 'إهداء رصيد',
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      description: `${giftDesc} - كود التفعيل: ${giftCode}`,
    };
    setWalletTransactions(prev => [tx, ...prev]);

    // Send notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: giftType === 'package' ? '🎁 تم إرسال باقة كهدية بنجاح' : '🎁 تم إرسال هدية الرصيد بنجاح',
      message: `تم إرسال ${giftType === 'package' ? packageItem?.title : `${amount} ر.س`} إلى ${recipientName || recipientPhone} مع كود الهدية: ${giftCode}`,
      target: 'customers',
      channel: 'in_app',
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true, message: 'تم إرسال الهدية بنجاح!', giftCode };
  };

  // Order Creation (Service Booking)
  const createBookingOrder = (
    paymentMethod: 'wallet' | 'moyasar_card' | 'tabby' | 'tamara' | 'package' | 'cash',
    paymentMode: 'ONE_TIME' | 'PACKAGE' = 'ONE_TIME',
    selectedSubscriptionId?: string
  ): ServiceOrder => {
    if (!bookingService) throw new Error('No active service selected');

    // Check if address is in inactive zone or blocked
    if (selectedAddress?.isBlocked) {
      throw new Error('عذراً، العنوان المحدد يقع خارج نطاق التغطية المباشرة حالياً.');
    }

    const orderNum = `NX-${Math.floor(10000 + Math.random() * 90000)}`;

    // Price calculation with Car Category
    let basePrice = bookingService.price;
    if (selectedCar && bookingService.pricingByCarCategory && bookingService.pricingByCarCategory[selectedCar.category]) {
      basePrice = bookingService.pricingByCarCategory[selectedCar.category];
    }

    // Detect if this is a carpet / furniture cleaning service
    const isCarpet =
      bookingService.category === 'carpets' ||
      bookingService.category === 'carpets_furniture' ||
      bookingService.category === 'furniture' ||
      bookingService.formType === 'WASH_CARPET' ||
      bookingAddons.some(a => a.category === 'carpets' || a.category === 'furniture');

    // Handle PACKAGE payment mode with strict service separation & gift addon exclusion
    let isPackagePayment = paymentMode === 'PACKAGE' || paymentMethod === 'package';
    let matchedSub: UserSubscription | undefined = undefined;

    if (isPackagePayment && selectedSubscriptionId) {
      matchedSub = userSubscriptions.find(s => s.id === selectedSubscriptionId);
      if (!matchedSub) {
        throw new Error('عذراً، الباقة المختارة غير موجودة في حسابك.');
      }

      // Strict Package Separation Check
      if (!isSubscriptionEligibleForService(matchedSub, bookingService)) {
        throw new Error(`عذراً، رصيد باقة (${matchedSub.planName}) مخصص حصرياً لنوع الخدمة المحددة لها، ولا يمكن استخدامه لدفع خدمة "${bookingService.title}".`);
      }

      const used = useSubscriptionWash(selectedSubscriptionId);
      if (!used) {
        throw new Error('عذراً، لا يوجد رصيد غسلات متبقي في هذه الباقة.');
      }
    }

    // Addons calculation: separate free gift addons included in package vs paid addons
    const freeGiftIds = matchedSub?.freeGiftAddonIds || [];
    const paidAddonsTotal = bookingAddons.reduce((sum, a) => {
      const isFreeGift = a.isGift || freeGiftIds.includes(a.id) || a.price === 0;
      if (isPackagePayment && isFreeGift) {
        return sum; // Free gift within package is NOT charged
      }
      return sum + (a.price * (a.quantity || 1));
    }, 0);

    // If package is used, base service price is covered (0 SAR); customer only pays for extra independent addons
    let rawSubtotal = isPackagePayment ? paidAddonsTotal : (basePrice + paidAddonsTotal);

    // Delivery fee rule: from service or default 0
    let deliveryFee = bookingService.deliveryCost ?? 0;
    if (bookingService.freeDeliveryThreshold && rawSubtotal >= bookingService.freeDeliveryThreshold) {
      deliveryFee = 0;
    }

    // Coupon calculation: Applied ONLY to subtotal, NEVER to delivery fee
    let discount = 0;
    if (appliedCoupon && !isPackagePayment) {
      if (appliedCoupon.discountType === 'percentage') {
        discount = (rawSubtotal * appliedCoupon.discountValue) / 100;
      } else {
        discount = appliedCoupon.discountValue;
      }
      // Increment coupon usedCount
      setCoupons(prev => prev.map(c => c.id === appliedCoupon.id ? { ...c, usedCount: c.usedCount + 1 } : c));
    }
    const finalSubtotal = Math.max(0, rawSubtotal - discount);

    // VAT 15% calculation (Saudi standard)
    const finalTotalWithDelivery = finalSubtotal + deliveryFee;
    const vat = Math.round((finalTotalWithDelivery * 0.15) * 100) / 100;
    const preVat = Math.round((finalTotalWithDelivery - vat) * 100) / 100;
    const total = finalTotalWithDelivery;

    // Independent payment logic for extra products / delivery (even if base service is on package)
    let walletDeducted = 0;
    let directPaid = total;
    let actualPaymentMethod: ServiceOrder['paymentMethod'] = isPackagePayment && total === 0 ? 'package' : paymentMethod;

    if (total > 0) {
      if (paymentMethod === 'wallet' || (useWalletBalance && walletBalance > 0)) {
        if (walletBalance >= total) {
          walletDeducted = total;
          directPaid = 0;
          actualPaymentMethod = 'wallet';
          setWalletBalance(prev => prev - total);
          const tx: WalletTransaction = {
            id: `tx-${Date.now()}`,
            transactionNumber: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
            type: 'payment',
            typeLabel: isPackagePayment ? 'سداد المنتجات الإضافية لطلب الباقة' : 'سداد قيمة حجز الخدمة',
            amount: -total,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            status: 'completed',
            orderId: orderNum,
            description: isPackagePayment
              ? `سداد قيمة المنتجات الإضافية للطلب ${orderNum} (الخدمة الأساسية مغطاة بالباقة)`
              : `سداد قيمة ${bookingService.title}`,
          };
          setWalletTransactions(prev => [tx, ...prev]);
        } else if (useWalletBalance && walletBalance > 0) {
          walletDeducted = walletBalance;
          directPaid = total - walletBalance;
          actualPaymentMethod = 'mixed';
          setWalletBalance(0);
          const tx: WalletTransaction = {
            id: `tx-${Date.now()}`,
            transactionNumber: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
            type: 'partial_deduction',
            typeLabel: 'خصم جزئي من المحفظة لسداد طلب',
            amount: -walletDeducted,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            status: 'completed',
            orderId: orderNum,
            description: `خصم جزئي لسداد طلب ${orderNum} والمتبقي (${directPaid.toFixed(2)} ر.س) عبر البطاقة`,
          };
          setWalletTransactions(prev => [tx, ...prev]);
        }
      }
    }

    // Auto-assign captain based on zone
    const availableCaptains = captains.filter(c => c.status === 'active');
    const assignedCaptain = availableCaptains[Math.floor(Math.random() * availableCaptains.length)] || captains[0];

    const newOrderNotes = isPackagePayment && matchedSub
      ? (bookingNotes
          ? `${bookingNotes} [الخدمة الأساسية مغطاة بالباقة: ${matchedSub.planName}]`
          : `الخدمة الأساسية مغطاة بالباقة: ${matchedSub.planName}`)
      : bookingNotes;

    const newOrder: ServiceOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      type: bookingService.type === 'package' ? 'package' : 'service',
      formType: bookingService.formType || (isCarpet ? 'WASH_CARPET' : bookingService.category === 'ac' ? 'WASH_AC' : 'WASH_CAR'),
      productType: 'SERVICE',
      paymentMode: isPackagePayment ? 'PACKAGE' : 'ONE_TIME',
      usedSubscriptionId: selectedSubscriptionId,
      service: bookingService,
      customerName: user.name || 'شركة ترو فينتشر',
      customerPhone: user.phone || '966505555555',
      car: selectedCar || INITIAL_CARS[0],
      address: selectedAddress || INITIAL_ADDRESSES[0],
      date: bookingDate,
      timeSlot: bookingTimeSlot,
      addons: [...bookingAddons],
      notes: newOrderNotes,
      captainId: assignedCaptain?.id,
      captainName: assignedCaptain?.name,
      captainPhone: assignedCaptain?.phone,
      status: isCarpet ? 'confirmed' : 'assigned',
      subtotal: preVat,
      deliveryFee,
      discountAmount: discount,
      appliedCoupon: appliedCoupon?.code,
      vatAmount: vat,
      totalAmount: total,
      paymentMethod: actualPaymentMethod,
      walletDeductedAmount: walletDeducted,
      directPaidAmount: directPaid,
      paymentStatus: isCarpet ? 'pending' : 'paid',
      isCarpetService: isCarpet,
      inspectionStatus: isCarpet ? 'pending_inspection' : undefined,
      readyForDelivery: false,
      captainDeliveryStatus: 'idle',
      createdAt: new Date().toISOString(),
      timeline: isCarpet
        ? createCarpetTimeline('confirmed')
        : [
            { status: 'created', label: 'تم إنشاء الطلب', time: 'الآن', done: true },
            { status: 'confirmed', label: 'تم تأكيد الحجز', time: 'الآن', done: true },
            { status: 'assigned', label: `تم إسناد الطلب إلى الكابتن ${assignedCaptain?.name || 'أحمد'}`, time: 'الآن', done: true },
            { status: 'on_the_way', label: 'الكابتن في الطريق', time: '--', done: false },
            { status: 'arrived', label: 'وصل الكابتن', time: '--', done: false },
            { status: 'in_progress', label: 'جاري تنفيذ الخدمة', time: '--', done: false },
            { status: 'completed', label: 'تم اكتمال الخدمة', time: '--', done: false },
          ],
    };

    setOrders(prev => [newOrder, ...prev]);

    // Reset booking state
    setBookingService(null);
    setBookingAddons([]);
    setBookingNotes('');
    setAppliedCoupon(null);

    // Send push notification simulation
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: isCarpet
        ? `تم إنشاء طلب غسيل السجاد (${orderNum}) بنجاح`
        : `تم تأكيد حجزك بنجاح (${orderNum})`,
      message: isCarpet
        ? `سيقوم الكابتن ${assignedCaptain?.name} بمعاينة ومراجعة المقاسات الفعلية لتفعيل خيار الدفع.`
        : `موعدك: ${bookingDate} الساعة ${bookingTimeSlot} مع الكابتن ${assignedCaptain?.name}`,
      target: 'customers',
      channel: 'in_app',
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);

    return newOrder;
  };

  // Order Creation (Store Checkout)
  const checkoutCart = (paymentMethod: 'wallet' | 'moyasar_card' | 'tabby' | 'tamara'): ServiceOrder => {
    if (cart.length === 0) throw new Error('Cart is empty');
    const orderNum = `NX-S${Math.floor(10000 + Math.random() * 90000)}`;

    // Delivery fee rule: Highest deliveryCost among cart items, default 20 SAR
    const highestItemDelivery = Math.max(
      ...cart.map(item => item.product.deliveryCost ?? 20),
      20
    );
    let deliveryFee = highestItemDelivery;

    // Free delivery threshold (e.g. 150 SAR)
    if (cartTotal >= 150) {
      deliveryFee = 0;
    }

    // Coupon applies ONLY to products subtotal, NEVER to delivery fee
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        discount = (cartTotal * appliedCoupon.discountValue) / 100;
      } else {
        discount = appliedCoupon.discountValue;
      }
      setCoupons(prev => prev.map(c => c.id === appliedCoupon.id ? { ...c, usedCount: c.usedCount + 1 } : c));
    }
    const finalCartSubtotal = Math.max(0, cartTotal - discount);
    const rawTotal = finalCartSubtotal + deliveryFee;
    const vat = Math.round((rawTotal * 0.15) * 100) / 100;
    const preVat = Math.round((rawTotal - vat) * 100) / 100;

    let walletDeducted = 0;
    let directPaid = rawTotal;
    let actualPaymentMethod: ServiceOrder['paymentMethod'] = paymentMethod;

    if (useWalletBalance && walletBalance > 0) {
      if (walletBalance >= rawTotal) {
        walletDeducted = rawTotal;
        directPaid = 0;
        actualPaymentMethod = 'wallet';
        setWalletBalance(prev => prev - rawTotal);
        const tx: WalletTransaction = {
          id: `tx-${Date.now()}`,
          transactionNumber: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
          type: 'payment',
          typeLabel: 'دفع طلب متجر',
          amount: -rawTotal,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          status: 'completed',
          orderId: orderNum,
          description: `سداد مشتريات المتجر (${cart.length} منتجات)`,
        };
        setWalletTransactions(prev => [tx, ...prev]);
      } else {
        walletDeducted = walletBalance;
        directPaid = rawTotal - walletBalance;
        actualPaymentMethod = 'mixed';
        setWalletBalance(0);
        const tx: WalletTransaction = {
          id: `tx-${Date.now()}`,
          transactionNumber: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
          type: 'partial_deduction',
          typeLabel: 'خصم جزئي لمشتريات المتجر',
          amount: -walletDeducted,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
          status: 'completed',
          orderId: orderNum,
          description: `خصم رصيد المحفظة والمتبقي ${directPaid.toFixed(2)} ر.س عبر البطاقة`,
        };
        setWalletTransactions(prev => [tx, ...prev]);
      }
    }

    const newOrder: ServiceOrder = {
      id: `ord-store-${Date.now()}`,
      orderNumber: orderNum,
      type: 'store',
      productType: 'PHYSICAL',
      physicalStatus: 'IN_STORE',
      storeItems: [...cart],
      customerName: user.name || 'شركة ترو فينتشر',
      customerPhone: user.phone || '966505555555',
      address: selectedAddress || INITIAL_ADDRESSES[0],
      date: new Date().toISOString().split('T')[0],
      timeSlot: '10:00 - 18:00',
      addons: [],
      status: 'confirmed',
      subtotal: preVat,
      deliveryFee,
      discountAmount: discount,
      appliedCoupon: appliedCoupon?.code,
      vatAmount: vat,
      totalAmount: rawTotal,
      paymentMethod: actualPaymentMethod,
      walletDeductedAmount: walletDeducted,
      directPaidAmount: directPaid,
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      timeline: [
        { status: 'created', label: 'تم إنشاء الطلب', time: 'الآن', done: true },
        { status: 'confirmed', label: 'تم تأكيد طلب المتجر وتجهيز الشحنة في المخزن', time: 'الآن', done: true },
        { status: 'on_the_way', label: 'الشحنة في طريقها مع مندوب التوصيل', time: '--', done: false },
        { status: 'completed', label: 'تم التسليم بنجاح', time: '--', done: false },
      ],
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setAppliedCoupon(null);
    return newOrder;
  };

  // Order Cancellation (BRD rule: Only allowed > 1 hour before scheduled time, and all refunds go to WALLET)
  const cancelOrder = (orderId: string): { success: boolean; message: string } => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return { success: false, message: 'الطلب غير موجود' };

    if (target.status === 'cancelled') {
      return { success: false, message: 'الطلب ملغي بالفعل' };
    }

    // Check status constraints
    const nonCancellableStatuses: OrderStatus[] = [
      'on_the_way',
      'arrived',
      'in_progress',
      'completed',
      'carpet_received_from_client',
      'carpet_delivered_to_laundry',
      'carpet_received_from_laundry',
      'carpet_on_the_way_delivery',
      'client_no_response',
      'vehicle_not_found'
    ];

    if (nonCancellableStatuses.includes(target.status)) {
      return {
        success: false,
        message: 'عذراً، لا يمكن إلغاء الطلب بعد تحرك الكابتن أو بدء التنفيذ أو استلام السجاد وفقاً لسياسة الإلغاء.',
      };
    }

    // For Services: Time constraint check (Must be > 1 hour before scheduled appointment)
    if (target.type === 'service' || target.type === 'package') {
      try {
        const appointmentDateTimeStr = `${target.date}T${target.timeSlot.includes(':') ? target.timeSlot.slice(0, 5) : '12:00'}:00`;
        const appointmentTime = new Date(appointmentDateTimeStr).getTime();
        const currentTime = new Date().getTime();
        const diffMinutes = (appointmentTime - currentTime) / (1000 * 60);

        // If scheduled for today and less than 60 minutes away (or past)
        if (!isNaN(diffMinutes) && diffMinutes <= 60 && diffMinutes > -1440) {
          return {
            success: false,
            message: 'عذراً، لا يمكن إلغاء الحجز قبل أقل من ساعة واحدة (60 دقيقة) من الموعد المحدد وفقاً للائحة الإلغاء.',
          };
        }
      } catch (e) {
        // Fallback safely
      }
    }

    // Process refund: ALL refunds go to WALLET balance
    const refundAmount = target.totalAmount;
    if (refundAmount > 0 && target.paymentStatus === 'paid') {
      setWalletBalance(prev => prev + refundAmount);

      const tx: WalletTransaction = {
        id: `tx-refund-${Date.now()}`,
        transactionNumber: `TX-REF-${Math.floor(10000 + Math.random() * 90000)}`,
        type: 'refund',
        typeLabel: 'استرداد قيمة طلب ملغي',
        amount: refundAmount,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
        orderId: target.orderNumber,
        description: `استرداد فوري إلى المحفظة لإلغاء الطلب #${target.orderNumber}`,
      };
      setWalletTransactions(prev => [tx, ...prev]);
    }

    // If paid via package/subscription wash, restore 1 wash
    if (target.paymentMode === 'PACKAGE' && target.usedSubscriptionId) {
      setUserSubscriptions(prev => prev.map(s => {
        if (s.id === target.usedSubscriptionId) {
          return {
            ...s,
            remainingWashes: s.remainingWashes + 1,
            usedWashes: Math.max(0, s.usedWashes - 1),
            status: 'active'
          };
        }
        return s;
      }));
    }

    // If used coupon, restore coupon usage
    if (target.appliedCoupon) {
      setCoupons(prev => prev.map(c => c.code === target.appliedCoupon ? { ...c, usedCount: Math.max(0, c.usedCount - 1) } : c));
    }

    // Update order status to cancelled
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              status: 'cancelled' as OrderStatus,
              paymentStatus: 'refunded',
              timeline: [
                ...o.timeline,
                { status: 'cancelled', label: 'تم إلغاء الطلب واسترجاع المبلغ للمحفظة', time: 'الآن', done: true },
              ],
            }
          : o
      )
    );

    return {
      success: true,
      message: refundAmount > 0
        ? `تم إلغاء الطلب بنجاح وتم استرداد (${refundAmount.toFixed(2)} ر.س) إلى محفظتك الإلكترونية فوراً.`
        : 'تم إلغاء الطلب بنجاح واستعادة رصيد باقة الغسيل.',
    };
  };

  const rateOrder = (orderId: string, stars: number, comment?: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              rating: {
                stars,
                comment,
                createdAt: new Date().toISOString(),
              },
            }
          : o
      )
    );
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, captainId?: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder && targetOrder.isCarpetService) {
      const stagesRequiringPayment: OrderStatus[] = [
        'carpet_delivered_to_laundry',
        'carpet_received_from_laundry',
        'carpet_on_the_way_delivery',
        'completed'
      ];
      if (stagesRequiringPayment.includes(newStatus) && targetOrder.paymentStatus !== 'paid') {
        alert('⚠️ تنبيه: لا يمكن تحويل الحالة إلى (في الطريق للعميل للتسليم) أو المراحل التالية حتى يتم تأكيد سداد العميل وإتمام الدفع بنجاح.');
        return;
      }
    }

    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const cap = captainId ? captains.find(c => c.id === captainId) : undefined;
        const newTimeline = o.isCarpetService
          ? createCarpetTimeline(newStatus)
          : o.timeline.map(t =>
              t.status === newStatus ? { ...t, done: true, time: 'مكتمل الآن' } : t
            );
        return {
          ...o,
          status: newStatus,
          captainId: cap?.id || o.captainId,
          captainName: cap?.name || o.captainName,
          captainPhone: cap?.phone || o.captainPhone,
          captainDeliveryStatus: newStatus === 'carpet_on_the_way_delivery' ? 'on_the_way_to_deliver' : newStatus === 'completed' ? 'delivered' : o.captainDeliveryStatus,
          timeline: newTimeline,
        };
      })
    );
  };

  const modifyOrderAdmin = (orderId: string, updates: Partial<ServiceOrder>) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, ...updates } : o))
    );
  };

  // Carpet Cleaning Workflow Methods (BRD: Captain Inspection, Price Adjustment, Payment Activation, Delivery)
  const confirmCarpetInspection = (orderId: string) => {
    let targetNum = '';
    const newTimeline = createCarpetTimeline('carpet_received_from_client');
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        targetNum = o.orderNumber;
        return {
          ...o,
          status: 'carpet_received_from_client',
          inspectionStatus: 'confirmed',
          timeline: newTimeline,
        };
      })
    );

    setSelectedOrderForTracking(prev => {
      if (prev && prev.id === orderId) {
        return {
          ...prev,
          status: 'carpet_received_from_client',
          inspectionStatus: 'confirmed',
          timeline: newTimeline,
        };
      }
      return prev;
    });

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `✅ تم استلام ومعاينة مقاسات السجاد (طلب #${targetNum})`,
      message: 'تم فحص مقاسات السجاد ومطابقتها بنجاح من قِبل المندوب. تم تفعيل زر إتمام الدفع لتأكيد سداد الفاتورة.',
      target: 'customers',
      channel: 'in_app',
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const adjustCarpetInspection = (orderId: string, updatedAddons: AddonProduct[], reasonNotes: string) => {
    let targetNum = '';
    let newTotal = 0;
    const newTimeline = createCarpetTimeline('carpet_received_from_client');

    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        targetNum = o.orderNumber;
        const basePrice = o.service?.price || 0;
        const addonsTotal = updatedAddons.reduce((sum, a) => sum + (a.price * (a.quantity || 1)), 0);
        const rawSubtotal = (o.service ? basePrice : 0) + addonsTotal;
        const discount = o.discountAmount || 0;
        const finalSubtotal = Math.max(0, rawSubtotal - discount);
        const vat = Math.round((finalSubtotal * 0.15) * 100) / 100;
        const preVat = Math.round((finalSubtotal - vat) * 100) / 100;
        const total = finalSubtotal;
        newTotal = total;

        return {
          ...o,
          status: 'carpet_received_from_client',
          addons: updatedAddons,
          subtotal: preVat,
          vatAmount: vat,
          totalAmount: total,
          inspectionStatus: 'adjusted',
          inspectionNotes: reasonNotes,
          inspectionAdjustedAt: new Date().toISOString(),
          timeline: newTimeline,
        };
      })
    );

    setSelectedOrderForTracking(prev => {
      if (prev && prev.id === orderId) {
        return {
          ...prev,
          status: 'carpet_received_from_client',
          inspectionStatus: 'adjusted',
          inspectionNotes: reasonNotes,
          timeline: newTimeline,
        };
      }
      return prev;
    });

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `⚠️ تم تعديل مقاسات السجاد والسعر (طلب #${targetNum})`,
      message: `قام المندوب بتعديل المقاسات بعد المعاينة الميدانية. السبب: "${reasonNotes}". الإجمالي الجديد: ${newTotal.toFixed(2)} ر.س. يرجى إتمام الدفع.`,
      target: 'customers',
      channel: 'in_app',
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const payCarpetOrder = (orderId: string, paymentMethod: 'wallet' | 'moyasar_card' | 'tabby' | 'tamara' | 'mixed') => {
    let orderNum = '';
    let updatedTotal = 0;

    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        orderNum = o.orderNumber;
        updatedTotal = o.totalAmount;

        let walletDeducted = 0;
        let directPaid = o.totalAmount;
        let actualMethod = paymentMethod;

        if (paymentMethod === 'wallet' || useWalletBalance) {
          if (walletBalance >= o.totalAmount) {
            walletDeducted = o.totalAmount;
            directPaid = 0;
            actualMethod = 'wallet';
            setWalletBalance(b => b - o.totalAmount);
          } else if (walletBalance > 0) {
            walletDeducted = walletBalance;
            directPaid = o.totalAmount - walletBalance;
            actualMethod = 'mixed';
            setWalletBalance(0);
          }
        }

        return {
          ...o,
          paymentStatus: 'paid',
          paymentMethod: actualMethod,
          walletDeductedAmount: walletDeducted,
          directPaidAmount: directPaid,
          readyForDelivery: true,
        };
      })
    );

    // Notify captain that payment is completed and they can proceed with delivery
    const notifCaptain: AppNotification = {
      id: `notif-${Date.now()}-cap`,
      title: `💰 تأكيد الدفع لطلب غسيل السجاد (#${orderNum})`,
      message: `قام العميل بسداد قيمة الطلب (${updatedTotal.toFixed(2)} ر.س) بنجاح. متاح لك الآن متابعة تسليم السجاد للمغسلة ومن ثم للعميل.`,
      target: 'captains',
      channel: 'in_app',
      createdAt: new Date().toISOString(),
      read: false,
    };

    const notifCustomer: AppNotification = {
      id: `notif-${Date.now()}-cust`,
      title: `🎉 تم سداد قيمة طلب السجاد بنجاح (#${orderNum})`,
      message: `تم سداد المبلغ بنجاح! أصبحت الفاتورة الضريبية متاحة الآن للعرض والطباعة.`,
      target: 'customers',
      channel: 'in_app',
      createdAt: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [notifCustomer, notifCaptain, ...prev]);
  };

  const updateCarpetOrderStatus = (orderId: string, status: OrderStatus, customNotes?: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const stagesRequiringPayment: OrderStatus[] = [
      'carpet_delivered_to_laundry',
      'carpet_received_from_laundry',
      'carpet_on_the_way_delivery',
      'completed'
    ];
    if (targetOrder && stagesRequiringPayment.includes(status) && targetOrder.paymentStatus !== 'paid') {
      alert('⚠️ تنبيه: لا يمكن تحويل الحالة إلى (في الطريق للعميل للتسليم) أو نقل السجاد حتى يتم تأكيد سداد العميل وإتمام الدفع بنجاح.');
      return;
    }

    let orderNum = '';
    const newTimeline = createCarpetTimeline(status);
    const stageInfo = CARPET_ORDER_STAGES.find(s => s.status === status);
    const statusLabel = stageInfo?.label || status;

    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        orderNum = o.orderNumber;
        return {
          ...o,
          status,
          captainDeliveryStatus: status === 'carpet_on_the_way_delivery' ? 'on_the_way_to_deliver' : status === 'completed' ? 'delivered' : o.captainDeliveryStatus,
          timeline: newTimeline,
        };
      })
    );

    setSelectedOrderForTracking(prev => {
      if (prev && prev.id === orderId) {
        return {
          ...prev,
          status,
          captainDeliveryStatus: status === 'carpet_on_the_way_delivery' ? 'on_the_way_to_deliver' : status === 'completed' ? 'delivered' : prev.captainDeliveryStatus,
          timeline: newTimeline,
        };
      }
      return prev;
    });

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `🔄 تحديث حالة غسيل السجاد (#${orderNum}): ${statusLabel}`,
      message: customNotes || stageInfo?.description || `تم تحديث حالة طلب السجاد إلى: ${statusLabel}`,
      target: 'customers',
      channel: 'in_app',
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const setCaptainOnDelivery = (orderId: string) => {
    updateCarpetOrderStatus(orderId, 'carpet_on_the_way_delivery');
  };

  // Coupons CRUD
  const addCoupon = (c: Omit<Coupon, 'id' | 'usedCount'>) => {
    const newC: Coupon = { ...c, id: `coup-${Date.now()}`, usedCount: 0 };
    setCoupons(prev => [newC, ...prev]);
  };
  const updateCoupon = (id: string, c: Partial<Coupon>) => {
    setCoupons(prev => prev.map(item => item.id === id ? { ...item, ...c } : item));
  };
  const deleteCoupon = (id: string) => {
    setCoupons(prev => prev.filter(item => item.id !== id));
  };

  // Captains & Zones CRUD
  const addCaptain = (cap: Omit<Captain, 'id' | 'completedOrdersCount' | 'rating'>) => {
    const newCap: Captain = {
      ...cap,
      id: `cap-${Date.now()}`,
      rating: 5.0,
      completedOrdersCount: 0,
    };
    setCaptains(prev => [...prev, newCap]);
  };
  const updateCaptain = (id: string, cap: Partial<Captain>) => {
    setCaptains(prev => prev.map(c => c.id === id ? { ...c, ...cap } : c));
  };
  const deleteCaptain = (id: string) => {
    setCaptains(prev => prev.filter(c => c.id !== id));
  };

  const addZone = (z: Omit<CoverageZone, 'id'>) => {
    const newZ: CoverageZone = { ...z, id: `zone-${Date.now()}` };
    setZones(prev => [...prev, newZ]);
  };
  const updateZone = (id: string, z: Partial<CoverageZone>) => {
    setZones(prev => prev.map(item => item.id === id ? { ...item, ...z } : item));
  };
  const deleteZone = (id: string) => {
    setZones(prev => prev.filter(item => item.id !== id));
  };

  const updateCapacitySlots = (slots: TimeSlotCapacity[]) => {
    setCapacitySlots(slots);
  };

  // Notifications & Support & Static
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const sendNotification = (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newN: AppNotification = {
      ...n,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newN, ...prev]);
  };

  // Store Order Return (Allowed within 3 days of delivery)
  const requestStoreOrderReturn = (orderId: string, reason: string): { success: boolean; message: string } => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return { success: false, message: 'الطلب غير موجود' };
    if (target.type !== 'store') return { success: false, message: 'طلب الاسترجاع متاح لمنتجات المتجر فقط' };

    // Refund items amount to wallet
    const refundAmount = target.totalAmount - (target.deliveryFee || 0);
    setWalletBalance(prev => prev + refundAmount);

    const tx: WalletTransaction = {
      id: `tx-return-${Date.now()}`,
      transactionNumber: `TX-RET-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'refund',
      typeLabel: 'استرجاع مشتريات متجر',
      amount: refundAmount,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      orderId: target.orderNumber,
      description: `استرجاع قيمة منتجات الطلب #${target.orderNumber} إلى المحفظة. السبب: ${reason}`,
    };
    setWalletTransactions(prev => [tx, ...prev]);

    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              status: 'cancelled',
              paymentStatus: 'refunded',
              timeline: [
                ...o.timeline,
                { status: 'cancelled', label: `تم قبول طلب الاسترجاع (${reason}) وإعادة المبلغ للمحفظة`, time: 'الآن', done: true },
              ],
            }
          : o
      )
    );

    return {
      success: true,
      message: `تم قبول طلب الإرجاع بنجاح واسترداد (${refundAmount.toFixed(2)} ر.س) إلى محفظتك!`,
    };
  };

  const addSupportTicket = (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => {
    const newT: SupportTicket = {
      ...ticket,
      id: `tkt-${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          senderName: ticket.customerName,
          text: ticket.message,
          createdAt: new Date().toISOString()
        }
      ]
    };
    setSupportTickets(prev => [newT, ...prev]);
  };

  const addTicketMessage = (ticketId: string, text: string, sender: 'customer' | 'support' = 'customer') => {
    setSupportTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        const newMsg = {
          id: `msg-${Date.now()}`,
          sender,
          senderName: sender === 'customer' ? (user.name || 'العميل') : 'خدمة عملاء نيكست',
          text,
          createdAt: new Date().toISOString()
        };
        return {
          ...t,
          status: sender === 'customer' ? 'in_progress' : t.status,
          messages: [...(t.messages || []), newMsg]
        };
      })
    );
  };

  const updateSupportTicketStatus = (id: string, status: 'open' | 'in_review' | 'in_progress' | 'resolved' | 'closed') => {
    setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const updateStaticContent = (content: Partial<StaticContent>) => {
    setStaticContent(prev => ({ ...prev, ...content }));
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        selectedCategory,
        setSelectedCategory,
        navigateToCategoryServices,
        activeCategory,
        setActiveCategory,
        activeServiceTab,
        setActiveServiceTab,
        viewLayout,
        setViewLayout,
        isAdmin,
        setIsAdmin,

        user,
        login,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        showAuthModal,
        setShowAuthModal,

        userSubscriptions,
        renewUserSubscription,
        useSubscriptionWash,
        pauseOrResumeSubscription,

        cars,
        selectedCar,
        setSelectedCar,
        addCar,
        deleteCar,
        setDefaultCar,

        addresses,
        selectedAddress,
        setSelectedAddress,
        addAddress,
        deleteAddress,
        setDefaultAddress,

        services,
        packages,
        subscriptions,
        addons,
        addService,
        updateService,
        deleteService,
        toggleServiceActive,

        selectedPackageForDetail,
        isPackageDetailOpen,
        openPackageDetail,
        closePackageDetail,
        purchasePackage,

        bookingService,
        setBookingService,
        isBookingModalOpen,
        setIsBookingModalOpen,
        openBookingModal,
        closeBookingModal,
        bookingDate,
        setBookingDate,
        bookingTimeSlot,
        setBookingTimeSlot,
        bookingStep,
        setBookingStep,
        serviceBookingContext,
        setServiceBookingContext,
        openStoreForServiceBooking,
        returnToServiceBooking,
        exitServiceBookingStoreContext,
        addStoreProductToBooking,
        updateStoreProductBookingQuantity,
        bookingAddons,
        toggleBookingAddon,
        updateBookingAddonQuantity,
        bookingNotes,
        setBookingNotes,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        useWalletBalance,
        setUseWalletBalance,
        createBookingOrder,

        storeProducts,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartTotal,
        cartCount,
        addProduct,
        updateProduct,
        deleteProduct,
        checkoutCart,
        requestStoreOrderReturn,

        orders,
        selectedOrderForDetail,
        setSelectedOrderForDetail,
        openOrderDetail,
        closeOrderDetail,
        selectedOrderForTracking,
        setSelectedOrderForTracking,
        cancelOrder,
        rateOrder,
        updateOrderStatus,
        modifyOrderAdmin,
        confirmCarpetInspection,
        adjustCarpetInspection,
        payCarpetOrder,
        setCaptainOnDelivery,
        updateCarpetOrderStatus,

        walletBalance,
        walletTransactions,
        rechargeWallet,
        sendGift,

        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,

        captains,
        addCaptain,
        updateCaptain,
        deleteCaptain,
        zones,
        addZone,
        updateZone,
        deleteZone,
        capacitySlots,
        updateCapacitySlots,

        notifications,
        markNotificationAsRead,
        sendNotification,
        supportTickets,
        addSupportTicket,
        addTicketMessage,
        updateSupportTicketStatus,
        staticContent,
        updateStaticContent,

        activeStaticPageKey,
        setActiveStaticPageKey,

        // Settings
        notificationSettings,
        setNotificationSettings,
        toggleNotificationSetting,
        language,
        setLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export type CarCategory = 'small' | 'sedan' | 'suv' | 'luxury';

export interface Car {
  id: string;
  brand: string;
  model: string;
  category: CarCategory;
  plateNumber: string;
  color: string;
  isDefault?: boolean;
}

export interface Address {
  id: string;
  name: string; // e.g. "المنزل", "العمل", "تست"
  fullAddress: string;
  city: string;
  district: string;
  street?: string;
  buildingNumber?: string;
  flatNumber?: string;
  landmark?: string;
  entryType?: 'map' | 'manual';
  shortAddress?: string; // العنوان الوطني المختصر مثل RRHA3241
  lat: number;
  lng: number;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  isBlocked?: boolean;
  notes?: string;
}

export type ProductType = 'SERVICE' | 'PHYSICAL';
export type FormType = 'WASH_CAR' | 'POLISH_CAR' | 'WASH_CARPET' | 'WASH_AC';
export type OrderPaymentMode = 'ONE_TIME' | 'PACKAGE';

export interface ServiceItem {
  id: string;
  title: string;
  category: 'cars' | 'carpets' | 'furniture' | 'carpets_furniture' | 'wash_offers' | 'ac' | 'all' | string;
  type: 'service' | 'package' | 'subscription';
  formType?: FormType;
  productType?: ProductType;
  tag?: string; // e.g. "جديد", "الأكثر طلباً", "عرض خاص"
  price: number;
  originalPrice?: number;
  pricePerMeter?: number; // سعر المتر المربع للسجاد
  promoCodeHint?: string; // e.g. "39 ريال كود خصم X25"
  promoCode?: string;
  durationMinutes: number;
  description: string;
  image: string;
  includes: string[];
  pricingByCarCategory?: Record<CarCategory, number>;
  deliveryCost?: number;
  freeDeliveryThreshold?: number;
  deliveryDurationFrom?: number;
  deliveryDurationTo?: number;
  isActive: boolean;
}

export interface StoreProduct {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  mainCategory?: 'cars' | 'carpets' | 'furniture' | 'wash_offers' | 'ac' | string;
  subCategory?: string;
  subCategoryLabel?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  deliveryEstimate: string; // e.g. "1-3 أيام"
  deliveryCost?: number;
  freeDeliveryThreshold?: number;
  image: string;
  description: string;
  stock: number;
  isActive: boolean;
  isNew?: boolean;
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
}

export interface AddonProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  selected?: boolean;
  quantity?: number;
  category?: string;
  dimensionsTag?: string;
  areaSquareMeters?: number;
  originalPrice?: number;
  isGift?: boolean;
  giftReason?: string;
}

export interface CarpetItemOption {
  id: string;
  name: string;
  category: 'carpets' | 'blankets' | 'furniture';
  dimensionsTag: string; // e.g. "م 1.0 × 1.5"
  areaSquareMeters?: number; // e.g. 1.50
  price: number;
  originalPrice?: number;
  image: string;
  description?: string;
  quantity?: number;
}

export type PhysicalStatus =
  | 'IN_STORE' // في المخزن / جاري التجهيز
  | 'WITH_DELEGATE' // مع المندوب
  | 'IN_TRANSIT_TO_CLIENT' // في الطريق للعميل
  | 'WITH_CLIENT' // مع العميل / تم التسليم
  | 'RETURN_REQUESTED' // قيد الاسترجاع
  | 'RETURNED'; // تم الاسترجاع

export type OrderStatus =
  | 'pending' // قيد الانتظار
  | 'created' // تم إنشاء الطلب
  | 'confirmed' // تم تأكيد الطلب
  | 'assigned' // تم إسناد الطلب للكابتن
  | 'on_the_way' // في الطريق
  | 'arrived' // تم وصول المندوب
  | 'carpet_received_from_client' // تم الاستلام من العميل
  | 'carpet_delivered_to_laundry' // تم تسليم لمغسلة
  | 'carpet_received_from_laundry' // تم الاستلام من المغسلة
  | 'carpet_on_the_way_delivery' // في الطريق للعميل للتسليم
  | 'in_progress' // جاري تنفيذ الخدمة (STARTED)
  | 'completed' // مكتمل
  | 'return_requested' // طلب استرجاع قيد المراجعة
  | 'returned' // تم الاسترجاع للمحفظة
  | 'client_no_response' // العميل لم يرد
  | 'vehicle_not_found' // المركبة غير موجودة
  | 'cancelled'; // تم الإلغاء

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  time: string;
  done: boolean;
  notes?: string;
}

export interface ServiceOrder {
  id: string;
  orderNumber: string;
  type: 'service' | 'package' | 'store';
  formType?: FormType;
  productType?: ProductType;
  paymentMode?: OrderPaymentMode; // ONE_TIME or PACKAGE
  usedSubscriptionId?: string;
  service?: ServiceItem;
  storeItems?: CartItem[];
  customerName: string;
  customerPhone: string;
  car?: Car;
  address: Address;
  date: string; // e.g. "2026-08-03"
  timeSlot: string; // e.g. "20:50"
  addons: AddonProduct[];
  notes?: string;
  captainId?: string;
  captainName?: string;
  captainPhone?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
  status: OrderStatus;
  physicalStatus?: PhysicalStatus;
  timeline: OrderTimelineEvent[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  appliedCoupon?: string;
  vatAmount: number; // 15%
  totalAmount: number;
  paymentMethod: 'wallet' | 'moyasar_card' | 'tabby' | 'tamara' | 'mixed' | 'package' | 'cash';
  walletDeductedAmount: number;
  directPaidAmount: number;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded' | 'cancelled';
  isCarpetService?: boolean;
  inspectionStatus?: 'pending_inspection' | 'confirmed' | 'adjusted';
  inspectionNotes?: string;
  inspectionAdjustedAt?: string;
  readyForDelivery?: boolean;
  captainDeliveryStatus?: 'idle' | 'on_the_way_to_deliver' | 'delivered';
  createdAt: string;
  rating?: {
    stars: number;
    comment?: string;
    tags?: string[];
    createdAt: string;
  };
  returnRequest?: {
    requestedAt: string;
    reason: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    refundAmount: number;
  };
}

export interface WalletTransaction {
  id: string;
  transactionNumber: string;
  type: 'recharge' | 'payment' | 'refund' | 'partial_deduction' | 'gift';
  typeLabel: string;
  amount: number;
  date: string;
  time: string;
  status: 'completed' | 'failed' | 'pending';
  orderId?: string;
  description: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 25 for 25% or 40 for 40 SAR
  minOrderValue?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface Captain {
  id: string;
  name: string;
  phone: string;
  city: string;
  assignedZones: string[];
  timeSlots: string[];
  status: 'active' | 'inactive' | 'busy';
  rating: number;
  completedOrdersCount: number;
  avatar?: string;
}

export interface CoverageZone {
  id: string;
  city: string;
  district: string;
  fee: number;
  isActive: boolean;
}

export interface TimeSlotCapacity {
  slot: string; // e.g. "16:00 - 18:00", "20:00 - 22:00"
  totalCapacityMinutes: number; // e.g. 240 mins
  bookedMinutes: number;
  isAvailable: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type?: 'order' | 'payment' | 'support' | 'reminder' | 'offer' | 'system';
  target: 'all' | 'customers' | 'captains';
  channel: 'in_app' | 'sms' | 'email';
  createdAt: string;
  orderId?: string;
  read?: boolean;
}

export interface TicketMessage {
  id: string;
  sender: 'customer' | 'support';
  senderName: string;
  text: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  customerName: string;
  customerPhone: string;
  subject: string;
  message: string;
  type: 'inquiry' | 'complaint' | 'order_modification' | 'car_not_found' | 'refund_request';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  orderId?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages?: TicketMessage[];
  createdAt: string;
}

export interface UserSubscription {
  id: string;
  planName: string;
  planType: 'monthly' | 'weekly' | 'package' | 'vip';
  packageId?: string;
  serviceId?: string;
  serviceCategory?: string; // e.g. 'cars', 'carpets', 'ac'
  formType?: FormType; // 'WASH_CAR' | 'POLISH_CAR' | 'WASH_CARPET' | 'WASH_AC'
  allowedServiceIds?: string[];
  freeGiftAddonIds?: string[];
  totalWashes: number;
  remainingWashes: number;
  usedWashes: number;
  startDate: string;
  renewalDate: string;
  price: number;
  status: 'active' | 'inactive' | 'expired' | 'paused' | 'cancelled';
  carPlate?: string;
  carBrand?: string;
  nextScheduledWash?: string;
  features: string[];
}

export interface StaticContent {
  aboutUs: string;
  termsAndConditions: string;
  privacyPolicy: string;
  faqs: { question: string; answer: string }[];
}

export interface ServiceBookingStoreContext {
  isActive: boolean;
  serviceId?: string;
  serviceName?: string;
  serviceCategory?: string;
  bookingStep: number;
  returnScreen: string;
  preferredCategory?: string;
}

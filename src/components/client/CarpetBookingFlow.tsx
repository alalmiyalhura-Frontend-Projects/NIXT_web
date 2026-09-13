import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceItem, CarpetItemOption, Address } from '../../types';
import { INITIAL_CARPET_ITEMS } from '../../data/initialData';
import { OrderSuccessScreen } from './OrderSuccessScreen';
import confetti from 'canvas-confetti';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Truck,
  Wand2,
  Edit2,
  Info,
  Check,
  CreditCard,
  Wallet,
  Star,
  Award,
  ChevronLeft,
  Tag
} from 'lucide-react';

interface CarpetBookingFlowProps {
  service: ServiceItem;
  onClose: () => void;
  onOpenAddressModal?: () => void;
}

export const CarpetBookingFlow: React.FC<CarpetBookingFlowProps> = ({
  service,
  onClose,
  onOpenAddressModal
}) => {
  const {
    addresses,
    selectedAddress,
    setSelectedAddress,
    bookingDate,
    setBookingDate,
    bookingTimeSlot,
    setBookingTimeSlot,
    bookingNotes,
    setBookingNotes,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    walletBalance,
    createBookingOrder,
    setSelectedOrderForTracking,
    setCurrentScreen,
    setBookingService,
    toggleBookingAddon,
    bookingAddons,
    openStoreForServiceBooking
  } = useApp();

  // Step state: 'overview' | 'items' | 'schedule' | 'confirm' | 'success'
  const [currentStep, setCurrentStep] = useState<'overview' | 'items' | 'schedule' | 'confirm' | 'success'>('overview');

  // Selected carpet/furniture items in current flow: map of itemId -> { item: CarpetItemOption, quantity: number }
  const [selectedItemsMap, setSelectedItemsMap] = useState<Record<string, { item: CarpetItemOption; quantity: number }>>(() => {
    // Initial prefill if user is opening for a specific service or has initial items
    const initialMap: Record<string, { item: CarpetItemOption; quantity: number }> = {};
    if (INITIAL_CARPET_ITEMS.length > 0) {
      // Start with item 1 preselected with qty 2 if it's carpet service
      if (service.category === 'carpets') {
        const item1 = INITIAL_CARPET_ITEMS[0];
        initialMap[item1.id] = { item: item1, quantity: 2 };
      } else if (service.category === 'furniture') {
        const sofaItem = INITIAL_CARPET_ITEMS.find(i => i.category === 'furniture') || INITIAL_CARPET_ITEMS[0];
        initialMap[sofaItem.id] = { item: sofaItem, quantity: 1 };
      }
    }
    return initialMap;
  });

  // Bottom sheet modal state for item quantity configuration (Screenshot 3)
  const [activeBottomSheetItem, setActiveBottomSheetItem] = useState<CarpetItemOption | null>(null);
  const [bottomSheetQuantity, setBottomSheetQuantity] = useState<number>(1);

  // Active sub-category filter in Items screen
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | 'carpets' | 'blankets' | 'furniture'>('all');

  // Custom size state
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customLength, setCustomLength] = useState<string>('');
  const [customWidth, setCustomWidth] = useState<string>('');

  // Payment method
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'moyasar_card' | 'wallet' | 'tabby' | 'tamara'>('moyasar_card');
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>('');

  // Reset carpet flow state when opened or service changes
  React.useEffect(() => {
    setCurrentStep('overview');
    setIsSubmitting(false);
    setCreatedOrderNumber('');
    setCouponMessage(null);
    setCouponCodeInput('');
  }, [service.id]);

  // Available sample dates (matching screenshots: الأحد 30 أغسطس...)
  const carpetDateOptions = [
    { dateStr: '2026-08-30', dayName: 'الأحد', dayNum: '30', monthName: 'أغسطس' },
    { dateStr: '2026-08-31', dayName: 'الاثنين', dayNum: '31', monthName: 'أغسطس' },
    { dateStr: '2026-09-01', dayName: 'الثلاثاء', dayNum: '1', monthName: 'سبتمبر' },
    { dateStr: '2026-09-02', dayName: 'الأربعاء', dayNum: '2', monthName: 'سبتمبر' },
    { dateStr: '2026-09-03', dayName: 'الخميس', dayNum: '3', monthName: 'سبتمبر' },
    { dateStr: '2026-09-04', dayName: 'الجمعة', dayNum: '4', monthName: 'سبتمبر' },
  ];

  // Available sample time slots (matching screenshots: 12:40 - 13:00 م)
  const carpetTimeSlots = [
    'من 12:40 الي 13:00 م',
    'من 13:00 الي 13:20 م',
    'من 13:20 الي 13:40 م',
    'من 17:30 الي 17:50 م',
    'من 18:50 الي 19:10 م',
    'من 20:00 الي 20:20 م',
    'من 21:00 الي 21:20 م'
  ];

  interface SelectedItemEntry {
    item: CarpetItemOption;
    quantity: number;
  }

  // Calculations
  const selectedItemsList: SelectedItemEntry[] = (Object.values(selectedItemsMap) as SelectedItemEntry[]).filter(
    (entry: SelectedItemEntry) => entry.quantity > 0
  );
  const totalItemsCount: number = selectedItemsList.reduce((sum: number, entry: SelectedItemEntry) => sum + entry.quantity, 0);
  const rawItemsTotal: number = selectedItemsList.reduce(
    (sum: number, entry: SelectedItemEntry) => sum + (entry.item.price * entry.quantity),
    0
  );

  // Delivery threshold (Free delivery if >= 50 SAR, otherwise 20 SAR)
  const freeDeliveryThreshold = 50.0;
  const isFreeDelivery = rawItemsTotal >= freeDeliveryThreshold || rawItemsTotal === 0;
  const deliveryFee = rawItemsTotal > 0 && !isFreeDelivery ? 20.0 : 0.0;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - rawItemsTotal);

  // Discounts
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (rawItemsTotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const subtotalAfterDiscount = Math.max(0, rawItemsTotal - discountAmount);
  // 15% VAT breakdown
  const vatAmount = Math.round((subtotalAfterDiscount * 0.15) * 100) / 100;
  const preVatAmount = Math.round((subtotalAfterDiscount - vatAmount) * 100) / 100;
  const finalTotalAmount = Math.round((subtotalAfterDiscount + deliveryFee) * 100) / 100;

  // Item quantity handlers
  const handleOpenBottomSheet = (item: CarpetItemOption) => {
    const existing = selectedItemsMap[item.id];
    setBottomSheetQuantity(existing ? existing.quantity : 1);
    setActiveBottomSheetItem(item);
  };

  const handleSaveBottomSheet = () => {
    if (!activeBottomSheetItem) return;
    if (bottomSheetQuantity <= 0) {
      const nextMap = { ...selectedItemsMap };
      delete nextMap[activeBottomSheetItem.id];
      setSelectedItemsMap(nextMap);
    } else {
      setSelectedItemsMap(prev => ({
        ...prev,
        [activeBottomSheetItem.id]: {
          item: activeBottomSheetItem,
          quantity: bottomSheetQuantity
        }
      }));
    }
    setActiveBottomSheetItem(null);
  };

  const handleUpdateItemQuantity = (item: CarpetItemOption, delta: number) => {
    const current = selectedItemsMap[item.id]?.quantity || 0;
    const next = current + delta;
    if (next <= 0) {
      const nextMap = { ...selectedItemsMap };
      delete nextMap[item.id];
      setSelectedItemsMap(nextMap);
    } else {
      setSelectedItemsMap(prev => ({
        ...prev,
        [item.id]: {
          item,
          quantity: next
        }
      }));
    }
  };

  const handleAddCustomSize = () => {
    const l = parseFloat(customLength);
    const w = parseFloat(customWidth);
    if (isNaN(l) || isNaN(w) || l <= 0 || w <= 0) return;

    const area = Math.round(l * w * 100) / 100;
    const pricePerMeter = service.pricePerMeter || 5.50;
    const price = Math.round(area * pricePerMeter * 100) / 100;

    const customItem: CarpetItemOption = {
      id: `custom-carpet-${Date.now()}`,
      name: `سجاد مخصص (${l} × ${w} م)`,
      category: 'carpets',
      dimensionsTag: `م ${l.toFixed(1)} × ${w.toFixed(1)}`,
      areaSquareMeters: area,
      price: price,
      originalPrice: price * 2,
      image: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=400&q=80',
      description: `حساب فوري بمعدل ${pricePerMeter.toFixed(2)} ر.س / م²`
    };

    setSelectedItemsMap(prev => ({
      ...prev,
      [customItem.id]: {
        item: customItem,
        quantity: 1
      }
    }));

    setShowCustomModal(false);
    setCustomLength('');
    setCustomWidth('');
  };

  const handleApplyCoupon = () => {
    if (!couponCodeInput.trim()) return;
    const result = applyCoupon(couponCodeInput);
    if (result.success) {
      setCouponMessage({ text: result.message, isError: false });
    } else {
      setCouponMessage({ text: result.message, isError: true });
    }
  };

  const handleFinalOrderSubmit = () => {
    if (totalItemsCount === 0) {
      alert('يرجى اختيار عنصر واحد على الأقل للمتابعة');
      return;
    }
    if (!selectedAddress) {
      alert('يرجى اختيار عنوان التوصيل');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        setBookingService(service);
        // Sync selected items as addons so they appear on order timeline
        selectedItemsList.forEach(entry => {
          toggleBookingAddon({
            id: entry.item.id,
            name: `${entry.item.name} (${entry.item.dimensionsTag})`,
            price: entry.item.price,
            image: entry.item.image,
            quantity: entry.quantity,
            category: 'carpets'
          });
        });

        const newOrder = createBookingOrder(selectedPaymentMethod);
        setCreatedOrderNumber(newOrder.orderNumber);
        setIsSubmitting(false);
        setCurrentStep('success');

        // Confetti burst
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch (err: any) {
        setIsSubmitting(false);
        alert(err.message || 'حدث خطأ أثناء تأكيد الطلب');
      }
    }, 1000);
  };

  // Filtered items to display
  const displayedItems = INITIAL_CARPET_ITEMS.filter(item => {
    if (selectedCategoryTab === 'all') return true;
    return item.category === selectedCategoryTab;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[94vh] text-right animate-in fade-in zoom-in-95 duration-200">
        
        {/* ========================================================================= */}
        {/* SCREEN 1: SERVICE OVERVIEW & INCLUSIONS (Matching Screenshot 9) */}
        {/* ========================================================================= */}
        {currentStep === 'overview' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header bar */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base font-black text-white font-['Cairo']">{service.title}</h3>
                  <p className="text-[11px] text-slate-400">إكمال الحجز</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Overview Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {/* Hero Banner */}
              <div className="relative h-48 rounded-2xl overflow-hidden shadow-md">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-between p-4">
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm">
                      {service.tag || 'جديد ✨'}
                    </span>
                    <span className="bg-[#3BFF9C] text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm">
                      tabby
                    </span>
                  </div>
                  <div className="text-white space-y-1">
                    <h4 className="text-xl font-black text-white font-['Cairo']">{service.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black bg-blue-600/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                        {service.price.toFixed(2)} ر.س / {service.pricePerMeter ? 'السعر للمتر' : 'للقطعة'}
                      </span>
                      {service.originalPrice && (
                        <span className="text-xs text-slate-300 line-through">
                          {service.originalPrice.toFixed(2)} ر.س
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* What is Included (ماذا تتضمن 📋) - Screenshot 9 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>ماذا تتضمن</span>
                    <span className="text-blue-600">📋</span>
                  </h4>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed">
                      غسيل عميق وإزالة البقع الصعبة إزالة الأتربة
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed">
                      تنظيف وتعقيم لإزالة الجراثيم والروائح العناية بألياف السجاد بأفضل الطرق.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed">
                      استخدام مواد آمنة على جميع أنواع السجاد
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 leading-relaxed">
                      الحفاظ على ألوان ونسيج السجاد
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Reviews Section (آراء العملاء ⭐) - Screenshot 9 */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>آراء العملاء</span>
                    <span className="text-amber-500">⭐</span>
                  </h4>
                  <span className="text-[11px] font-bold text-blue-600 cursor-pointer hover:underline flex items-center gap-0.5">
                    رؤية الكل
                    <ChevronLeft className="w-3 h-3" />
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">
                          أ
                        </div>
                        <span className="text-xs font-black text-slate-900">أحلام</span>
                      </div>
                      <span className="text-[10px] text-slate-400">الأحد، 30 أغسطس</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">الصراحه 👌🏻 غسيل ونظافه جدا ممتازه</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
                          ن
                        </div>
                        <span className="text-xs font-black text-slate-900">نصر</span>
                      </div>
                      <span className="text-[10px] text-slate-400">الخميس، 27 أغسطس</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">شكرا لكم على الدقة والنظافة وسرعة الاستلام والتسليم</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentStep('items')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>إكمال الحجز</span>
                <Clock className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: CHOOSE ITEMS & SIZES (Matching Screenshots 2, 3, 4) */}
        {/* ========================================================================= */}
        {currentStep === 'items' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header bar with Cart Badge */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setCurrentStep('overview')}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base font-black text-white font-['Cairo']">{service.title}</h3>
                  <p className="text-[11px] text-slate-400">اختر العناصر والمقاسات</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {totalItemsCount > 0 && (
                  <div className="flex items-center gap-1 bg-blue-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
                    <span>{totalItemsCount}</span>
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Free Delivery Banner (Screenshot 4) */}
            <div className="bg-blue-50/90 border-b border-blue-100 p-3 px-5 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-bold text-slate-800 text-[11px]">
                  {isFreeDelivery ? (
                    <span className="text-emerald-700 font-black">🎉 حصلت على توصيل مجاني!</span>
                  ) : (
                    <span>أضف <strong className="text-blue-700 font-black">{amountNeededForFreeDelivery.toFixed(2)} ر.س</strong> لتحصل على توصيل مجاني</span>
                  )}
                </span>
              </div>
              <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, (rawItemsTotal / freeDeliveryThreshold) * 100)}%` }}
                />
              </div>
            </div>

            {/* Tip Banner (Screenshot 4) */}
            <div className="bg-amber-50 border-b border-amber-200/60 p-2.5 px-5 flex items-center gap-2 text-[11px] text-amber-900 font-bold shrink-0">
              <Wand2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>يمكنك إضافة السجاد، البطانيات والألحفة في نفس الطلب!</span>
            </div>

            {/* Category Filter Pills */}
            <div className="p-3 px-5 border-b border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 bg-white">
              <button
                onClick={() => setSelectedCategoryTab('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCategoryTab === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setSelectedCategoryTab('carpets')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCategoryTab === 'carpets'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                سجاد وموكيت
              </button>
              <button
                onClick={() => setSelectedCategoryTab('blankets')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCategoryTab === 'blankets'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ألحفة وبطانيات
              </button>
              <button
                onClick={() => setSelectedCategoryTab('furniture')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCategoryTab === 'furniture'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                كنب ومجالس
              </button>
            </div>

            {/* Items List (Screenshots 2 & 4) */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {/* Store Transition Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 border border-amber-200 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h6 className="text-xs font-bold text-slate-900">هل تحتاج منتجات عناية أو تغليف من المتجر؟</h6>
                    <p className="text-[10px] text-slate-500">تصفح معطرات ومساحيق السجاد وأكياس الحفظ المتاحة في المتجر</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setCurrentScreen('store');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs transition-colors"
                >
                  <span>المتجر 🛍️</span>
                  <ArrowLeft className="w-3 h-3" />
                </button>
              </div>

              {displayedItems.map(item => {
                const selected = selectedItemsMap[item.id];
                const quantity = selected?.quantity || 0;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      quantity > 0
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* Item Image with dimension tag */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] font-bold text-center py-0.5 truncate">
                        {item.dimensionsTag}
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 space-y-1">
                      <h5 className="text-xs font-black text-slate-900 leading-tight">
                        {item.name}
                      </h5>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          📐 {item.dimensionsTag}
                        </span>
                        {item.areaSquareMeters && (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {item.areaSquareMeters.toFixed(2)} م²
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-xs font-black text-blue-700">
                          {item.price.toFixed(2)} ر.س
                        </span>
                        {item.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {item.originalPrice.toFixed(2)} ر.س
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Control or Plus Button */}
                    <div className="shrink-0">
                      {quantity > 0 ? (
                        <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-xl p-1 shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(item, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-black text-xs w-4 text-center text-slate-900">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(item, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenBottomSheet(item)}
                          className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-sm transition-all"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Custom Size Accordion/Trigger (Screenshots 2 & 4) */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                      📐
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-900">سجاد مقاس مخصص (غير موجود بالقائمة)</h5>
                      <p className="text-[10px] text-slate-500">احسب التكلفة فوريًا بالمتر المربع ({service.pricePerMeter || 5.50} ر.س / م²)</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(!showCustomModal)}
                    className="text-xs font-black text-blue-700 bg-white border border-blue-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-blue-50"
                  >
                    {showCustomModal ? 'إخفاء' : 'إدخال مقاس'}
                  </button>
                </div>

                {showCustomModal && (
                  <div className="pt-2 space-y-3 border-t border-blue-100 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 mb-1 block">الطول (بالمتر)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          value={customLength}
                          onChange={e => setCustomLength(e.target.value)}
                          placeholder="مثال: 3.5"
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 mb-1 block">العرض (بالمتر)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          value={customWidth}
                          onChange={e => setCustomWidth(e.target.value)}
                          placeholder="مثال: 2.5"
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-blue-500"
                        />
                      </div>
                    </div>

                    {customLength && customWidth && parseFloat(customLength) > 0 && parseFloat(customWidth) > 0 && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-[10px] text-slate-500 block">
                            المساحة: {(parseFloat(customLength) * parseFloat(customWidth)).toFixed(2)} م²
                          </span>
                          <span className="text-xs font-black text-blue-700">
                            التكلفة: {(parseFloat(customLength) * parseFloat(customWidth) * (service.pricePerMeter || 5.50)).toFixed(2)} ر.س
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCustomSize}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs"
                        >
                          إضافة المقاس
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Sticky Action Bar (Screenshot 4) */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-[11px] text-slate-400 block font-bold">
                  {totalItemsCount} العناصر المحددة
                </span>
                <span className="text-base font-black text-blue-700 font-['Cairo']">
                  {rawItemsTotal.toFixed(2)} ر.س
                </span>
              </div>

              <button
                type="button"
                disabled={totalItemsCount === 0}
                onClick={() => setCurrentStep('schedule')}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
              >
                <span>اطلب الآن</span>
                <Calendar className="w-4 h-4" />
              </button>
            </div>

            {/* BOTTOM SHEET MODAL (Matching Screenshot 3) */}
            {activeBottomSheetItem && (
              <div className="fixed inset-0 z-60 bg-black/60 flex items-end justify-center animate-in fade-in">
                <div className="bg-white w-full max-w-lg rounded-t-3xl p-5 space-y-4 text-right animate-in slide-in-from-bottom duration-200">
                  {/* Handle bar */}
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{activeBottomSheetItem.name}</h4>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          📐 {activeBottomSheetItem.dimensionsTag}
                        </span>
                        {activeBottomSheetItem.areaSquareMeters && (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {activeBottomSheetItem.areaSquareMeters.toFixed(2)} م²
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveBottomSheetItem(null)}
                      className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">الكمية المطلوبة:</span>
                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setBottomSheetQuantity(Math.max(1, bottomSheetQuantity - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-black text-sm w-6 text-center text-slate-900">{bottomSheetQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setBottomSheetQuantity(bottomSheetQuantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price Calculation */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>سعر القطعة:</span>
                      <span className="font-bold text-slate-800">{activeBottomSheetItem.price.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between font-black text-blue-700 text-sm pt-1 border-t border-slate-100">
                      <span>الإجمالي ({bottomSheetQuantity} قطع):</span>
                      <span>{(activeBottomSheetItem.price * bottomSheetQuantity).toFixed(2)} ر.س</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    type="button"
                    onClick={handleSaveBottomSheet}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>اضف إلى السلة</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: SCHEDULE DATE, TIME & DETAILS (Matching Screenshots 5 & 6) */}
        {/* ========================================================================= */}
        {currentStep === 'schedule' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setCurrentStep('items')}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base font-black text-white font-['Cairo']">{service.title}</h3>
                  <p className="text-[11px] text-slate-400">جدولة التاريخ والوقت</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Schedule Form */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              
              {/* Section 1: Address Card (Screenshot 5) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>العنوان</span>
                  </h4>
                  {onOpenAddressModal && (
                    <button
                      type="button"
                      onClick={onOpenAddressModal}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      تغيير العنوان
                    </button>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        {selectedAddress?.name || 'تست (المنزل)'}
                      </span>
                      <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                        {selectedAddress?.fullAddress || 'شارع الحمراء، محافظة جدة، المملكة العربية السعودية'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    محدد
                  </span>
                </div>
              </div>

              {/* Section 2: Date and Time Picker (Screenshot 5) */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>جدولة التاريخ والوقت</span>
                </h4>

                {/* Date Horizontal Picker */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-bold block">التاريخ:</span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {carpetDateOptions.map(d => (
                      <button
                        key={d.dateStr}
                        type="button"
                        onClick={() => setBookingDate(d.dateStr)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border min-w-[72px] transition-all ${
                          bookingDate === d.dateStr
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-[9px] opacity-80">{d.dayName}</span>
                        <span className="text-base font-black">{d.dayNum}</span>
                        <span className="text-[9px] opacity-80">{d.monthName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots Grid */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-bold block">الوقت:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {carpetTimeSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookingTimeSlot(slot)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                          bookingTimeSlot === slot
                            ? 'bg-blue-600 text-white border-blue-600 font-black shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Selected Items Breakdown (Screenshots 5 & 6) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>العناصر المختارة</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('items')}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>تعديل</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                  {selectedItemsList.map(entry => (
                    <div key={entry.item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black flex items-center justify-center">
                          {entry.quantity}
                        </span>
                        <div>
                          <span className="font-bold text-slate-800 block leading-tight">{entry.item.name}</span>
                          <span className="text-[10px] text-slate-500">{entry.item.dimensionsTag}</span>
                        </div>
                      </div>
                      <span className="font-black text-slate-800">
                        {(entry.item.price * entry.quantity).toFixed(2)} ر.س
                      </span>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-600">
                      <span>المجموع الفرعي:</span>
                      <span className="font-bold">{preVatAmount.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>ضريبة القيمة المضافة (15%):</span>
                      <span className="font-bold">{vatAmount.toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>تكلفة التوصيل:</span>
                      <span className="font-bold">
                        {deliveryFee === 0 ? <span className="text-emerald-600">مجاناً</span> : `${deliveryFee.toFixed(2)} ر.س`}
                      </span>
                    </div>
                    <div className="flex justify-between font-black text-xs text-blue-700 pt-1 border-t border-slate-200">
                      <span>الإجمالي الكلي:</span>
                      <span>{finalTotalAmount.toFixed(2)} ر.س</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Important Info Callout (Screenshot 6) */}
              <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-blue-900 mb-0.5">معلومة مهمة ℹ️</h5>
                  <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                    سيتم التوصيل فى خلال ٤- ٧ ايام وسيتم اشعاركم فور الانتهاء
                  </p>
                </div>
              </div>

              {/* Section 5: Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-900 block">
                  ملاحظات مع الطلب (اختياري)
                </label>
                <textarea
                  value={bookingNotes}
                  onChange={e => setBookingNotes(e.target.value)}
                  placeholder="أدخل أي ملاحظات خاصة بالكابتن أو الاستلام..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-blue-500 resize-none h-20"
                />
              </div>
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-[11px] text-slate-400 block font-bold">المجموع:</span>
                <span className="text-base font-black text-blue-700 font-['Cairo']">
                  {finalTotalAmount.toFixed(2)} ر.س
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep('confirm')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
              >
                <span>التالي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 4: CONFIRMATION, MAP & PAYMENT (Matching Screenshot 7) */}
        {/* ========================================================================= */}
        {currentStep === 'confirm' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setCurrentStep('schedule')}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base font-black text-white font-['Cairo']">تفاصيل الحجز</h3>
                  <p className="text-[11px] text-slate-400">تأكيد الطلب</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Confirm Details */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              
              {/* Interactive Map Preview Card (Screenshot 7) */}
              <div className="relative h-40 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
                {/* Visual Map Render with Streets/Roads Pattern */}
                <div className="w-full h-full bg-[#E5E3DF] relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]" />
                  {/* SVG Road Lines */}
                  <svg className="w-full h-full absolute inset-0 opacity-40" xmlns="http://www.w3.org/2000/svg">
                    <line x1="0" y1="50" x2="500" y2="90" stroke="#FFFFFF" strokeWidth="12" />
                    <line x1="120" y1="0" x2="200" y2="200" stroke="#FFFFFF" strokeWidth="10" />
                    <line x1="0" y1="120" x2="500" y2="40" stroke="#FFA726" strokeWidth="6" />
                    <line x1="260" y1="0" x2="240" y2="200" stroke="#FFFFFF" strokeWidth="8" />
                  </svg>
                  
                  {/* Pin in center */}
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 animate-bounce">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{selectedAddress?.name || 'تست'} - {selectedAddress?.city || 'جدة'}</span>
                    </div>
                    <div className="w-3 h-3 bg-red-600 rounded-full blur-[2px] opacity-70 -mt-1" />
                  </div>
                </div>

                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-lg text-[10px] font-bold text-slate-700">
                  {selectedAddress?.fullAddress || 'شارع الحمراء، جدة'}
                </div>
              </div>

              {/* Order Details List (Screenshot 7) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900">تفاصيل الطلب:</h4>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    إجمالي القطع 🔷: {totalItemsCount}
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedItemsList.map(entry => (
                    <div
                      key={entry.item.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={entry.item.image}
                          alt={entry.item.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <span className="font-black text-slate-900 block">{entry.item.name}</span>
                          <span className="text-[10px] text-slate-500">
                            الكمية: {entry.quantity} | {entry.item.dimensionsTag}
                          </span>
                        </div>
                      </div>
                      <span className="font-black text-blue-700">
                        {(entry.item.price * entry.quantity).toFixed(2)} ر.س
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">كوبون الخصم أو كود العرض</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="أدخل الكود (مثال: CARPET50)"
                      className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    />
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-4 py-2 rounded-xl transition-all"
                  >
                    تطبيق
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-[10px] font-bold ${couponMessage.isError ? 'text-red-600' : 'text-emerald-600'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Payment Methods Selection (مطابقة لخدمات غسيل السيارات) */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-900 block flex items-center justify-between">
                  <span>طريقة الدفع</span>
                  <span className="text-[10px] text-slate-500 font-normal">اختر وسيلة الدفع المناسبة لك</span>
                </label>

                {/* Wallet option */}
                <div
                  onClick={() => {
                    if (walletBalance >= finalTotalAmount) {
                      setSelectedPaymentMethod('wallet');
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    selectedPaymentMethod === 'wallet'
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                      : walletBalance < finalTotalAmount
                      ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">المحفظة الإلكترونية</span>
                      <span className="text-[10px] text-slate-500">رصيدك الحالي: {walletBalance.toFixed(2)} ر.س</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedPaymentMethod === 'wallet' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300'
                  }`}>
                    {selectedPaymentMethod === 'wallet' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Card payment (Mada / Visa / Apple Pay) */}
                <div
                  onClick={() => setSelectedPaymentMethod('moyasar_card')}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    selectedPaymentMethod === 'moyasar_card'
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">بطاقة مدى / البطاقات الائتمانية / Apple Pay</span>
                      <span className="text-[10px] text-slate-500">دفع إلكتروني آمن وفوري</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedPaymentMethod === 'moyasar_card' ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300'
                  }`}>
                    {selectedPaymentMethod === 'moyasar_card' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Tabby */}
                <div
                  onClick={() => setSelectedPaymentMethod('tabby')}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    selectedPaymentMethod === 'tabby'
                      ? 'border-emerald-400 bg-emerald-50/70 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-[#3BFF9C] text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md">
                      tabby
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">قسمها على 4 دفعات بدون فوائد مع تابي</span>
                      <span className="text-[10px] text-slate-500">{(finalTotalAmount / 4).toFixed(2)} ر.س / دفعة</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedPaymentMethod === 'tabby' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300'
                  }`}>
                    {selectedPaymentMethod === 'tabby' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Tamara */}
                <div
                  onClick={() => setSelectedPaymentMethod('tamara')}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    selectedPaymentMethod === 'tamara'
                      ? 'border-amber-400 bg-amber-50/70 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-[#FF9478] text-white font-black text-[10px] px-2 py-0.5 rounded-md">
                      tamara
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">قسم مشترياتك عبر تمارا</span>
                      <span className="text-[10px] text-slate-500">بدون أي فوائد أو رسوم إضافية</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedPaymentMethod === 'tamara' ? 'bg-amber-600 text-white border-amber-600' : 'border-slate-300'
                  }`}>
                    {selectedPaymentMethod === 'tamara' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>

              {/* Invoice Summary (ملخص الفاتورة - Screenshot 7) */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                <h4 className="font-black text-slate-900 text-xs pb-1.5 border-b border-slate-100">
                  ملخص الفاتورة
                </h4>
                <div className="flex justify-between text-slate-600">
                  <span>الاجمالى قبل الضريبة:</span>
                  <span className="font-bold">{preVatAmount.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>الضريبة (15%):</span>
                  <span className="font-bold">{vatAmount.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>تكلفة التوصيل:</span>
                  <span className="font-bold">
                    {deliveryFee === 0 ? <span className="text-emerald-600">مجاناً</span> : `${deliveryFee.toFixed(2)} ر.س`}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>خصم الكوبون:</span>
                    <span>- {discountAmount.toFixed(2)} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-blue-700 pt-2 border-t border-slate-200">
                  <span>الإجمالي:</span>
                  <span className="text-base font-['Cairo']">{finalTotalAmount.toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>

            {/* Bottom Sticky CTA Button */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalOrderSubmit}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>جاري تأكيد الطلب...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد الطلب ({finalTotalAmount.toFixed(2)} ر.س)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 5: ORDER CREATED SUCCESSFULLY (Matching Screenshot) */}
        {/* ========================================================================= */}
        {currentStep === 'success' && (
          <OrderSuccessScreen
            orderNumber={createdOrderNumber}
            serviceTitle={service.title}
            onBackToHome={() => {
              onClose();
              setCurrentScreen('home');
            }}
          />
        )}

      </div>
    </div>
  );
};

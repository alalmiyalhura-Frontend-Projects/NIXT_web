import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceItem, Car, Address, AddonProduct, CarpetItemOption } from '../../types';
import { INITIAL_CARPET_ITEMS } from '../../data/initialData';
import { OrderSuccessScreen } from './OrderSuccessScreen';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  MapPin,
  Car as CarIcon,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Minus,
  Tag,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Wallet,
  ArrowRight,
  ArrowLeft,
  Star,
  Check,
  Sparkles,
  ShoppingBag,
  Store,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  Truck,
  Wand2,
  Edit2,
  Info,
  Layers,
  Award
} from 'lucide-react';

export const BookingScreen: React.FC = () => {
  const {
    bookingService,
    closeBookingModal,
    cars,
    selectedCar,
    setSelectedCar,
    addresses,
    selectedAddress,
    setSelectedAddress,
    addons,
    bookingDate,
    setBookingDate,
    bookingTimeSlot,
    setBookingTimeSlot,
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
    walletBalance,
    userSubscriptions,
    createBookingOrder,
    setSelectedOrderForTracking,
    setCurrentScreen,
    setBookingService,
    storeProducts,
    services,
    bookingStep,
    setBookingStep,
    openStoreForServiceBooking
  } = useApp();

  const activeService = bookingService || services[0];

  // Carpet detection
  const isCarpetOrFurniture =
    activeService.category === 'carpets' ||
    activeService.category === 'furniture' ||
    activeService.category === 'carpets_furniture' ||
    activeService.category === 'curtains' ||
    activeService.formType === 'WASH_CARPET';

  const isCarService =
    activeService.category === 'cars' ||
    activeService.formType === 'WASH_CAR' ||
    activeService.formType === 'POLISH_CAR';

  const isACService = activeService.category === 'ac' || activeService.formType === 'WASH_AC';

  // Booking step: 1 = Service Details & Items, 2 = Address/Car/Date, 3 = Addons & Notes, 4 = Summary & Payment
  const step = bookingStep;
  const setStep = setBookingStep;
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'moyasar_card' | 'wallet' | 'tabby' | 'tamara' | 'package'>('moyasar_card');
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>('');
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string>('');
  const [showStorePickerModal, setShowStorePickerModal] = useState<boolean>(false);
  const [storeSearchQuery, setStoreSearchQuery] = useState<string>('');
  const [storeActiveCategory, setStoreActiveCategory] = useState<string>('all');

  // Carpet custom dimension state
  const [carpetCategoryTab, setCarpetCategoryTab] = useState<string>('all');
  const [showCustomSizeModal, setShowCustomSizeModal] = useState<boolean>(false);
  const [customLength, setCustomLength] = useState<string>('');
  const [customWidth, setCustomWidth] = useState<string>('');

  // Default address and car selection
  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddress(def);
    }
    if (isCarService && !selectedCar && cars.length > 0) {
      const def = cars.find(c => c.isDefault) || cars[0];
      setSelectedCar(def);
    }
  }, [addresses, cars, isCarService]);

  // Active user subscriptions
  const availableUserSubs = userSubscriptions.filter(s => s.status === 'active' && s.remainingWashes > 0);

  // Available dates
  const dateOptions = [
    { dateStr: '2026-08-03', dayName: 'الاثنين', dayNum: '3', monthName: 'أغسطس' },
    { dateStr: '2026-08-04', dayName: 'الثلاثاء', dayNum: '4', monthName: 'أغسطس' },
    { dateStr: '2026-08-05', dayName: 'الأربعاء', dayNum: '5', monthName: 'أغسطس' },
    { dateStr: '2026-08-06', dayName: 'الخميس', dayNum: '6', monthName: 'أغسطس' },
    { dateStr: '2026-08-07', dayName: 'الجمعة', dayNum: '7', monthName: 'أغسطس' },
    { dateStr: '2026-08-08', dayName: 'السبت', dayNum: '8', monthName: 'أغسطس' },
    { dateStr: '2026-08-09', dayName: 'الأحد', dayNum: '9', monthName: 'أغسطس' },
  ];

  // Available time slots
  const timeSlots = [
    { id: 'morning', label: 'الفترة الصباحية', time: '09:00 ص - 12:00 م' },
    { id: 'afternoon', label: 'فترة الظهيرة', time: '01:00 م - 04:00 م' },
    { id: 'evening', label: 'الفترة المسائية (ذروة)', time: '05:00 م - 09:00 م' },
    { id: 'night', label: 'الفترة الليلية', time: '09:30 م - 12:00 ص' },
  ];

  // Price calculations
  const baseServicePrice = isCarService && selectedCar && activeService.pricingByCarCategory
    ? (activeService.pricingByCarCategory[selectedCar.category] || activeService.price)
    : activeService.price;

  const isPayingWithPackage = selectedPaymentMethod === 'package' && Boolean(selectedSubscriptionId);

  const addonsTotal = bookingAddons.reduce((sum, a) => sum + (a.price * (a.quantity || 1)), 0);
  const rawSubtotal = isPayingWithPackage ? addonsTotal : (baseServicePrice + addonsTotal);

  // Delivery fee rule
  let deliveryFee = activeService.deliveryCost ?? 0;
  if (activeService.freeDeliveryThreshold && rawSubtotal >= activeService.freeDeliveryThreshold) {
    deliveryFee = 0;
  }

  // Coupon discount
  let couponDiscountAmount = 0;
  if (appliedCoupon && !isPayingWithPackage) {
    if (appliedCoupon.discountType === 'percentage') {
      couponDiscountAmount = (rawSubtotal * appliedCoupon.discountValue) / 100;
    } else {
      couponDiscountAmount = Math.min(appliedCoupon.discountValue, rawSubtotal);
    }
  }

  const subtotalAfterCoupon = Math.max(0, rawSubtotal - couponDiscountAmount);
  const totalAmount = subtotalAfterCoupon + deliveryFee;

  const walletDeduction = useWalletBalance && selectedPaymentMethod !== 'wallet'
    ? Math.min(walletBalance, totalAmount)
    : 0;

  const finalDueAmount = Math.max(0, totalAmount - walletDeduction);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const res = applyCoupon(couponCodeInput.trim());
    setCouponMessage({ text: res.message, isError: !res.success });
  };

  const handleAddCustomSizeCarpet = () => {
    const l = parseFloat(customLength);
    const w = parseFloat(customWidth);
    if (isNaN(l) || isNaN(w) || l <= 0 || w <= 0) {
      alert('يرجى إدخال أبعاد صحيحة للطول والعرض');
      return;
    }

    const area = Number((l * w).toFixed(2));
    const pricePerMeter = activeService.pricePerMeter || 25;
    const calculatedPrice = Number((area * pricePerMeter).toFixed(2));

    const customAddon: AddonProduct = {
      id: `custom-carpet-${Date.now()}`,
      name: `سجادة مخصصة (${l}م × ${w}م)`,
      description: `المساحة الإجمالية: ${area} م² بسعر ${pricePerMeter} ر.س للمتر`,
      price: calculatedPrice,
      quantity: 1,
      category: 'carpets'
    };

    toggleBookingAddon(customAddon);
    setShowCustomSizeModal(false);
    setCustomLength('');
    setCustomWidth('');
  };

  const handleFinalConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        setBookingService(activeService);
        const newOrder = createBookingOrder(
          selectedPaymentMethod,
          isPayingWithPackage ? 'PACKAGE' : 'ONE_TIME',
          selectedSubscriptionId || undefined
        );
        setIsProcessing(false);
        setShowConfirmPopup(false);
        setConfirmedOrderNumber(newOrder.orderNumber);
        setIsSuccess(true);

        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore
        }
      } catch (err: any) {
        setIsProcessing(false);
        alert(err.message || 'حدث خطأ أثناء تنفيذ الحجز');
      }
    }, 1000);
  };

  // Carpet Items Filtered
  const displayedCarpetItems = INITIAL_CARPET_ITEMS.filter(item => {
    if (carpetCategoryTab === 'all') return true;
    return item.category === carpetCategoryTab;
  });

  // Recommended store care products
  const recommendedStoreProducts = storeProducts.filter(p => {
    if (isCarpetOrFurniture) {
      return p.category === 'carpets' || p.category === 'furniture' || p.category === 'blankets_quilts';
    }
    return p.category === 'car_care' || p.category === 'interior_acc' || p.category === 'exterior_acc';
  });

  if (isSuccess && confirmedOrderNumber) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <OrderSuccessScreen
          orderNumber={confirmedOrderNumber}
          onClose={() => {
            setIsSuccess(false);
            closeBookingModal();
            setCurrentScreen('home');
          }}
          onViewOrders={() => {
            setIsSuccess(false);
            closeBookingModal();
            setCurrentScreen('orders');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-4 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-2">
          <button
            onClick={() => setCurrentScreen('home')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            الرئيسية
          </button>
          <span>/</span>
          <button
            onClick={() => setCurrentScreen('category_services')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            الخدمات
          </button>
          <span>/</span>
          <span className="text-slate-800 font-bold">حجز {activeService.title}</span>
        </div>

        {/* Top Header Stepper Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
                <img src={activeService.image} alt={activeService.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">{activeService.title}</h1>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {activeService.tag || 'خدمة فورية'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {activeService.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span className="text-slate-400">السعر الأساسي:</span>
              <span className="text-lg font-black text-blue-600">{activeService.price.toFixed(2)} ر.س</span>
            </div>
          </div>

          {/* Horizontal Step Progress Bar */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { num: 1, label: isCarpetOrFurniture ? 'الأصناف والمقاسات' : 'الخدمة والمركبة', icon: Layers },
              { num: 2, label: 'الموعد والعنوان', icon: CalendarIcon },
              { num: 3, label: 'الإضافات والعناية', icon: ShoppingBag },
              { num: 4, label: 'الدفع وتأكيد الحجز', icon: CreditCard },
            ].map((s) => {
              const isPast = step > s.num;
              const isCurrent = step === s.num;
              const Icon = s.icon;

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (isPast) setStep(s.num);
                  }}
                  disabled={!isPast && !isCurrent}
                  className={`flex flex-col sm:flex-row items-center sm:items-center justify-center gap-2 p-2.5 sm:p-3 rounded-2xl border transition-all text-center sm:text-right ${
                    isCurrent
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-2xs font-bold'
                      : isPast
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 cursor-pointer hover:bg-emerald-100/60'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isPast
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <span className="text-[11px] sm:text-xs leading-tight font-bold">
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main 2-Column Web Checkout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Active Step Form Column (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* STEP 1: SERVICE & VEHICLE / CARPET SELECTION */}
            {step === 1 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      {isCarpetOrFurniture ? 'اختر أصناف السجاد والمفروشات المطلوبة' : 'تحديد المركبة ونوع الغسيل'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isCarpetOrFurniture
                        ? 'حدد عدد القطع ومقاساتها لحساب السعر الشفاف والمضمون'
                        : 'حدد السيارة ليتم تطبيق تسعيرة الفئة المناسبة تلقائياً'}
                    </p>
                  </div>
                </div>

                {/* Car Selection Section */}
                {isCarService && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <CarIcon className="w-4 h-4 text-blue-600" />
                        <span>اختر السيارة المطلوب غسيلها:</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setCurrentScreen('cars')}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إدارة أو إضافة سيارة جديدة</span>
                      </button>
                    </div>

                    {cars.length === 0 ? (
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-3">
                        <p className="text-xs text-slate-600">لا توجد سيارات مسجلة في حسابك حتى الآن.</p>
                        <button
                          type="button"
                          onClick={() => setCurrentScreen('cars')}
                          className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xs"
                        >
                          + إضافة سيارة الآن
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {cars.map((c) => {
                          const isSelected = selectedCar?.id === c.id;
                          const priceForThisCar = activeService.pricingByCarCategory
                            ? (activeService.pricingByCarCategory[c.category] || activeService.price)
                            : activeService.price;

                          return (
                            <div
                              key={c.id}
                              onClick={() => setSelectedCar(c)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-600/20'
                                  : 'border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-slate-900">{c.brand} {c.model}</span>
                                <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-800">
                                  {c.plateNumber}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                                <span className="text-slate-500">
                                  فئة: {c.category === 'suv' ? 'جيب SUV' : c.category === 'luxury' ? 'فاخرة' : 'سيدان'}
                                </span>
                                <span className="font-black text-blue-700 text-sm">{priceForThisCar.toFixed(2)} ر.س</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Carpet & Furniture Items Flow */}
                {isCarpetOrFurniture && (
                  <div className="space-y-5">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                      {[
                        { id: 'all', label: 'جميع الأصناف' },
                        { id: 'carpets', label: 'السجاد والموكيت' },
                        { id: 'furniture', label: 'الكنب والجلسات' },
                        { id: 'blankets_quilts', label: 'البطانيات والمفارش' },
                        { id: 'curtains', label: 'الستائر' },
                        { id: 'facility', label: 'المباني والخزانات' },
                      ].map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCarpetCategoryTab(cat.id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            carpetCategoryTab === cat.id
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}

                      {/* Custom Dimension Button */}
                      <button
                        type="button"
                        onClick={() => setShowCustomSizeModal(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer mr-auto"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>حاسبة المقاسات المخصصة بالمتر</span>
                      </button>
                    </div>

                    {/* Custom Dimension Modal / Inline Form */}
                    {showCustomSizeModal && (
                      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-amber-950">حساب سعر سجادة بمقاس مخصص (بالمتر المربع)</h4>
                          <button
                            type="button"
                            onClick={() => setShowCustomSizeModal(false)}
                            className="text-xs text-amber-800 font-bold"
                          >
                            إغلاق
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">الطول (بالمتر):</label>
                            <input
                              type="number"
                              step="0.1"
                              value={customLength}
                              onChange={(e) => setCustomLength(e.target.value)}
                              placeholder="مثال: 3.5"
                              className="w-full bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-right"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">العرض (بالمتر):</label>
                            <input
                              type="number"
                              step="0.1"
                              value={customWidth}
                              onChange={(e) => setCustomWidth(e.target.value)}
                              placeholder="مثال: 2.5"
                              className="w-full bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-right"
                            />
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block mb-1">السعر التقريبي:</span>
                            <span className="text-xs font-black text-amber-900 block py-1.5">
                              {customLength && customWidth
                                ? `${(parseFloat(customLength) * parseFloat(customWidth) * (activeService.pricePerMeter || 25)).toFixed(2)} ر.س`
                                : '--'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddCustomSizeCarpet}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 rounded-xl transition-colors cursor-pointer"
                          >
                            + إضافة للطلب
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Carpet Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {displayedCarpetItems.map(item => {
                        const addonId = `carpet-${item.id}`;
                        const selectedAddon = bookingAddons.find(a => a.id === addonId);
                        const quantity = selectedAddon?.quantity || 0;

                        return (
                          <div
                            key={item.id}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                              quantity > 0
                                ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="space-y-1">
                              <h4 className="text-xs font-black text-slate-900">{item.name}</h4>
                              <p className="text-[11px] text-slate-500">{item.dimensionsTag}</p>
                              <span className="text-xs font-black text-blue-700 block">{item.price.toFixed(2)} ر.س</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {quantity > 0 ? (
                                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => updateBookingAddonQuantity(addonId, quantity - 1)}
                                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="w-5 text-center text-xs font-black text-slate-900">{quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateBookingAddonQuantity(addonId, quantity + 1)}
                                    className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center font-bold text-white cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleBookingAddon({
                                      id: addonId,
                                      name: item.name,
                                      description: item.dimensionsTag,
                                      price: item.price,
                                      quantity: 1,
                                      category: item.category
                                    });
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>أضف</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Continue button to Step 2 */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    الخطوة 1 من 4: بعد تحديد المركبة أو الأصناف انتقل للموعد والموقع
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>المتابعة للموعد والموقع</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DATE, TIME & ADDRESS SELECTION */}
            {step === 2 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">تحديد موعد الخدمة وموقع التواجد</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      اختر اليوم والفترة المناسبة لك، وحدد موقع وقوف السيارة أو عنوان الاستلام
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>الرجوع</span>
                  </button>
                </div>

                {/* Date Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-emerald-600" />
                    <span>اختر اليوم المتاح:</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                    {dateOptions.map((d) => {
                      const isSelected = bookingDate === d.dateStr;
                      return (
                        <button
                          key={d.dateStr}
                          type="button"
                          onClick={() => setBookingDate(d.dateStr)}
                          className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-[10px] opacity-80">{d.dayName}</span>
                          <span className="text-lg font-black">{d.dayNum}</span>
                          <span className="text-[9px] opacity-80">{d.monthName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>فترات تقديم الخدمة المتاحة في هذا اليوم:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {timeSlots.map((slot) => {
                      const isSelected = bookingTimeSlot.includes(slot.id) || bookingTimeSlot.includes(slot.time);
                      return (
                        <div
                          key={slot.id}
                          onClick={() => setBookingTimeSlot(slot.time)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{slot.label}</span>
                            <span className="text-[11px] text-slate-500">{slot.time}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Address Selector */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>موقع تقديم الخدمة (العنوان المعتمد):</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setCurrentScreen('addresses')}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إدارة أو إضافة عنوان جديد</span>
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-3">
                      <p className="text-xs text-slate-600">لم تقم بإضافة أي عنوان بعد.</p>
                      <button
                        type="button"
                        onClick={() => setCurrentScreen('addresses')}
                        className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                      >
                        + إضافة عنوان الآن
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((addr) => {
                        const isSelected = selectedAddress?.id === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddress(addr)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                              isSelected
                                ? 'border-red-500 bg-red-50/70 shadow-xs ring-2 ring-red-500/20'
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900">{addr.name} - {addr.city}</span>
                              {addr.isDefault && (
                                <span className="text-[9px] font-bold bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                                  افتراضي
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 line-clamp-1">{addr.district}، {addr.street}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Step navigation */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>الرجوع لتفاصيل الخدمة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>المتابعة للإضافات والعناية</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: ADDONS, CARE PRODUCTS & NOTES */}
            {step === 3 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">منتجات العناية والإضافات الحصرية</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      أضف معطرات، ملمعات أو مناشف مايكروفايبر إضافية لتصلك مع الكابتن مباشرة
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>الرجوع</span>
                  </button>
                </div>

                {/* Recommended Addons Grid */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {addons.map((addon) => {
                      const isSelected = bookingAddons.some(a => a.id === addon.id);

                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleBookingAddon(addon)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 shadow-2xs ring-2 ring-blue-600/20'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{addon.name}</h4>
                            <p className="text-[11px] text-slate-500">{addon.description}</p>
                            <span className="text-xs font-black text-blue-700 mt-1 block">+{addon.price.toFixed(2)} ر.س</span>
                          </div>

                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Recommended Store Products */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-black text-amber-950">منتجات مقترحة من المتجر (تصل مع الكابتن 🚚)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openStoreForServiceBooking(3, isCarpetOrFurniture ? 'carpets' : 'cars', activeService)}
                      className="text-xs font-black text-amber-950 hover:text-black cursor-pointer flex items-center gap-1.5 bg-amber-300 hover:bg-amber-400 active:scale-95 px-3 py-1.5 rounded-xl border border-amber-400/80 shadow-2xs transition-all"
                    >
                      <Store className="w-3.5 h-3.5 text-amber-900" />
                      <span>تصفح كل المتجر</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {recommendedStoreProducts.slice(0, 3).map(prod => {
                      const addonId = `store-${prod.id}`;
                      const selected = bookingAddons.find(a => a.id === addonId);
                      const qty = selected?.quantity || 0;

                      return (
                        <div
                          key={prod.id}
                          className="bg-white p-3 rounded-xl border border-amber-200/80 flex flex-col justify-between gap-2 shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <span className="text-xs font-bold text-slate-900 line-clamp-1">{prod.name}</span>
                              <span className="text-[10px] text-amber-700 font-bold">{prod.price.toFixed(2)} ر.س</span>
                            </div>
                          </div>

                          {qty > 0 ? (
                            <div className="flex items-center justify-between bg-amber-50 rounded-lg p-1">
                              <button
                                type="button"
                                onClick={() => updateBookingAddonQuantity(addonId, qty - 1)}
                                className="w-6 h-6 rounded bg-white text-slate-800 font-bold text-xs"
                              >
                                -
                              </button>
                              <span className="text-xs font-black text-amber-950">{qty}</span>
                              <button
                                type="button"
                                onClick={() => updateBookingAddonQuantity(addonId, qty + 1)}
                                className="w-6 h-6 rounded bg-white text-slate-800 font-bold text-xs"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                toggleBookingAddon({
                                  id: addonId,
                                  name: prod.name,
                                  description: 'منتج من المتجر',
                                  price: prod.price,
                                  quantity: 1,
                                  category: 'cars'
                                });
                              }}
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold py-1 rounded-lg transition-colors"
                            >
                              + إضافة للطلب
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Any additional products added from the full store */}
                  {bookingAddons.some(a => a.id.startsWith('store-') && !recommendedStoreProducts.slice(0, 3).some(rp => `store-${rp.id}` === a.id)) && (
                    <div className="pt-2 border-t border-amber-200/60 space-y-2">
                      <span className="text-[11px] font-black text-amber-900 block">
                        منتجات إضافية أضفتها من المتجر ({bookingAddons.filter(a => a.id.startsWith('store-') && !recommendedStoreProducts.slice(0, 3).some(rp => `store-${rp.id}` === a.id)).length}):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {bookingAddons.filter(a => a.id.startsWith('store-') && !recommendedStoreProducts.slice(0, 3).some(rp => `store-${rp.id}` === a.id)).map(addon => (
                          <div key={addon.id} className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between gap-2 shadow-2xs">
                            <div className="flex items-center gap-2 min-w-0">
                              {addon.image && <img src={addon.image} alt={addon.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />}
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-slate-900 truncate block">{addon.name}</span>
                                <span className="text-[10px] text-amber-800 font-bold">{(addon.price * (addon.quantity || 1)).toFixed(2)} ر.س</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => updateBookingAddonQuantity(addon.id, (addon.quantity || 1) - 1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                              >
                                -
                              </button>
                              <span className="text-xs font-black text-amber-950 min-w-3 text-center">{addon.quantity || 1}</span>
                              <button
                                type="button"
                                onClick={() => updateBookingAddonQuantity(addon.id, (addon.quantity || 1) + 1)}
                                className="w-6 h-6 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">ملاحظات إضافية لكابتن الخدمة:</label>
                  <textarea
                    rows={2}
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="مثال: يرجى التركيز على بقع المقاعد الخلفية، مفتاح السيارة عند الاستقبال..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-right focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Navigation */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>الرجوع للموعد والموقع</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>المتابعة للدفع والتأكيد</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: PAYMENT, COUPON & FINAL REVIEW */}
            {step === 4 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">طريقة الدفع وإتمام الحجز</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      اختر وسيلة السداد المفضلة لديك أو استفد من رصيد باقاتك ومحفظتك
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>الرجوع</span>
                  </button>
                </div>

                {/* Subscriptions Option (if user has active package wash) */}
                {availableUserSubs.length > 0 && isCarService && (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-black text-amber-950">هل تريد الخصم من باقتك المشترك بها؟</span>
                    </div>

                    <div className="space-y-2">
                      {availableUserSubs.map(sub => {
                        const isSelected = selectedPaymentMethod === 'package' && selectedSubscriptionId === sub.id;
                        return (
                          <div
                            key={sub.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedPaymentMethod('moyasar_card');
                                setSelectedSubscriptionId('');
                              } else {
                                setSelectedPaymentMethod('package');
                                setSelectedSubscriptionId(sub.id);
                              }
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-amber-100 border-amber-500 shadow-2xs'
                                : 'bg-white border-amber-200 hover:bg-amber-50/50'
                            }`}
                          >
                            <div>
                              <span className="text-xs font-black text-slate-900 block">{sub.planName}</span>
                              <span className="text-[11px] text-amber-800">
                                متبقي لك {sub.remainingWashes} غسلات (صالح حتى {sub.renewalDate})
                              </span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'bg-amber-600 text-white border-amber-600' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Coupon Code Input */}
                {!isPayingWithPackage && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">كوبون الخصم أو كود العرض:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value)}
                        placeholder="أدخل الكوبون، مثلاً: X25"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-right font-bold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                      >
                        تطبيق
                      </button>
                    </div>

                    {appliedCoupon && (
                      <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 text-xs p-2 rounded-xl border border-emerald-200">
                        <span>تم تطبيق كوبون {appliedCoupon.code} بنجاح (-{couponDiscountAmount.toFixed(2)} ر.س)</span>
                        <button
                          type="button"
                          onClick={() => {
                            removeCoupon();
                            setCouponCodeInput('');
                            setCouponMessage(null);
                          }}
                          className="text-red-600 font-bold hover:underline cursor-pointer"
                        >
                          إزالة
                        </button>
                      </div>
                    )}

                    {couponMessage && !appliedCoupon && (
                      <p className={`text-[11px] font-bold ${couponMessage.isError ? 'text-red-600' : 'text-emerald-600'}`}>
                        {couponMessage.text}
                      </p>
                    )}
                  </div>
                )}

                {/* Payment Methods */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-slate-700 block">وسيلة الدفع:</label>

                  {/* Mada / Visa */}
                  <div
                    onClick={() => setSelectedPaymentMethod('moyasar_card')}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      selectedPaymentMethod === 'moyasar_card'
                        ? 'border-blue-600 bg-blue-50/70 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">بطاقة مدى / البطاقات الائتمانية / Apple Pay</span>
                        <span className="text-[11px] text-slate-500">دفع إلكتروني فوري وآمن 100%</span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedPaymentMethod === 'moyasar_card' ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300'
                    }`}>
                      {selectedPaymentMethod === 'moyasar_card' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Wallet */}
                  {walletBalance > 0 && (
                    <div
                      onClick={() => setSelectedPaymentMethod('wallet')}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        selectedPaymentMethod === 'wallet'
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-emerald-600" />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">المحفظة الإلكترونية</span>
                          <span className="text-[11px] text-slate-500">رصيدك المتاح: {walletBalance.toFixed(2)} ر.س</span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedPaymentMethod === 'wallet' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300'
                      }`}>
                        {selectedPaymentMethod === 'wallet' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  )}

                  {/* Tabby */}
                  <div
                    onClick={() => setSelectedPaymentMethod('tabby')}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      selectedPaymentMethod === 'tabby'
                        ? 'border-emerald-400 bg-emerald-50/70 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-[#3BFF9C] text-slate-950 font-black text-xs px-2 py-0.5 rounded">tabby</span>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">قسمها على 4 دفعات بدون فوائد مع تابي</span>
                        <span className="text-[11px] text-slate-500">{(totalAmount / 4).toFixed(2)} ر.س / دفعة</span>
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
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      selectedPaymentMethod === 'tamara'
                        ? 'border-amber-400 bg-amber-50/70 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-[#FF9478] text-white font-black text-xs px-2 py-0.5 rounded">tamara</span>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">قسم مشترياتك عبر تمارا</span>
                        <span className="text-[11px] text-slate-500">بدون فوائد وبدون رسوم تأخير</span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedPaymentMethod === 'tamara' ? 'bg-amber-600 text-white border-amber-600' : 'border-slate-300'
                    }`}>
                      {selectedPaymentMethod === 'tamara' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                {/* Final Submit Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>تعديل الإضافات</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowConfirmPopup(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm px-8 py-3.5 rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>تأكيد الحجز والدفع ({finalDueAmount.toFixed(2)} ر.س)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Order Summary Sidebar (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>ملخص الحجز والطلب</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  الخطوة {step} من 4
                </span>
              </h3>

              {/* Service & Car Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">الخدمة:</span>
                  <span className="font-bold text-slate-900">{activeService.title}</span>
                </div>

                {isCarService && selectedCar && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">السيارة:</span>
                    <span className="font-bold text-slate-900">{selectedCar.brand} {selectedCar.model} ({selectedCar.plateNumber})</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">الموعد:</span>
                  <span className="font-bold text-slate-900">{bookingDate} • {bookingTimeSlot}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">الموقع:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[150px]">
                    {selectedAddress ? `${selectedAddress.name} (${selectedAddress.city})` : 'لم يحدد'}
                  </span>
                </div>
              </div>

              {/* Addons List */}
              {bookingAddons.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-600 block">الإضافات والمنتجات ({bookingAddons.length}):</span>
                  {bookingAddons.map(a => (
                    <div key={a.id} className="flex items-center justify-between text-xs text-slate-700">
                      <span className="truncate max-w-[170px]">{a.name} × {a.quantity || 1}</span>
                      <span className="font-bold">{(a.price * (a.quantity || 1)).toFixed(2)} ر.س</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>سعر الخدمة الأساسي:</span>
                  <span>{baseServicePrice.toFixed(2)} ر.س</span>
                </div>

                {addonsTotal > 0 && (
                  <div className="flex items-center justify-between">
                    <span>مجموع الإضافات:</span>
                    <span>+{addonsTotal.toFixed(2)} ر.س</span>
                  </div>
                )}

                {deliveryFee > 0 ? (
                  <div className="flex items-center justify-between">
                    <span>رسوم التوصيل والنقل:</span>
                    <span>+{deliveryFee.toFixed(2)} ر.س</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>رسوم التوصيل:</span>
                    <span className="bg-emerald-50 px-2 py-0.5 rounded">مجاناً 🎉</span>
                  </div>
                )}

                {couponDiscountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>خصم الكوبون:</span>
                    <span>-{couponDiscountAmount.toFixed(2)} ر.س</span>
                  </div>
                )}

                {walletDeduction > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>خصم المحفظة:</span>
                    <span>-{walletDeduction.toFixed(2)} ر.س</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                  <span>المبلغ الإجمالي المستحق:</span>
                  <span className="text-blue-600 text-lg">{finalDueAmount.toFixed(2)} ر.س</span>
                </div>
              </div>

              {/* CTA based on current step */}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>متابعة الخطوة التالية</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmPopup(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد الحجز والدفع النهائي</span>
                </button>
              )}

              <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ضمان NIXT للجودة ورضا العملاء بنسبة 100%</span>
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmPopup && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-right space-y-4 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold text-slate-900">تأكيد سداد وحجز الخدمة</h4>
                <p className="text-xs text-slate-500 mt-1">
                  المبلغ المطلوب: <strong className="text-blue-600">{finalDueAmount.toFixed(2)} ر.س</strong>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 text-slate-600">
                <p><strong>الخدمة:</strong> {activeService.title}</p>
                <p><strong>الموعد:</strong> {bookingDate} ({bookingTimeSlot})</p>
                {isCarService && selectedCar && (
                  <p><strong>السيارة:</strong> {selectedCar.brand} {selectedCar.model}</p>
                )}
                <p><strong>العنوان:</strong> {selectedAddress?.name || 'عنوان العميل'}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  disabled={isProcessing}
                  onClick={handleFinalConfirmPayment}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? 'جاري التأكيد والسداد...' : 'إتمام الحجز والدفع'}
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => setShowConfirmPopup(false)}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

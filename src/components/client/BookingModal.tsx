import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceItem, Car, Address, AddonProduct } from '../../types';
import { CarpetBookingFlow } from './CarpetBookingFlow';
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
  ChevronLeft
} from 'lucide-react';

interface BookingModalProps {
  service?: ServiceItem | null;
  onClose?: () => void;
  onOpenCarModal?: () => void;
  onOpenAddressModal?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  service,
  onClose,
  onOpenCarModal,
  onOpenAddressModal
}) => {
  const {
    bookingService,
    isBookingModalOpen,
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
    openStoreForServiceBooking
  } = useApp();

  const activeService = service || bookingService;

  // Booking step: 1 = Service Details, 2 = Address/Car/Date, 3 = Addons & Notes, 4 = Summary & Payment
  const [step, setStep] = useState<number>(1);
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'moyasar_card' | 'wallet' | 'tabby' | 'tamara' | 'package'>('moyasar_card');
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>('');
  const [showConfirmPopup, setShowConfirmPopup] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string>('');
  const [showCustomSize, setShowCustomSize] = useState<boolean>(false);
  const [customLength, setCustomLength] = useState<string>('');
  const [customWidth, setCustomWidth] = useState<string>('');
  const [showStorePickerModal, setShowStorePickerModal] = useState<boolean>(false);
  const [storeSearchQuery, setStoreSearchQuery] = useState<string>('');
  const [storeActiveCategory, setStoreActiveCategory] = useState<string>('all');

  // Reset booking modal state every time it opens or active service changes
  React.useEffect(() => {
    if (isBookingModalOpen && activeService) {
      setStep(1);
      setIsSuccess(false);
      setShowConfirmPopup(false);
      setIsProcessing(false);
      setConfirmedOrderNumber('');
      setCouponMessage(null);
      setCouponCodeInput('');
      setShowCustomSize(false);

      // Ensure default car is selected if none selected
      if (!selectedCar && cars.length > 0) {
        const defCar = cars.find(c => c.isDefault) || cars[0];
        setSelectedCar(defCar);
      }
      // Ensure default address is selected if none selected
      if (!selectedAddress && addresses.length > 0) {
        const defAddr = addresses.find(a => a.isDefault) || addresses[0];
        setSelectedAddress(defAddr);
      }
    }
  }, [isBookingModalOpen, activeService?.id]);

  const handleClose = () => {
    setStep(1);
    setIsSuccess(false);
    setShowConfirmPopup(false);
    setIsProcessing(false);
    setConfirmedOrderNumber('');
    closeBookingModal();
    if (onClose) onClose();
  };

  // If modal is not open or no service is selected, do not render
  if (!isBookingModalOpen && !service) {
    return null;
  }

  if (!activeService) {
    return null;
  }

  // Check service type
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

  const isHomeOrFacilityService = !isCarpetOrFurniture && !isCarService;

  if (isCarpetOrFurniture) {
    return (
      <CarpetBookingFlow
        service={activeService}
        onClose={handleClose}
        onOpenAddressModal={onOpenAddressModal}
      />
    );
  }

  // Active user subscriptions with remaining washes
  const availableUserSubs = userSubscriptions.filter(s => s.status === 'active' && s.remainingWashes > 0);

  // Available sample dates (representing August 3, 4, 5, 6, 7...)
  const dateOptions = [
    { dateStr: '2026-08-03', dayName: 'الاثنين', dayNum: '3', monthName: 'أغسطس' },
    { dateStr: '2026-08-04', dayName: 'الثلاثاء', dayNum: '4', monthName: 'أغسطس' },
    { dateStr: '2026-08-05', dayName: 'الأربعاء', dayNum: '5', monthName: 'أغسطس' },
    { dateStr: '2026-08-06', dayName: 'الخميس', dayNum: '6', monthName: 'أغسطس' },
    { dateStr: '2026-08-07', dayName: 'الجمعة', dayNum: '7', monthName: 'أغسطس' },
  ];

  // Available sample time slots
  const timeSlots = ['16:30', '18:00', '19:15', '20:50', '22:15', '23:30'];

  // Calculate pricing based on car category (if applicable)
  let baseServicePrice = activeService.price;
  if (!isCarpetOrFurniture && !isACService && selectedCar && activeService.pricingByCarCategory && activeService.pricingByCarCategory[selectedCar.category]) {
    baseServicePrice = activeService.pricingByCarCategory[selectedCar.category];
  }

  const isPayingWithPackage = selectedPaymentMethod === 'package' && !!selectedSubscriptionId;

  // Store products integration for booking
  const handleAddStoreProductToBooking = (prod: any) => {
    const addonId = `store-${prod.id}`;
    const existing = bookingAddons.find(a => a.id === addonId);
    if (existing) {
      updateBookingAddonQuantity(addonId, (existing.quantity || 1) + 1);
    } else {
      toggleBookingAddon({
        id: addonId,
        name: prod.name,
        description: prod.categoryLabel ? `متجر: ${prod.categoryLabel}` : 'منتج متجر أصلي',
        price: prod.price,
        image: prod.image,
        quantity: 1,
        category: isCarpetOrFurniture ? 'carpets' : 'cars'
      });
    }
  };

  const handleNavigateToStore = () => {
    handleClose();
    openStoreForServiceBooking(step, isCarpetOrFurniture ? 'carpets' : 'cars');
  };

  // Filtered and relevant store products
  const relevantStoreProducts = storeProducts.filter(p => {
    if (isCarpetOrFurniture) {
      return (
        p.category === 'carpets' ||
        p.category === 'furniture' ||
        p.category === 'blankets_quilts' ||
        p.category === 'carpet_packaging' ||
        p.category === 'sofa_polishing'
      );
    }
    return (
      p.category === 'car_care' ||
      p.category === 'interior_acc' ||
      p.category === 'exterior_acc' ||
      p.category === 'steam_polishing'
    );
  });
  const displayedStoreProducts = relevantStoreProducts.length > 0 ? relevantStoreProducts : storeProducts;

  const filteredStoreProducts = storeProducts.filter(p => {
    const matchesSearch =
      !storeSearchQuery.trim() ||
      p.name.toLowerCase().includes(storeSearchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(storeSearchQuery.toLowerCase()));

    const matchesCategory =
      storeActiveCategory === 'all' ||
      p.category === storeActiveCategory ||
      (storeActiveCategory === 'carpets' &&
        (p.category === 'carpets' || p.category === 'furniture' || p.category === 'blankets_quilts'));

    return matchesSearch && matchesCategory;
  });

  const addonsTotal = bookingAddons.reduce((sum, a) => sum + (a.price * (a.quantity || 1)), 0);
  const rawSubtotal = isPayingWithPackage ? addonsTotal : (baseServicePrice + addonsTotal);

  // Delivery fee rule: from service or 0
  let deliveryFee = activeService.deliveryCost ?? 0;
  if (activeService.freeDeliveryThreshold && rawSubtotal >= activeService.freeDeliveryThreshold) {
    deliveryFee = 0;
  }

  // Coupon discount calculation: applied ONLY to subtotal, NEVER to delivery
  let discountAmount = 0;
  if (appliedCoupon && !isPayingWithPackage) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (rawSubtotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }
  const subtotalAfterDiscount = Math.max(0, rawSubtotal - discountAmount);

  // VAT (15%) calculation: inclusive total
  const totalAmount = subtotalAfterDiscount + deliveryFee;
  const vatAmount = Math.round((totalAmount * 0.15) * 100) / 100;
  const preVatAmount = Math.round((totalAmount - vatAmount) * 100) / 100;

  const handleApplyCoupon = () => {
    if (!couponCodeInput.trim()) return;
    const result = applyCoupon(couponCodeInput);
    if (result.success) {
      setCouponMessage({ text: result.message, isError: false });
    } else {
      setCouponMessage({ text: result.message, isError: true });
    }
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
      } catch (err: any) {
        setIsProcessing(false);
        alert(err.message || 'حدث خطأ أثناء تنفيذ الحجز');
      }
    }, 1000);
  };

  const renderAddressPicker = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-red-500" />
          <span>موقع تقديم الخدمة (العنوان)</span>
        </label>
        <button
          type="button"
          onClick={onOpenAddressModal}
          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          إضافة عنوان
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {addresses.map(addr => (
          <div
            key={addr.id}
            onClick={() => setSelectedAddress(addr)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
              selectedAddress?.id === addr.id
                ? 'border-red-500 bg-red-50/70 shadow-xs'
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
            <p className="text-[11px] text-slate-500 truncate">{addr.fullAddress}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCarPicker = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
          <CarIcon className="w-4 h-4 text-blue-600" />
          <span>حدد السيارة المراد غسيلها</span>
        </label>
        <button
          type="button"
          onClick={onOpenCarModal}
          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          إضافة سيارة
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {cars.map(c => {
          const priceForThisCar = activeService.pricingByCarCategory && activeService.pricingByCarCategory[c.category]
            ? activeService.pricingByCarCategory[c.category]
            : activeService.price;

          return (
            <div
              key={c.id}
              onClick={() => setSelectedCar(c)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                selectedCar?.id === c.id
                  ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">{c.brand} {c.model}</span>
                <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                  {c.plateNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">الفئة: {c.category === 'suv' ? 'جيب SUV' : 'سيدان'}</span>
                <span className="font-bold text-blue-700">{priceForThisCar.toFixed(2)} ر.س</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDatePicker = () => (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
        <CalendarIcon className="w-4 h-4 text-emerald-600" />
        <span>اختر اليوم المتاح</span>
      </label>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {dateOptions.map(d => (
          <button
            key={d.dateStr}
            type="button"
            onClick={() => setBookingDate(d.dateStr)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border min-w-[76px] transition-all ${
              bookingDate === d.dateStr
                ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-102 font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-[10px] opacity-80">{d.dayName}</span>
            <span className="text-lg font-black">{d.dayNum}</span>
            <span className="text-[9px] opacity-80">{d.monthName}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTimeSlotPicker = () => (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-amber-500" />
        <span>الوقت والفترة المفضلة</span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {timeSlots.map(slot => (
          <button
            key={slot}
            type="button"
            onClick={() => setBookingTimeSlot(slot)}
            className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
              bookingTimeSlot === slot
                ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  );

  const renderAddonsList = () => {
    const displayedAddons = addons.filter(a => {
      if (isCarpetOrFurniture) {
        return a.category === 'carpets' || a.category === 'furniture' || a.category === 'carpets_furniture';
      }
      return !a.category || a.category === 'cars';
    });

    const pricePerMeter = activeService.pricePerMeter || 15;
    const customPrice = (Number(customLength) || 0) * (Number(customWidth) || 0) * pricePerMeter;
    const customAddonId = `custom-size-${customLength}-${customWidth}`;
    const selectedCustomAddon = bookingAddons.find(a => a.id === customAddonId);

    const handleAddCustomSize = () => {
      if (!customLength || !customWidth) return;
      const newAddon = {
        id: customAddonId,
        name: `مقاس مخصص (${customLength}x${customWidth} متر)`,
        price: customPrice,
        image: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=400&q=80',
        category: 'carpets'
      };
      toggleBookingAddon(newAddon);
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-blue-600" />
            <span>{isCarpetOrFurniture ? 'اختر المقاسات المطلوبة' : 'خدمات وإضافات إضافية مميزة'}</span>
          </h4>
          <span className="text-[11px] text-slate-400">اختر ما يناسبك</span>
        </div>

        <div className="space-y-2.5">
          {displayedAddons.map(addon => {
            const selectedAddon = bookingAddons.find(a => a.id === addon.id);
            const isSelected = !!selectedAddon;
            const quantity = selectedAddon?.quantity || 1;

            return (
              <div
                key={addon.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-3 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => {
                    if (!isCarpetOrFurniture) {
                      toggleBookingAddon(addon);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={addon.image}
                      alt={addon.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h5 className="text-xs font-black text-slate-900">{addon.name}</h5>
                      <p className="text-[11px] text-slate-500 leading-tight">{addon.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-black text-blue-700">{addon.price.toFixed(2)} ر.س</span>
                    {!isCarpetOrFurniture && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        isSelected ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    )}
                  </div>
                </div>

                {isCarpetOrFurniture && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                    <span className="text-[11px] font-bold text-slate-600">الكمية المطلوبة:</span>
                    {isSelected ? (
                      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                        <button
                          onClick={() => updateBookingAddonQuantity(addon.id, quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          -
                        </button>
                        <span className="font-black text-sm w-4 text-center">{quantity}</span>
                        <button
                          onClick={() => updateBookingAddonQuantity(addon.id, quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleBookingAddon(addon)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        أضف للسلة
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Custom Size Option for Carpets/Furniture */}
          {isCarpetOrFurniture && (
            <div className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-3 ${
              showCustomSize ? 'border-blue-600 bg-blue-50/70 shadow-xs' : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowCustomSize(!showCustomSize)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900">أخرى (مقاس مخصص)</h5>
                    <p className="text-[11px] text-slate-500 leading-tight">أدخل مقاسات السجاد غير المتوفرة في القائمة ({pricePerMeter} ر.س / للمتر)</p>
                  </div>
                </div>
              </div>

              {showCustomSize && (
                <div className="pt-3 border-t border-slate-200/50 space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 mb-1 block">الطول (متر)</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={customLength}
                        onChange={e => setCustomLength(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                        placeholder="مثال: 3"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 mb-1 block">العرض (متر)</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={customWidth}
                        onChange={e => setCustomWidth(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                        placeholder="مثال: 4"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500">التكلفة الإجمالية:</span>
                      <span className="font-black text-blue-700 text-sm">{customPrice.toFixed(2)} ر.س</span>
                    </div>
                    
                    {selectedCustomAddon ? (
                      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                        <button
                          onClick={() => updateBookingAddonQuantity(customAddonId, (selectedCustomAddon.quantity || 1) - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          -
                        </button>
                        <span className="font-black text-sm w-4 text-center">{selectedCustomAddon.quantity || 1}</span>
                        <button
                          onClick={() => updateBookingAddonQuantity(customAddonId, (selectedCustomAddon.quantity || 1) + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleAddCustomSize}
                        disabled={!customLength || !customWidth || Number(customLength) <= 0 || Number(customWidth) <= 0}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-[11px] font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                      >
                        أضف للسلة
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STORE INTEGRATION: Ability to go to store or add store products to the service */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-sky-50/40 to-blue-50 border border-amber-200/90 shadow-2xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">منتجات وعناية إضافية من المتجر</span>
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                      تصل مع الكابتن 🚚
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                    أضف معطرات، مناشف مايكروفايبر، أو ملمعات أصلية لتصلك مع الكابتن أثناء تنفيذ الخدمة أو انتقل للمتجر
                  </p>
                </div>
              </div>
            </div>

            {/* Quick recommended store products horizontally scrollable */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700">منتجات مقترحة للخدمة:</span>
                <button
                  type="button"
                  onClick={() => setShowStorePickerModal(true)}
                  className="text-blue-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>عرض الكل ({storeProducts.length})</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
                {displayedStoreProducts.slice(0, 6).map(prod => {
                  const addonId = `store-${prod.id}`;
                  const selected = bookingAddons.find(a => a.id === addonId);
                  const qty = selected?.quantity || 0;
                  return (
                    <div
                      key={prod.id}
                      className={`flex-shrink-0 w-44 p-2.5 rounded-xl border bg-white transition-all flex flex-col justify-between gap-2 shadow-2xs ${
                        selected
                          ? 'border-amber-400 ring-1 ring-amber-400/40 bg-amber-50/40'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-100"
                        />
                        <div className="min-w-0 flex-1">
                          <h6 className="text-[11px] font-bold text-slate-800 line-clamp-1" title={prod.name}>
                            {prod.name}
                          </h6>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] font-black text-amber-600">{prod.price.toFixed(2)} ر.س</span>
                            {prod.originalPrice && (
                              <span className="text-[9px] text-slate-400 line-through">{prod.originalPrice.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {selected ? (
                        <div className="flex items-center justify-between bg-amber-100/70 rounded-lg p-1 border border-amber-300">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBookingAddonQuantity(addonId, qty - 1);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded bg-white text-slate-700 font-black hover:bg-slate-50 cursor-pointer shadow-2xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-black text-slate-900">{qty}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBookingAddonQuantity(addonId, qty + 1);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded bg-white text-slate-700 font-black hover:bg-slate-50 cursor-pointer shadow-2xs"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddStoreProductToBooking(prod);
                          }}
                          className="w-full py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>أضف للخدمة</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Transition & Browse Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-2 border-t border-amber-200/60 gap-2">
              <button
                type="button"
                onClick={() => setShowStorePickerModal(true)}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center justify-center gap-1.5 cursor-pointer bg-white px-3 py-2 rounded-xl border border-blue-200 shadow-2xs hover:bg-blue-50/70 transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-blue-600" />
                <span>تصفح كل منتجات المتجر واختيارها</span>
              </button>

              <button
                type="button"
                onClick={handleNavigateToStore}
                className="text-[11px] font-black text-slate-900 hover:text-black flex items-center justify-center gap-1.5 cursor-pointer bg-amber-400 hover:bg-amber-300 px-3.5 py-2 rounded-xl shadow-2xs transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>الانتقال إلى المتجر كاملاً 🛍️</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBookingNotes = () => (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-900 block">
        ملاحظات إضافية للكابتن (رقم الموقف، مكان المفتاح، تعليمات خاصة):
      </label>
      <textarea
        value={bookingNotes}
        onChange={e => setBookingNotes(e.target.value)}
        placeholder="مثال: السيارة في الموقف رقم 14 بجوار البوابة الجنوبية..."
        className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-24 bg-slate-50"
      />
    </div>
  );

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <OrderSuccessScreen
            orderNumber={confirmedOrderNumber}
            serviceTitle={activeService.title}
            onBackToHome={() => {
              handleClose();
              setCurrentScreen('home');
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-right animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"
                title="الرجوع"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{activeService.title}</span>
                <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  {step === 1 && 'تفاصيل الخدمة'}
                  {step === 2 && (isCarpetOrFurniture ? 'إضافات وملاحظات' : 'الموقع والموعد')}
                  {step === 3 && (isCarpetOrFurniture ? 'الموقع والموعد' : 'إضافات وملاحظات')}
                  {step === 4 && 'ملخص الحجز والدفع'}
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-step progress bar */}
        <div className="bg-slate-100 p-2 px-6 flex items-center justify-between border-b border-slate-200 text-xs font-medium text-slate-500 shrink-0">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-blue-600 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-300'}`}>1</span>
            <span>الخدمة</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-2" />
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-blue-600 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-300'}`}>2</span>
            <span>{isCarpetOrFurniture ? 'الإضافات' : (isCarService ? 'الموعد والسيارة' : 'الموعد والعنوان')}</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-2" />
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-blue-600 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-300'}`}>3</span>
            <span>{isCarpetOrFurniture ? 'الموعد والعنوان' : 'الإضافات'}</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-2" />
          <div className={`flex items-center gap-1.5 ${step >= 4 ? 'text-blue-600 font-bold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-slate-300'}`}>4</span>
            <span>الدفع والتأكيد</span>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-right">
          
          {/* STEP 1: SERVICE DETAILS & INCLUSIONS (Matching Screenshot 14 & 15) */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="relative h-48 rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={activeService.image}
                  alt={activeService.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                  <div className="text-white space-y-1">
                    <span className="text-[11px] bg-blue-600 px-2.5 py-0.5 rounded-full font-semibold">
                      {activeService.tag || 'الأكثر طلباً'}
                    </span>
                    <h4 className="text-lg font-bold text-white">{activeService.title}</h4>
                  </div>
                </div>
              </div>

              {/* Price & Car Type indication */}
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">السعر الأساسي للخدمة</span>
                  <div className="text-xl font-bold text-blue-700">
                    {baseServicePrice.toFixed(2)} <span className="text-xs font-semibold">ر.س</span>
                  </div>
                </div>
                <div className="text-left text-xs">
                  <span className="text-slate-500 block">المدة التقديرية</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    {activeService.estimatedDuration || '45 دقيقة'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {activeService.description}
              </p>

              {/* Inclusions Checklist matching Screenshot 14 */}
              <div className="space-y-2 pt-1">
                <h5 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>ما تشمله هذه الخدمة:</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeService.includes.map((inc, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-bold text-slate-700">{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DYNAMIC (Car+Address+Date OR Addons) */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              {isCarpetOrFurniture ? (
                <>
                  {renderAddonsList()}
                  {renderBookingNotes()}
                </>
              ) : (
                <>
                  {renderAddressPicker()}
                  {isCarService && renderCarPicker()}
                  {isHomeOrFacilityService && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="font-black text-blue-950 block">خدمة ميدانية / منزلية عند موقعك</span>
                        <span className="text-blue-800 text-[11px]">سيصل فريق العمل المتخصص بكامل المعدات والمواد المعتمدة إلى عنوانك المحدد.</span>
                      </div>
                    </div>
                  )}
                  {renderDatePicker()}
                  {renderTimeSlotPicker()}
                </>
              )}
            </div>
          )}

          {/* STEP 3: DYNAMIC (Addons OR Address+Date) */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              {isCarpetOrFurniture ? (
                <>
                  {renderAddressPicker()}
                  {renderDatePicker()}
                  {renderTimeSlotPicker()}
                </>
              ) : (
                <>
                  {renderAddonsList()}
                  {renderBookingNotes()}
                </>
              )}
            </div>
          )}

          {/* STEP 4: SUMMARY & PAYMENT (Matching Screenshot 15 & BRD) */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in">
              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-900 pb-2 border-b border-slate-200">
                  ملخص حجز الخدمة
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">الخدمة المختارة:</span>
                    <span className="font-bold text-slate-800">{activeService.title}</span>
                  </div>
                  {!isCarpetOrFurniture && isCarService && selectedCar && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">المركبة:</span>
                      <span className="font-bold text-slate-800">
                        {selectedCar.brand} {selectedCar.model} ({selectedCar.plateNumber})
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 block text-[10px]">العنوان:</span>
                    <span className="font-bold text-slate-800">{selectedAddress?.name} ({selectedAddress?.city})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">الموعد:</span>
                    <span className="font-bold text-blue-700">{bookingDate} | {bookingTimeSlot}</span>
                  </div>
                </div>

                {/* Inclusions / Addons and Store Products list */}
                {bookingAddons.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 block mb-1">الإضافات ومنتجات المتجر المحددة:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {bookingAddons.map(a => {
                        const isStore = a.id.startsWith('store-');
                        return (
                          <span
                            key={a.id}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs ${
                              isStore
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isStore ? (
                              <ShoppingBag className="w-3 h-3 text-amber-600" />
                            ) : (
                              <span>+</span>
                            )}
                            <span>{a.name}</span>
                            {a.quantity && a.quantity > 1 ? (
                              <span className="font-black bg-white/70 px-1 rounded text-[9px]">x{a.quantity}</span>
                            ) : null}
                            <span className="opacity-75">({(a.price * (a.quantity || 1)).toFixed(2)} ر.س)</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Package/Subscription Payment Option */}
              {availableUserSubs.length > 0 && !isCarpetOrFurniture && !isACService && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-black text-amber-950">هل تريد الخصم من باقتك المشترك بها؟</span>
                    </div>
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
                              ? 'bg-amber-100/90 border-amber-500 shadow-xs'
                              : 'bg-white border-amber-200/80 hover:bg-amber-50/50'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-black text-slate-900 block">{sub.packageName}</span>
                            <span className="text-[11px] text-amber-800">
                              متبقي لك {sub.remainingWashes} من أصل {sub.totalWashes} غسلة (صالح حتى {sub.expiryDate})
                            </span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-amber-600 text-white border-amber-600' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Coupon Input (only when not paying with package wash) */}
              {!isPayingWithPackage && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">كوبون الخصم أو كود العرض</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="أدخل كود الخصم (مثال: X25)"
                        className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                      />
                      <Tag className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all"
                    >
                      تطبيق
                    </button>
                  </div>

                  {couponMessage && (
                    <p className={`text-[11px] font-bold ${couponMessage.isError ? 'text-red-600' : 'text-emerald-600'}`}>
                      {couponMessage.text}
                    </p>
                  )}

                  {appliedCoupon && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
                      <span>كوبون مفعل: {appliedCoupon.code} ({appliedCoupon.title})</span>
                      <button onClick={removeCoupon} className="text-red-500 hover:underline text-[11px]">
                        إلغاء
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing Breakdown */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">
                    {activeService.title} (1)
                    {isPayingWithPackage && <span className="text-amber-600 font-bold mr-1">(مغطاة بالباقة)</span>}
                  </span>
                  <span className="font-bold text-slate-800">
                    {isPayingWithPackage ? '0.00 ر.س' : `${baseServicePrice.toFixed(2)} ر.س`}
                  </span>
                </div>

                {addonsTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">إجمالي الخدمات الإضافية</span>
                    <span className="font-bold text-slate-800">{addonsTotal.toFixed(2)} ر.س</span>
                  </div>
                )}

                {deliveryFee > 0 ? (
                  <div className="flex justify-between text-slate-600">
                    <span>رسوم الخدمة والانتقال</span>
                    <span className="font-bold text-slate-800">{deliveryFee.toFixed(2)} ر.س</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>رسوم الانتقال</span>
                    <span>مجاناً</span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>خصم الكوبون (على الخدمات)</span>
                    <span>- {discountAmount.toFixed(2)} ر.س</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                  <span>ضريبة القيمة المضافة (15% شاملة)</span>
                  <span>{vatAmount.toFixed(2)} ر.س</span>
                </div>

                <div className="flex justify-between font-bold text-sm text-blue-700 pt-2 border-t border-slate-200">
                  <span>المبلغ الإجمالي للدفع</span>
                  <span className="text-base">{totalAmount.toFixed(2)} ر.س</span>
                </div>
              </div>

              {/* Payment Methods Selection (if remaining totalAmount > 0 and not full package covered) */}
              {totalAmount > 0 ? (
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-900 block">اختر طريقة دفع المبلغ المتبقي</label>

                  {/* Wallet balance option */}
                  <div
                    onClick={() => {
                      if (walletBalance >= totalAmount) {
                        setSelectedPaymentMethod('wallet');
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      selectedPaymentMethod === 'wallet'
                        ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                        : walletBalance < totalAmount
                        ? 'border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">المحفظة الإلكترونية</span>
                        <span className="text-[11px] text-slate-500">رصيدك الحالي: {walletBalance.toFixed(2)} ر.س</span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedPaymentMethod === 'wallet' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300'
                    }`}>
                      {selectedPaymentMethod === 'wallet' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Card payment (Mada / Visa) */}
                  <div
                    onClick={() => setSelectedPaymentMethod('moyasar_card')}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      selectedPaymentMethod === 'moyasar_card'
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">بطاقة مدى / البطاقات الائتمانية / Apple Pay</span>
                        <span className="text-[11px] text-slate-500">دفع إلكتروني آمن وفوري</span>
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
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      selectedPaymentMethod === 'tabby'
                        ? 'border-emerald-400 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-[#3BFF9C] text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg">
                        tabby
                      </span>
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
                        ? 'border-amber-400 bg-amber-50/70 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-[#FF9478] text-white font-black text-xs px-2.5 py-1 rounded-lg">
                        tamara
                      </span>
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
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تمت تغطية كامل قيمة هذا الطلب بواسطة باقتك النشطة! لن يتم خصم أي مبالغ إضافية.</span>
                </div>
              )}

              {/* Policy & Cancellation Guarantee Notice as per Workflow */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-xs text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>سياسة الإلغاء وضمان الخدمة</span>
                </div>
                <p className="leading-relaxed">
                  يمكنك إلغاء الحجز واسترداد كامل المبلغ إلى محفظتك الإلكترونية قبل موعد الخدمة المحدد بأكثر من ساعة واحدة، وقبل تحرك الكابتن الميداني إلى موقعك.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">المجموع الكلي:</span>
            <span className="text-lg font-bold text-blue-700">
              {totalAmount.toFixed(2)} ر.س
            </span>
          </div>

          <div className="flex items-center gap-2">
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                متابعة
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmPopup(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                اتمام الطلب و الدفع
              </button>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmPopup && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-right space-y-4 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold text-slate-900">
                  تأكيد سداد وحجز الخدمة
                </h4>
                <p className="text-xs text-slate-500 mt-1 font-normal">
                  المبلغ المطلوب: {totalAmount.toFixed(2)} ر.س
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600">
                <p><strong>الموعد:</strong> {bookingDate} ({bookingTimeSlot})</p>
                {isCarService && selectedCar && <p><strong>السيارة:</strong> {selectedCar.brand} {selectedCar.model}</p>}
                <p><strong>العنوان:</strong> {selectedAddress?.name || 'عنوان العميل'}</p>
                <p><strong>طريقة السداد:</strong> {selectedPaymentMethod === 'moyasar_card' ? 'بطاقة مدى / ائتمان' : selectedPaymentMethod === 'wallet' ? 'المحفظة الإلكترونية' : selectedPaymentMethod === 'tabby' ? 'تابي' : selectedPaymentMethod === 'tamara' ? 'تمارا' : 'باقة مسبقة الدفع'}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  disabled={isProcessing}
                  onClick={handleFinalConfirmPayment}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <span>جاري التأكيد...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      اتمام الطلب و الدفع
                    </>
                  )}
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

        {/* Store Picker Modal / Dialog for browsing and selecting store items */}
        {showStorePickerModal && (
          <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">إضافة منتجات من المتجر للخدمة</h3>
                    <p className="text-[11px] text-slate-300">اختر من المنتجات الأصلية لتصلك مع الكابتن أثناء تنفيذ الطلب</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStorePickerModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filters & Search */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2.5 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={storeSearchQuery}
                    onChange={e => setStoreSearchQuery(e.target.value)}
                    placeholder="ابحث عن معطر، ملمع، منشفة، شامبو سجاد..."
                    className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  {storeSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setStoreSearchQuery('')}
                      className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      مسح
                    </button>
                  )}
                </div>

                {/* Category tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'car_care', label: 'العناية والتلميع' },
                    { id: 'interior_acc', label: 'معطرات واكسسوارات' },
                    { id: 'exterior_acc', label: 'اكسسوارات خارجية' },
                    { id: 'carpets', label: 'السجاد والمفروشات' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setStoreActiveCategory(cat.id)}
                      className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-bold transition-all cursor-pointer ${
                        storeActiveCategory === cat.id
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products List */}
              <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                {filteredStoreProducts.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-bold">لا توجد منتجات تطابق بحثك</p>
                  </div>
                ) : (
                  filteredStoreProducts.map(prod => {
                    const addonId = `store-${prod.id}`;
                    const selected = bookingAddons.find(a => a.id === addonId);
                    const qty = selected?.quantity || 0;

                    return (
                      <div
                        key={prod.id}
                        className={`p-3 rounded-2xl border transition-all flex gap-3 ${
                          selected
                            ? 'border-amber-400 bg-amber-50/50 shadow-xs ring-1 ring-amber-400/30'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                        />
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] text-slate-400 font-medium truncate">
                                {prod.categoryLabel || 'منتج أصلي'}
                              </span>
                              {prod.rating && (
                                <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold">
                                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                                  <span>{prod.rating}</span>
                                </div>
                              )}
                            </div>
                            <h5 className="text-xs font-bold text-slate-900 line-clamp-1" title={prod.name}>
                              {prod.name}
                            </h5>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs font-black text-amber-600">{prod.price.toFixed(2)} ر.س</span>
                              {prod.originalPrice && (
                                <span className="text-[10px] text-slate-400 line-through">
                                  {prod.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action controls */}
                          <div className="pt-2 flex items-center justify-end">
                            {selected ? (
                              <div className="flex items-center gap-2 bg-amber-100 rounded-lg p-0.5 border border-amber-300">
                                <button
                                  type="button"
                                  onClick={() => updateBookingAddonQuantity(addonId, qty - 1)}
                                  className="w-6 h-6 flex items-center justify-center rounded bg-white text-slate-800 font-bold hover:bg-slate-50 cursor-pointer shadow-2xs"
                                >
                                  -
                                </button>
                                <span className="text-xs font-black text-slate-900 w-4 text-center">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => updateBookingAddonQuantity(addonId, qty + 1)}
                                  className="w-6 h-6 flex items-center justify-center rounded bg-white text-slate-800 font-bold hover:bg-slate-50 cursor-pointer shadow-2xs"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddStoreProductToBooking(prod)}
                                className="py-1 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                              >
                                <Plus className="w-3 h-3" />
                                <span>أضف للخدمة</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
                <div className="text-xs flex items-center gap-1.5">
                  <span className="text-slate-500">المنتجات المضافة للخدمة:</span>
                  <span className="font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                    {bookingAddons.filter(a => a.id.startsWith('store-')).reduce((sum, a) => sum + (a.quantity || 1), 0)} قطعة
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleNavigateToStore}
                    className="flex-1 sm:flex-none text-xs font-bold text-slate-700 hover:text-slate-950 px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>الذهاب لصفحة المتجر الرئيسية</span>
                    <ArrowLeft className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowStorePickerModal(false)}
                    className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>تأكيد والعودة للحجز</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

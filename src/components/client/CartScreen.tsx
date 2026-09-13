import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import {
  Trash2,
  Plus,
  Minus,
  MapPin,
  Truck,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Wallet,
  Tag,
  Percent,
  X,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Lock,
  Package,
  Clock,
  RotateCcw
} from 'lucide-react';

interface CartScreenProps {
  onOpenAddressModal?: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({ onOpenAddressModal }) => {
  const {
    cart,
    updateCartQty,
    removeFromCart,
    clearCart,
    cartTotal,
    selectedAddress,
    setCurrentScreen,
    checkoutCart,
    setSelectedOrderForTracking,
    walletBalance,
    useWalletBalance,
    setUseWalletBalance,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useApp();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'moyasar_card' | 'wallet' | 'tabby' | 'tamara'>('moyasar_card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Calculations matching AppContext delivery logic
  const rawSubtotal = cartTotal;
  const freeDeliveryThreshold = 150;
  let calculatedDelivery = cart.reduce((max, item) => Math.max(max, item.product.deliveryCost ?? 15), 0);
  const isFreeDelivery = rawSubtotal >= freeDeliveryThreshold;
  if (isFreeDelivery) {
    calculatedDelivery = 0;
  }
  const deliveryFee = calculatedDelivery;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - rawSubtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((rawSubtotal / freeDeliveryThreshold) * 100));

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (cartTotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const finalSubtotalAfterDiscount = Math.max(0, cartTotal - discountAmount);
  const rawTotal = finalSubtotalAfterDiscount + deliveryFee;

  // Wallet deduction calculation
  const walletDeduction = useWalletBalance ? Math.min(walletBalance, rawTotal) : 0;
  const netPayableAmount = Math.max(0, rawTotal - walletDeduction);

  const vatAmount = Math.round((rawTotal * 0.15) * 100) / 100;
  const grandTotal = rawTotal;

  const handleOpenAddressPicker = () => {
    if (onOpenAddressModal) {
      onOpenAddressModal();
    } else {
      setCurrentScreen('addresses');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCodeInput).trim();
    if (!code) {
      setCouponFeedback({ type: 'error', message: 'يرجى إدخال رمز الكوبون أولاً' });
      return;
    }

    const res = applyCoupon(code);
    if (res.success) {
      setCouponFeedback({ type: 'success', message: res.message });
      setCouponCodeInput('');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      setCouponFeedback({ type: 'error', message: res.message });
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponFeedback(null);
    setCouponCodeInput('');
  };

  const handleCheckoutSubmit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const order = checkoutCart(selectedPaymentMethod);
        setIsProcessing(false);

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 }
        });

        setSelectedOrderForTracking(order);
        setCurrentScreen('orders');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err: any) {
        setIsProcessing(false);
        alert(err.message || 'حدث خطأ أثناء تنفيذ الطلب');
      }
    }, 800);
  };

  // 1. Empty Cart View
  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 sm:py-20 text-center space-y-8 animate-in fade-in duration-300">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center mx-auto text-blue-600 shadow-xs">
          <ShoppingBag className="w-12 h-12" />
        </div>

        <div className="space-y-3 max-w-md mx-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            سلة المشتريات فارغة
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            لم تقم بإضافة أي منتجات من متجر نكست بعد. تصفح أحدث إكسسوارات السيارات، مستلزمات العناية الفاخرة، والمعطرات الحصرية الآن.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setCurrentScreen('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>تصفح منتجات المتجر</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setCurrentScreen('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-bold px-6 py-3.5 rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>العودة للرئيسية</span>
          </button>
        </div>

        {/* Feature Highlights on empty state */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-8 border-t border-slate-200 text-right">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">شحن مجاني</h4>
              <p className="text-[11px] text-slate-500">للطلبات فوق 150 ر.س</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">منتجات أصلية 100%</h4>
              <p className="text-[11px] text-slate-500">ضمان الجودة والاعتمادية</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">استرجاع سهل</h4>
              <p className="text-[11px] text-slate-500">خلال 3 أيام من الاستلام</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Full Website 2-Column Cart Layout
  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Website Breadcrumb & Page Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-medium">
            <button
              onClick={() => {
                setCurrentScreen('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-blue-600 transition-colors"
            >
              الرئيسية
            </button>
            <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400" />
            <button
              onClick={() => {
                setCurrentScreen('store');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-blue-600 transition-colors"
            >
              متجر نكست
            </button>
            <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400" />
            <span className="text-slate-900 font-bold">سلة المشتريات والدفع</span>
          </nav>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>سلة المشتريات</span>
            <span className="text-sm font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              {cart.reduce((total, i) => total + i.quantity, 0)} قطع
            </span>
          </h1>
        </div>

        <button
          onClick={() => {
            setCurrentScreen('store');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
        >
          <span>متابعة التسوق وإضافة منتجات</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Free Shipping Progress Indicator (Website E-commerce Pattern) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isFreeDelivery ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              <Truck className="w-4 h-4" />
            </div>
            <div>
              {isFreeDelivery ? (
                <p className="text-xs sm:text-sm font-black text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  تهانينا! لقد حصلت على توصيل مجاني لطلبك
                </p>
              ) : (
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  أضف منتجات بقيمة <span className="font-black text-blue-600">{remainingForFreeDelivery.toFixed(2)} ر.س</span> إضافية للتأهل للشحن المجاني!
                </p>
              )}
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {cartTotal.toFixed(2)} / {freeDeliveryThreshold} ر.س
          </span>
        </div>

        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isFreeDelivery ? 'bg-emerald-500' : 'bg-blue-600'
            }`}
            style={{ width: `${freeDeliveryProgress}%` }}
          />
        </div>
      </div>

      {/* 2-Column Web Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Column (Products list + Delivery address + Shipping info) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Cart Items Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-black text-slate-900">
                  قائمة المنتجات المحددة ({cart.length})
                </h2>
              </div>

              {showClearConfirm ? (
                <div className="flex items-center gap-2 animate-in fade-in">
                  <span className="text-xs text-red-600 font-bold">تأكيد التفريغ؟</span>
                  <button
                    onClick={() => {
                      clearCart();
                      setShowClearConfirm(false);
                    }}
                    className="text-xs font-black text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-lg"
                  >
                    نعم
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded-lg"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تفريغ السلة بالكامل</span>
                </button>
              )}
            </div>

            {/* Product Rows */}
            <div className="divide-y divide-slate-100">
              {cart.map(item => {
                const itemTotal = item.product.price * item.quantity;

                return (
                  <div
                    key={item.product.id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Product Thumbnail & Details */}
                    <div className="flex items-start sm:items-center gap-4 flex-1">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                      />
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                            {item.product.category || 'منتجات المتجر'}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            توصيل سريع
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                          {item.product.name}
                        </h3>

                        <div className="flex items-baseline gap-2 pt-0.5">
                          <span className="text-xs sm:text-sm font-black text-blue-700">
                            {item.product.price.toFixed(2)} ر.س
                          </span>
                          <span className="text-[11px] text-slate-400">للقطعة الواحدة</span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper, Item Total & Delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Interactive Stepper */}
                      <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200">
                        <button
                          onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer active:scale-95"
                          title="تقليل الكمية"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-black px-2 min-w-[28px] text-center font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer active:scale-95"
                          title="زيادة الكمية"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total for this line */}
                      <div className="text-left sm:min-w-[100px]">
                        <span className="text-[11px] text-slate-400 block sm:hidden">الإجمالي:</span>
                        <span className="text-base font-black text-slate-900 font-mono">
                          {itemTotal.toFixed(2)} ر.س
                        </span>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="إزالة المنتج من السلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Address & Shipping Details Box (Web-Native Banner) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">موقع وعنوان توصيل الشحنة</h3>
                  <p className="text-xs text-slate-500">سيتم توجيه مندوب التوصيل المعتمد إلى هذا العنوان</p>
                </div>
              </div>

              <button
                onClick={handleOpenAddressPicker}
                className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 px-4 py-2 rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
              >
                تغيير العنوان أو الموقع
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">
                    {selectedAddress?.name || 'المنزل الافتراضي'}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    العنوان المعتمد
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {selectedAddress?.city || 'جدة'}، {selectedAddress?.district || 'حي الروضة'} - {selectedAddress?.street || 'شارع الأمير سلطان'}
                </p>
                {selectedAddress?.building && (
                  <p className="text-[11px] text-slate-500">
                    مبنى رقم: {selectedAddress.building} {selectedAddress.apartment ? `، شقة/مكتب: ${selectedAddress.apartment}` : ''}
                  </p>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shrink-0">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>التسليم المتوقع: 1 - 3 أيام عمل</span>
              </div>
            </div>
          </div>

          {/* E-Commerce Guarantee Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">ضمان ذهبي للاسترجاع</h4>
                <p className="text-[11px] text-slate-500">إمكانية الاسترجاع خلال 3 أيام</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">دفع إلكتروني آمن 100%</h4>
                <p className="text-[11px] text-slate-500">معتمد من البنك المركزي ميسر</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">مكافآت ونقاط ولاء</h4>
                <p className="text-[11px] text-slate-500">اكسب نقاطاً مع كل عملية شراء</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right / Sticky Sidebar (Order Summary + Coupon Code + Payment Methods + CTA) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">ملخص الطلب والفاتورة</h3>
              <span className="text-xs font-bold text-slate-400">
                {cart.length} {cart.length === 1 ? 'منتج مختلف' : 'منتجات مختلفة'}
              </span>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>المجموع الفرعي للمنتجات:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{cartTotal.toFixed(2)} ر.س</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-500" />
                  رسوم الشحن والتوصيل:
                </span>
                {deliveryFee === 0 ? (
                  <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    مجاني
                  </span>
                ) : (
                  <span className="font-bold text-slate-900 font-mono">{deliveryFee.toFixed(2)} ر.س</span>
                )}
              </div>

              {/* Coupon Discount if active */}
              {appliedCoupon && discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-emerald-600" />
                    خصم الكوبون ({appliedCoupon.code}):
                  </span>
                  <span className="font-mono text-emerald-700">- {discountAmount.toFixed(2)} ر.س</span>
                </div>
              )}

              {/* Wallet deduction if active */}
              {useWalletBalance && walletDeduction > 0 && (
                <div className="flex items-center justify-between text-blue-700 bg-blue-50/70 p-2.5 rounded-xl border border-blue-200 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-blue-600" />
                    رصيد المحفظة المستخدم:
                  </span>
                  <span className="font-mono text-blue-700">- {walletDeduction.toFixed(2)} ر.س</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-100 text-[11px]">
                <span>ضريبة القيمة المضافة (15% مشمولة):</span>
                <span className="font-mono">{vatAmount.toFixed(2)} ر.س</span>
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-600 block">المبلغ المطلوب سداده</span>
                  <span className="text-[10px] text-slate-400">شامل كافة الرسوم والضريبة</span>
                </div>
                <div className="text-left">
                  <span className="text-2xl font-black text-blue-600 font-mono">
                    {(useWalletBalance ? netPayableAmount : grandTotal).toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-slate-700 mr-1">ر.س</span>
                </div>
              </div>
            </div>

            {/* Promo / Coupon Code Section */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>كود الخصم الترويجي</span>
                </div>
                {appliedCoupon && (
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline"
                  >
                    حذف الكوبون
                  </button>
                )}
              </div>

              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-black text-emerald-900 block">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        {appliedCoupon.title}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-800 font-mono">
                    وفّرت {discountAmount.toFixed(2)} ر.س
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={e => {
                        setCouponCodeInput(e.target.value);
                        if (couponFeedback) setCouponFeedback(null);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleApplyCoupon();
                      }}
                      placeholder="أدخل الرمز مثل X25 أو NEW"
                      className="flex-1 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      تطبيق
                    </button>
                  </div>

                  {couponFeedback && (
                    <div
                      className={`text-xs p-2.5 rounded-xl flex items-center gap-1.5 ${
                        couponFeedback.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {couponFeedback.type === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      )}
                      <span>{couponFeedback.message}</span>
                    </div>
                  )}

                  {/* Suggested Coupons Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      مقترح:
                    </span>
                    {[
                      { code: 'X25', label: 'خصم 25%' },
                      { code: 'NEW', label: 'عميل جديد 15%' },
                      { code: 'NNT', label: '20 ر.س' }
                    ].map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleApplyCoupon(c.code)}
                        className="bg-slate-100 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md transition-all font-mono"
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Wallet Deduct Option */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">رصيد محفظتي الإلكترونية</span>
                    <span className="text-[11px] text-slate-500">
                      المتاح حالياً: {walletBalance.toFixed(2)} ر.س
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={useWalletBalance}
                  onChange={e => setUseWalletBalance(e.target.checked)}
                  disabled={walletBalance <= 0}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </label>
            </div>

            {/* Payment Method Selector (Web Native Integration) */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <span className="text-xs font-black text-slate-900 block">اختر وسيلة الدفع</span>

              <div className="space-y-2">
                {/* Mada / Apple Pay */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('moyasar_card')}
                  className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                    selectedPaymentMethod === 'moyasar_card'
                      ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">مدى / بطاقة ائتمانية / Apple Pay</span>
                      <span className="text-[10px] text-slate-500">دفع فوري سريع وآمن عبر بوابة ميسر</span>
                    </div>
                  </div>
                  {selectedPaymentMethod === 'moyasar_card' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </button>

                {/* Tabby */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('tabby')}
                  className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                    selectedPaymentMethod === 'tabby'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px]">
                      T
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-900 block">تابي Tabby (4 دفعات بدون فوائد)</span>
                      <span className="text-[10px] text-slate-500">قسّم فاتورتك على 4 أقساط شهرية مريحة</span>
                    </div>
                  </div>
                  {selectedPaymentMethod === 'tabby' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </button>

                {/* Tamara */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('tamara')}
                  className={`w-full p-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                    selectedPaymentMethod === 'tamara'
                      ? 'border-pink-600 bg-pink-50/60 ring-1 ring-pink-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-pink-500 text-white flex items-center justify-center font-bold text-[9px]">
                      T
                    </div>
                    <div>
                      <span className="text-xs font-bold text-pink-900 block">تمارا Tamara (قسّطها بروقان)</span>
                      <span className="text-[10px] text-slate-500">حلول دفع مرنة ومتوافقة مع الشريعة</span>
                    </div>
                  </div>
                  {selectedPaymentMethod === 'tamara' && (
                    <CheckCircle2 className="w-4 h-4 text-pink-600 shrink-0" />
                  )}
                </button>
              </div>
            </div>

            {/* Primary Checkout CTA */}
            <div className="pt-2">
              <button
                disabled={isProcessing}
                onClick={handleCheckoutSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري معالجة الطلب والدفع...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>إتمام الطلب والدفع الآمن ({(useWalletBalance ? netPayableAmount : grandTotal).toFixed(2)} ر.س)</span>
                  </>
                )}
              </button>
            </div>

            {/* Security and Return notice under CTA */}
            <div className="text-center pt-2">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                معاملة مشفرة ومحمية ببروتوكول SSL آمن 256-bit
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceItem } from '../../types';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  Gift,
  Info,
  CheckCircle2,
  ListFilter,
  Star,
  Wallet,
  CreditCard,
  ShoppingBag,
  ShieldCheck,
  X,
  Check,
  Sparkles,
  ChevronLeft,
  Calendar,
  Layers
} from 'lucide-react';

interface PackageDetailModalProps {
  packageItem?: ServiceItem | null;
  onClose?: () => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  packageItem,
  onClose,
}) => {
  const {
    selectedPackageForDetail,
    isPackageDetailOpen,
    closePackageDetail,
    walletBalance,
    purchasePackage,
    setCurrentScreen,
    setActiveServiceTab
  } = useApp();

  const activePkg = packageItem || selectedPackageForDetail;

  const [useWallet, setUseWallet] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'apple_pay' | 'tamara' | 'tabby'>('card');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPurchasedSuccess, setIsPurchasedSuccess] = useState<boolean>(false);
  const [subscribedPlanName, setSubscribedPlanName] = useState<string>('');

  if (!isPackageDetailOpen && !packageItem) {
    return null;
  }

  if (!activePkg) {
    return null;
  }

  const handleClose = () => {
    setShowConfirmModal(false);
    setIsPurchasedSuccess(false);
    closePackageDetail();
    if (onClose) onClose();
  };

  const washCount = activePkg.id === 'pkg-2' ? 5 : activePkg.id === 'pkg-3' ? 8 : 3;
  const washPerPrice = (activePkg.price / washCount).toFixed(0);

  // Reviews list matching screenshot
  const reviews = [
    {
      id: 'rev-1',
      name: 'صالح احمد',
      date: 'الثلاثاء، 1 سبتمبر 2026',
      rating: 5,
      comment: 'ماشاء الله خدمة ممتازة وحضور قبل الموعد ونظافة واهتمام عالي جداً بالسيارة.',
      initial: 'ص',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'rev-2',
      name: 'طارق ال...',
      date: 'الثلاثاء، 1 سبتمبر 2026',
      rating: 5,
      comment: 'خدمه ممتازه وتوفير ملحوظ مقارنة بالمغاسل التقليدية.',
      initial: 'ط',
      color: 'bg-emerald-100 text-emerald-700'
    },
    {
      id: 'rev-3',
      name: 'عبدالله الغامدي',
      date: 'الأحد، 30 أغسطس 2026',
      rating: 5,
      comment: 'الباقة ممتازة جداً واستخدمتها لسيارتين، الكابتن مجهز بأفضل الأدوات ومواد التلميع.',
      initial: 'ع',
      color: 'bg-amber-100 text-amber-700'
    }
  ];

  const handleOpenConfirm = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      purchasePackage(activePkg, selectedPaymentMethod, useWallet);
      setIsProcessing(false);
      setShowConfirmModal(false);
      setIsPurchasedSuccess(true);
      setSubscribedPlanName(activePkg.title);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center items-start sm:p-4">
      <div className="bg-slate-50 w-full max-w-xl min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200/80 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top App Bar matching Screenshot 1 */}
        <div className="bg-white px-5 py-4 border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-xs"
              title="رجوع"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black text-slate-900 font-['Cairo']">تفاصيل الباقة</h2>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            {activePkg.tag || 'جديد ✨'}
          </span>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 pb-32">
          
          {/* 1. Header Card (Title, Tag, Image) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
            <div className="text-right space-y-1.5 flex-1">
              <span className="inline-block bg-amber-100 text-amber-800 text-[11px] font-black px-2.5 py-0.5 rounded-md">
                جديد ✨
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-['Cairo']">
                {activePkg.title}
              </h3>
              <p className="text-xs font-medium text-slate-500">
                {washCount} غسلات شاملة داخلي وخارجي + هدايا مجانية
              </p>
            </div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-sm bg-slate-100">
              <img
                src={activePkg.image}
                alt={activePkg.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* 2. Total Price Card matching Screenshot 1 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-600 flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6 text-amber-500" />
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 block">السعر الإجمالي</span>
                <span className="text-2xl font-black text-emerald-600 font-['Cairo']">
                  {activePkg.price.toFixed(2)} ﷼
                </span>
              </div>
            </div>
            {activePkg.originalPrice && (
              <div className="text-left bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block line-through">
                  {activePkg.originalPrice.toFixed(2)} ﷼
                </span>
                <span className="text-xs font-black text-amber-600">
                  وفر {(activePkg.originalPrice - activePkg.price).toFixed(0)} ﷼
                </span>
              </div>
            )}
          </div>

          {/* 3. Description Card matching Screenshot 1 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs text-right space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                ℹ️
              </div>
              <h4 className="text-sm font-black text-slate-900">الوصف</h4>
            </div>

            {/* Promotional Highlight Text matching screenshot */}
            <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 p-4 rounded-xl border border-blue-100/80 text-xs sm:text-sm text-slate-800 space-y-2 leading-relaxed">
              <p className="font-black text-blue-900">
                💥 لا تفوّت عرض {activePkg.title} !
              </p>
              <p className="text-slate-700">
                {washCount} غسلات داخلية وخارجية بسعر ولا في الخيال — {washPerPrice} ريال للغسلة!
              </p>
              <p className="text-slate-700">
                نظافة فاخرة وسهولة استخدام طوال {activePkg.id === 'pkg-2' ? '60' : '30'} يومًا!
              </p>
              <p className="font-bold text-amber-700 flex items-center gap-1.5">
                🎁 {washCount} مناديل اسطوانية فاخرة هدية مجاناً
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                * العرض لا يشمل الفان والباص
              </p>
            </div>

            {/* "What it includes" checklist in 2 columns */}
            <div className="space-y-2.5 pt-2">
              <h5 className="text-xs font-bold text-slate-700">ماذا تتضمن:</h5>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                {activePkg.includes.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Package Content Section matching Screenshot 2 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs text-right space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ListFilter className="w-5 h-5 text-slate-700" />
              <h4 className="text-sm font-black text-slate-900">محتوى الباقة</h4>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <Check className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <h5 className="text-sm font-black text-slate-900">غسيل داخلي وخارجي</h5>
                  <span className="text-xs text-slate-500 font-bold">الكمية: {washCount}</span>
                </div>
              </div>
              <div className="bg-amber-100 text-amber-900 font-black text-xs px-3 py-1.5 rounded-lg border border-amber-200">
                x{washCount}
              </div>
            </div>
          </div>

          {/* 5. Customer Reviews Section matching Screenshot 2 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs text-right space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h4 className="text-sm font-black text-slate-900">آراء العملاء</h4>
              </div>
              <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline flex items-center gap-0.5">
                رؤية الكل <ChevronLeft className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-2.5">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-right space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${rev.color}`}>
                        {rev.initial}
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">{rev.name}</span>
                        <span className="text-[10px] text-slate-400">{rev.date}</span>
                      </div>
                    </div>
                    <div className="flex text-amber-400 text-xs">
                      {'★'.repeat(rev.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pr-9">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Payment Method Section matching Screenshot 2 & 3 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs text-right space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <CreditCard className="w-5 h-5 text-slate-700" />
              <h4 className="text-sm font-black text-slate-900">طريقة الدفع</h4>
            </div>

            {/* Wallet switch card matching screenshot */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">المحفظة</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" /> نشيط
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-600">
                    الرصيد: {walletBalance.toFixed(2)} ﷼
                  </span>
                </div>
              </div>

              {/* Interactive Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useWallet}
                  onChange={(e) => setUseWallet(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Cards / Apple Pay / Mada options */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('card')}
                className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                  selectedPaymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold">بطاقة مدى / ائتمان</span>
                </div>
                {selectedPaymentMethod === 'card' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('apple_pay')}
                className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between ${
                  selectedPaymentMethod === 'apple_pay'
                    ? 'border-slate-900 bg-slate-100 text-slate-900 ring-2 ring-slate-900/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs">Pay / STC Pay</span>
                </div>
                {selectedPaymentMethod === 'apple_pay' && <CheckCircle2 className="w-4 h-4 text-slate-900" />}
              </button>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Bar matching Screenshot 3 */}
        <div className="fixed sm:sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200/80 shadow-lg z-30 max-w-xl mx-auto">
          <button
            onClick={handleOpenConfirm}
            className="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-['Cairo']"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>اشترك الآن</span>
          </button>
        </div>

        {/* Confirmation Modal Popup matching Screenshot 4 */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-150 border border-slate-100">
              
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                <ShoppingBag className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900 font-['Cairo']">
                  يرجى مراجعة مبلغ الدفع قبل المتابعة.
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  سيتم تفعيل {activePkg.title} مباشرة وإضافتها إلى حسابك
                </p>
              </div>

              {/* Total Amount Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-xs font-bold text-slate-500 block">المبلغ الإجمالي</span>
                <span className="text-2xl sm:text-3xl font-black text-blue-700 font-['Cairo']">
                  {activePkg.price.toFixed(2)} ر.س
                </span>
                {useWallet && walletBalance > 0 && (
                  <span className="text-[11px] font-bold text-emerald-600 block pt-1">
                    خصم المحفظة: {Math.min(walletBalance, activePkg.price).toFixed(2)} ر.س
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 py-1.5 px-3 rounded-full border border-emerald-200 mx-auto w-fit">
                <ShieldCheck className="w-4 h-4" />
                <span>دفع آمن ومشفر 100%</span>
              </div>

              {/* Action Buttons matching Screenshot 4 */}
              <div className="space-y-2 pt-2">
                <button
                  disabled={isProcessing}
                  onClick={handleConfirmPurchase}
                  className="w-full bg-[#1e293b] hover:bg-slate-900 text-white font-black py-3.5 rounded-2xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 text-sm font-['Cairo'] disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      جاري معالجة الدفع...
                    </span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تأكيد الدفع</span>
                    </>
                  )}
                </button>

                <button
                  disabled={isProcessing}
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full bg-white hover:bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl border border-slate-200 active:scale-98 transition-all text-xs"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Screen Modal */}
        {isPurchasedSuccess && (
          <div className="fixed inset-0 z-70 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200 border border-slate-100">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-lg font-black text-slate-900 font-['Cairo']">
                  مبروك! تم تفعيل الباقة بنجاح 🎉
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  تم إضافة <strong>{washCount} غسلات شاملة</strong> إلى رصيدك، يمكنك الآن حجز مواعيد الغسيل والاستفادة من الباقة في أي وقت.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-right space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">الباقة:</span>
                  <span className="font-bold text-slate-900">{subscribedPlanName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">عدد الغسلات المتاحة:</span>
                  <span className="font-bold text-emerald-600">{washCount} غسلات</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">صلاحية الباقة:</span>
                  <span className="font-bold text-slate-800">{activePkg.id === 'pkg-2' ? '60 يوم' : '30 يوم'}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    handleClose();
                    setActiveServiceTab('services');
                    setCurrentScreen('home');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl shadow-md active:scale-98 transition-all text-sm font-['Cairo']"
                >
                  احجز غسلتك الأولى الآن
                </button>

                <button
                  onClick={() => {
                    handleClose();
                    setCurrentScreen('subscriptions');
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-2xl border border-slate-200 active:scale-98 transition-all text-xs"
                >
                  عرض باقاتي واشتراكاتي
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

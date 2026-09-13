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
  Layers,
  Award,
  Clock,
  Sparkle
} from 'lucide-react';

export const PackageDetailScreen: React.FC = () => {
  const {
    selectedPackageForDetail,
    closePackageDetail,
    walletBalance,
    purchasePackage,
    setCurrentScreen,
    packages
  } = useApp();

  const activePkg = selectedPackageForDetail || packages[0];

  const [useWallet, setUseWallet] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'apple_pay' | 'tamara' | 'tabby'>('card');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPurchasedSuccess, setIsPurchasedSuccess] = useState<boolean>(false);
  const [subscribedPlanName, setSubscribedPlanName] = useState<string>('');

  if (!activePkg) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-right">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
          <p className="text-sm font-bold text-slate-700">لم يتم تحديد باقة لعرض تفاصيلها</p>
          <button
            onClick={() => setCurrentScreen('packages')}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold"
          >
            تصفح باقات التوفير
          </button>
        </div>
      </div>
    );
  }

  const washCount = activePkg.id === 'pkg-2' ? 5 : activePkg.id === 'pkg-3' ? 8 : 3;
  const washPerPrice = (activePkg.price / washCount).toFixed(0);

  // Reviews list
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

  // Inclusions items
  const packageInclusions = activePkg.includes || [
    'غسيل وتلميع الهيكل الخارجي بشامبو واكس حماية أمريكي',
    'تنظيف الجنوط والإطارات وإزالة الكربون وبقع المكابح',
    'كنس وتنظيف وتطهير المقصورة الداخلية بالكامل وشفط الأتربة',
    'مسح وتلميع الطبلون، الأبواب، والديكورات بملمع عازل للأشعة فوق البنفسجية',
    'تعطير فاخر يدوم طويلاً بزيوت عطرية أصلية',
    'منشفة مايكروفايبر إضافية جديدة مجانية لكل غسلة'
  ];

  // Financial calculations
  const originalPrice = Math.round(activePkg.price * 1.35);
  const totalSavings = originalPrice - activePkg.price;
  const walletDeduction = useWallet ? Math.min(walletBalance, activePkg.price) : 0;
  const netDueAmount = Math.max(0, activePkg.price - walletDeduction);

  const handleFinalConfirmPurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      purchasePackage(
        activePkg,
        selectedPaymentMethod === 'apple_pay' ? 'apple_pay' : selectedPaymentMethod === 'card' ? 'card' : 'card',
        useWallet
      );
      setSubscribedPlanName(activePkg.title);
      setIsProcessing(false);
      setShowConfirmModal(false);
      setIsPurchasedSuccess(true);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Safe fallback if confetti fails
      }
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16 pt-4 text-right">
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
            onClick={() => setCurrentScreen('packages')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            باقات التوفير
          </button>
          <span>/</span>
          <span className="text-slate-800 font-bold">{activePkg.title}</span>
        </div>

        {/* Success Modal */}
        {isPurchasedSuccess && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">مبروك! تم تفعيل {subscribedPlanName} بنجاح 🎉</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto">
                تم إضافة {washCount} غسلات شاملة إلى حسابك مع الهدايا المجانية المرفقة، ويمكنك استخدامها فوراً لحجز موعد غسيل لسيارتك.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCurrentScreen('profile')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                عرض باقاتي في الملف الشخصي
              </button>
              <button
                onClick={() => setCurrentScreen('home')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                العودة للصفحة الرئيسية
              </button>
            </div>
          </div>
        )}

        {/* Desktop 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Column: Details, Inclusions, Gifts, Reviews (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Package Hero Card */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs">
              <div className="relative h-64 sm:h-80 w-full bg-slate-900">
                <img
                  src={activePkg.image}
                  alt={activePkg.title}
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-between p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{activePkg.tag || 'الأكثر طلباً وتوفيراً'}</span>
                    </span>
                    <span className="bg-white/20 text-white backdrop-blur-xs text-xs font-bold px-3 py-1 rounded-lg">
                      صالحة لمدة {activePkg.id === 'pkg-2' ? '60 يوماً' : activePkg.id === 'pkg-3' ? '90 يوماً' : '30 يوماً'}
                    </span>
                  </div>

                  <div className="space-y-2 text-white">
                    <h1 className="text-2xl sm:text-4xl font-black">{activePkg.title}</h1>
                    <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-xl leading-relaxed">
                      {activePkg.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stat Highlights */}
              <div className="grid grid-cols-3 divide-x divide-x-reverse divide-slate-100 border-t border-slate-100 bg-slate-50/50 p-4 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 block">عدد الغسلات المضمنة</span>
                  <span className="text-base sm:text-xl font-black text-slate-900">{washCount} غسلات</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">التكلفة للغسلة الواحدة</span>
                  <span className="text-base sm:text-xl font-black text-blue-600">{washPerPrice} ر.س</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">إجمالي التوفير</span>
                  <span className="text-base sm:text-xl font-black text-emerald-600">{totalSavings} ر.س</span>
                </div>
              </div>
            </div>

            {/* Inclusions & Features Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">ماذا تتضمن كل غسلة في هذه الباقة؟</h3>
                  <p className="text-xs text-slate-500">تنفيذ بأيدي كباتن محترفين ومعدات ألمانية وأمريكية متطورة</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {packageInclusions.map((inc, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 leading-relaxed">{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Free Gifts & Bonus Perks */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200/70 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-xs">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-amber-950">هدايا ومميزات حصرية مع هذا الاشتراك:</h4>
                  <p className="text-xs text-amber-800">تصلك مجاناً ومضمونة مع أول زيارة لكابتن الغسيل</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-200/80 text-center space-y-1">
                  <span className="text-xs font-bold text-slate-900 block">مناشف مايكروفايبر جديدة</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    مجاناً لكل سيارة
                  </span>
                </div>

                <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-200/80 text-center space-y-1">
                  <span className="text-xs font-bold text-slate-900 block">معطر سيارة فرنسي أصلي</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    مجاناً مع الباقة
                  </span>
                </div>

                <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border border-amber-200/80 text-center space-y-1">
                  <span className="text-xs font-bold text-slate-900 block">أولوية حجز المواعيد الذروة</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    VIP حصري
                  </span>
                </div>
              </div>
            </div>

            {/* Verified Customer Reviews */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">تقييمات وتجارب المشتركين</h3>
                    <p className="text-xs text-slate-500">تقييم ممتاز 4.9 من 5 بناءً على أكثر من 380 مشترك</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                  <span>★ 4.9</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${rev.color}`}>
                          {rev.initial}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{rev.name}</span>
                          <span className="text-[10px] text-slate-400">{rev.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center text-amber-400 text-xs">
                        {'★'.repeat(rev.rating)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Purchase & Checkout Sidebar (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            
            {/* Purchase Card */}
            <div className="bg-white rounded-3xl p-6 border-2 border-blue-600/30 shadow-md space-y-5">
              
              {/* Header Price */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">قيمة الاشتراك الإجمالية</span>
                  <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    شامل الضريبة 15%
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-blue-600">{activePkg.price.toFixed(2)}</span>
                  <span className="text-sm font-bold text-slate-700">ريال سعودي</span>
                  <span className="text-xs text-slate-400 line-through mr-2">{originalPrice} ر.س</span>
                </div>
              </div>

              {/* Wallet Deduction Option */}
              {walletBalance > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-900">استخدام رصيد المحفظة</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(e) => setUseWallet(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-emerald-800">
                    <span>رصيدك المتاح: {walletBalance.toFixed(2)} ر.س</span>
                    {useWallet && (
                      <span className="font-bold text-emerald-700">
                        خصم {walletDeduction.toFixed(2)} ر.س
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">اختر وسيلة الدفع الإلكتروني:</label>
                
                {/* Mada / Visa */}
                <div
                  onClick={() => setSelectedPaymentMethod('card')}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    selectedPaymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/60 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">بطاقة مدى / البطاقات الائتمانية</span>
                      <span className="text-[10px] text-slate-500">دفع فوري آمن ومباشر</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedPaymentMethod === 'card' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                  }`}>
                    {selectedPaymentMethod === 'card' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Apple Pay */}
                <div
                  onClick={() => setSelectedPaymentMethod('apple_pay')}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    selectedPaymentMethod === 'apple_pay'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-xs">Pay</span>
                    <span className="text-xs font-bold">Apple Pay بنقرة واحدة</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedPaymentMethod === 'apple_pay' ? 'bg-white border-white text-slate-950' : 'border-slate-300'
                  }`}>
                    {selectedPaymentMethod === 'apple_pay' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Tabby */}
                <div
                  onClick={() => setSelectedPaymentMethod('tabby')}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    selectedPaymentMethod === 'tabby'
                      ? 'border-emerald-500 bg-emerald-50/60 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="bg-[#3BFF9C] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded">
                      tabby
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">قسمها على 4 دفعات مع تابي</span>
                      <span className="text-[10px] text-slate-500">{(netDueAmount / 4).toFixed(2)} ر.س / دفعة بدون فوائد</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedPaymentMethod === 'tabby' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                  }`}>
                    {selectedPaymentMethod === 'tabby' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                {/* Tamara */}
                <div
                  onClick={() => setSelectedPaymentMethod('tamara')}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    selectedPaymentMethod === 'tamara'
                      ? 'border-amber-500 bg-amber-50/60 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="bg-[#FF9478] text-white text-[10px] font-black px-2 py-0.5 rounded">
                      tamara
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">قسم مشترياتك عبر تمارا</span>
                      <span className="text-[10px] text-slate-500">بدون فوائد وبدون رسوم تأخير</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedPaymentMethod === 'tamara' ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300'
                  }`}>
                    {selectedPaymentMethod === 'tamara' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>

              {/* Purchase Button */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>اشترك الآن وفعّل الباقة ({netDueAmount.toFixed(2)} ر.س)</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>دفع إلكتروني موثوق ومحمي وفق معايير البنك المركزي السعودي</span>
                </p>
              </div>
            </div>

            {/* Quality and Guarantee Card */}
            <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Award className="w-4 h-4 text-blue-600" />
                <span>ضمان الجودة الذهبي من NIXT</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                إذا لم تكن راضياً بنسبة 100% عن جودة الغسيل، يمكنك طلب إعادة الغسيل مجاناً أو استرداد قيمة الغسلة فوراً.
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-right space-y-4 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold text-slate-900">تأكيد الاشتراك في الباقة</h4>
                <p className="text-xs text-slate-500 mt-1">{activePkg.title} ({washCount} غسلات شاملة)</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>سعر الباقة:</span>
                  <span className="font-bold">{activePkg.price.toFixed(2)} ر.س</span>
                </div>
                {useWallet && walletDeduction > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>خصم المحفظة:</span>
                    <span>-{walletDeduction.toFixed(2)} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-1 text-slate-900 font-black">
                  <span>المبلغ النهائي للدفع:</span>
                  <span className="text-blue-600">{netDueAmount.toFixed(2)} ر.س</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  disabled={isProcessing}
                  onClick={handleFinalConfirmPurchase}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? 'جاري التأكيد والسداد...' : 'تأكيد السداد وتفعيل الباقة'}
                </button>
                <button
                  disabled={isProcessing}
                  onClick={() => setShowConfirmModal(false)}
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

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Gift,
  Share2,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  Wallet,
  Check,
  Users,
  Award,
  CreditCard,
  Send,
  HeartHandshake,
  ShieldCheck,
  Info
} from 'lucide-react';

export const RewardsHubScreen: React.FC = () => {
  const { setCurrentScreen, walletBalance } = useApp();

  const handleNavigateToReferral = () => {
    setCurrentScreen('referral');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToSendGift = () => {
    setCurrentScreen('send_gift');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16 text-right animate-in fade-in duration-300 select-none" dir="rtl">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 shadow-sm border border-blue-600/30">
        {/* Subtle geometric backdrop circles */}
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -right-10 w-56 h-56 rounded-full bg-indigo-500/10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مكافآت وهدايا نيكست الحصرية</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              المكافآت والهدايا
            </h1>
            
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
              اختر بين دعوة أصدقائك للحصول على مكافآت نقدية في محفظتك، أو إهداء باقات الغسيل والرصيد لمن تحب بخطوات سريعة وسهلة.
            </p>
          </div>

          {/* User Quick Wallet Capsule */}
          <div className="shrink-0 bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15 flex items-center justify-between gap-4 min-w-[190px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="text-xs text-blue-100 block">رصيدك بالمحفظة</span>
                <span className="text-base font-black font-mono text-white leading-tight">
                  {walletBalance.toFixed(0)} <span className="text-xs text-amber-300 font-bold">ر.س</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Selection Instructions */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          <h2 className="text-sm sm:text-base font-bold text-slate-800">
            اختر الخدمة المطلوبة للمتابعة
          </h2>
        </div>
        <span className="text-xs text-slate-400">خياران متاحان</span>
      </div>

      {/* 3. The Two Primary Interactive Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* OPTION 1: ادع واكسب (Invite & Earn) */}
        <div
          id="rewards-option-referral"
          onClick={handleNavigateToReferral}
          className="group relative bg-white hover:bg-slate-50/70 rounded-3xl p-6 border-2 border-slate-200/90 hover:border-amber-400 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between text-right overflow-hidden"
        >
          {/* Top color accent strip */}
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />

          <div>
            {/* Top row: Icon and Badge */}
            <div className="flex items-center justify-between mb-5 pt-1">
              <div className="w-13 h-13 rounded-2xl bg-amber-50 group-hover:bg-amber-100 text-amber-600 border border-amber-200/60 flex items-center justify-center transition-colors shadow-xs">
                <Users className="w-6 h-6" />
              </div>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>مكافأة 25 ر.س</span>
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1 mb-3">
              <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                ادع واكسب
              </h3>
              <p className="text-xs font-bold text-amber-600">
                برنامج مكافآت إحالة الأصدقاء
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-5">
              شارك رمز دعوتك الحصري مع أصدقائك ومعارفك. يحصل صديقك على خصم مميز على أول طلب، وتحصل أنت على رصيد 25 ر.س يُضاف فوراً إلى محفظتك!
            </p>

            {/* Feature Bullets */}
            <div className="space-y-2 mb-6 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="font-medium">رصيد 25 ر.س فوري بالمحفظة لكل صديق مسجل</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="font-medium">خصم ترحيبي لأصدقائك عند أول حجز غسيل</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-700">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="font-medium">مشاركة سريعة ومباشرة عبر واتساب والرسائل</span>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="pt-2">
            <button
              type="button"
              id="rewards-btn-referral"
              onClick={handleNavigateToReferral}
              className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 group-hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span>الانتقال لبرنامج ادع واكسب</span>
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </div>

        {/* OPTION 2: إرسال الهدايا (Send Gifts) */}
        <div
          id="rewards-option-gifts"
          onClick={handleNavigateToSendGift}
          className="group relative bg-white hover:bg-slate-50/70 rounded-3xl p-6 border-2 border-slate-200/90 hover:border-blue-500 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between text-right overflow-hidden"
        >
          {/* Top color accent strip */}
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity" />

          <div>
            {/* Top row: Icon and Badge */}
            <div className="flex items-center justify-between mb-5 pt-1">
              <div className="w-13 h-13 rounded-2xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 border border-blue-200/60 flex items-center justify-center transition-colors shadow-xs">
                <Gift className="w-6 h-6" />
              </div>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200/70">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>إهداء فوري مع SMS</span>
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1 mb-3">
              <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                إرسال الهدايا
              </h3>
              <p className="text-xs font-bold text-blue-600">
                إهداء باقة غسيل أو رصيد محفظة
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-5">
              فاجئ عائلتك وأصدقاءك بهدية فاخرة؛ أهدِهم باقة من خدمات غسيل وتلميع السيارات أو رصيداً نقدياً في المحفظة مع رسالة إهداء وكود خاص يصلهم فوراً.
            </p>

            {/* Feature Bullets */}
            <div className="space-y-2 mb-6 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="font-medium">إهداء باقات الغسيل المميزة والتلميع الكامل</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="font-medium">إمكانية شحن رصيد هدية نقدي يبدأ من 20 ر.س</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-700">
                <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="font-medium">رسالة إهداء باسمك تصل فوراً عبر SMS مع كود الهدية</span>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="pt-2">
            <button
              type="button"
              id="rewards-btn-gifts"
              onClick={handleNavigateToSendGift}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 group-hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span>الانتقال لإرسال هدية</span>
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. Informative Explainer Card: How it Works */}
      <div className="bg-slate-100/80 rounded-3xl p-6 border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Info className="w-4 h-4 text-blue-600" />
          <span>كيف تستفيد من برامج المكافآت والهدايا؟</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 space-y-1 text-right">
            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center mb-2">
              1
            </div>
            <h4 className="text-xs font-bold text-slate-900">اختر نوع البرنامج</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              اختر دعوة صديق لكسب رصيد، أو إرسال هدية مميزة لشخص عزيز.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 space-y-1 text-right">
            <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center mb-2">
              2
            </div>
            <h4 className="text-xs font-bold text-slate-900">شارك أو أدخل البيانات</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              انسخ كود الدعوة وأرسله، أو حدد باقة الغسيل ورقم جوال المستلم.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 space-y-1 text-right">
            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center mb-2">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-900">استمتع بالمكافأة</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              يصل الرصيد إلى محفظتك وتصل الهدية لصاحبها فوراً برسالة SMS رسمية.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

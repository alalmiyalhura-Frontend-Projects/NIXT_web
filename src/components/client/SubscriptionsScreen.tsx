import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserSubscription } from '../../types';
import { INITIAL_USER_SUBSCRIPTIONS } from '../../data/initialData';
import {
  Plus,
  Check
} from 'lucide-react';

interface SubscriptionsScreenProps {
  onOpenCarModal?: () => void;
  onOpenAddressModal?: () => void;
}

export const SubscriptionsScreen: React.FC<SubscriptionsScreenProps> = () => {
  const {
    setCurrentScreen,
    setActiveServiceTab,
    userSubscriptions
  } = useApp();

  // Active user subscriptions: use context state, or fallback to the 3 standard subscriptions from the design
  const displaySubs: UserSubscription[] =
    userSubscriptions && userSubscriptions.length > 0
      ? userSubscriptions
      : INITIAL_USER_SUBSCRIPTIONS;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 text-right" dir="rtl">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
            باقات الغسيل الدورية المشترك بها
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            تابع تفاصيل اشتراكاتك الحالية ورصيد الغسلات المتبقية
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (setActiveServiceTab) {
              setActiveServiceTab('packages');
            }
            setCurrentScreen('packages');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="self-start sm:self-center bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>تصفح وشراء باقات جديدة</span>
        </button>
      </div>

      {/* 2. Active Subscription Cards Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {displaySubs.map((sub) => {
          const percent = Math.round((sub.remainingWashes / sub.totalWashes) * 100);

          return (
            <div
              key={sub.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-4">
                {/* Header: Title and Price */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {sub.planName}
                  </h3>
                  {sub.price && (
                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl font-mono shrink-0">
                      {sub.price} ر.س
                    </span>
                  )}
                </div>

                {/* Washes Balance & Progress */}
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">الغسلات المتبقية:</span>
                    <span className="font-black text-blue-600 font-mono">
                      {sub.remainingWashes} من {sub.totalWashes} غسلة
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-0.5">
                    <span>صالح حتى: {sub.renewalDate || '2026-09-01'}</span>
                  </div>
                </div>

                {/* Plan Features */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-black text-slate-800 block">مميزات الباقة:</span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {sub.features && sub.features.length > 0 ? (
                      sub.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                          <span className="leading-relaxed text-xs">{f}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                        <span className="leading-relaxed text-xs">غسيل متنقل فاخر بالواكس النانوي</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. How Subscriptions Work Step-by-Step */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            خطوات بسيطة ومريحة
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            كيف يعمل نظام الاشتراكات في نيكست؟
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            صممنا نظام الاشتراكات ليوفر وقتك وجهدك مع ضمان نظافة دائمة لسيارتك
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-black text-base">
              1
            </div>
            <h4 className="font-bold text-sm text-slate-900">اختر باقة الاشتراك</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              اختر الخطة التي تناسب عدد سياراتك ومعدل استخدامك الأسبوعي.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-black text-base">
              2
            </div>
            <h4 className="font-bold text-sm text-slate-900">اشترك في الباقة</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              أكمل اشتراكك بسهولة لتفعيل رصيد الغسلات والاستفادة من المزايا الحصرية فوراً.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-black text-base">
              3
            </div>
            <h4 className="font-bold text-sm text-slate-900">زيارة كابتن محترف</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              يصلك كابتن معتمد مجهز بأحدث معدات التنظيف المائي والبخاري عند باب بيتك.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-black text-base">
              4
            </div>
            <h4 className="font-bold text-sm text-slate-900">استمتع بالخدمة ضمن الباقة المختارة</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              استمتع بنظافة دائمة وعناية فائقة لسيارتك بكل راحة واطمئنان طوال فترة الاشتراك.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

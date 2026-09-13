import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceItem } from '../../types';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Gift,
  ShieldCheck,
  CalendarCheck,
  Zap,
  Tag,
  Car,
  Home,
  Crown
} from 'lucide-react';

interface PackagesScreenProps {
  onOpenCarModal?: () => void;
  onOpenAddressModal?: () => void;
}

export const PackagesScreen: React.FC<PackagesScreenProps> = () => {
  const { packages, openBookingModal, openPackageDetail, setCurrentScreen } = useApp();
  const [filterCategory, setFilterCategory] = useState<'all' | 'cars' | 'carpets' | 'vip'>('all');

  // Filter packages based on active tab
  const filteredPackages = packages.filter((pkg) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'cars') return pkg.category === 'cars' || pkg.category === 'wash_offers';
    if (filterCategory === 'carpets') return pkg.category === 'carpets' || pkg.category === 'carpets_furniture';
    if (filterCategory === 'vip') return pkg.title.includes('VIP') || pkg.price > 250;
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Navigation Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <button
                onClick={() => {
                  setCurrentScreen('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>الرئيسية</span>
              </button>
              <span>/</span>
              <span className="text-blue-600 font-bold">باقات التوفير</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
                  باقات التوفير الحصرية
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-normal">
                  باقات غسيل وعناية متكاملة بأسعار مخفضة وهدايا قيمة مع صلاحية مرنة
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setCurrentScreen('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="self-start sm:self-center px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </button>
        </div>

        {/* Category Filters - Centered */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-6 border-t border-slate-100 mt-5">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterCategory === 'all'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>جميع الباقات</span>
          </button>
          <button
            onClick={() => setFilterCategory('cars')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterCategory === 'cars'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>باقات غسيل السيارات</span>
          </button>
          <button
            onClick={() => setFilterCategory('carpets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterCategory === 'carpets'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>باقات السجاد والمفروشات</span>
          </button>
          <button
            onClick={() => setFilterCategory('vip')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterCategory === 'vip'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>باقات VIP الشاملة</span>
          </button>
        </div>
      </div>

      {/* 2. Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-6">
        {filteredPackages.map((pkg: ServiceItem) => {
          const savings = pkg.originalPrice ? pkg.originalPrice - pkg.price : 0;
          const savingsPercent = pkg.originalPrice ? Math.round((savings / pkg.originalPrice) * 100) : 0;

          return (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-48 sm:h-52 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
                      {pkg.tag || 'باقة توفير 🎁'}
                    </span>
                    {savingsPercent > 0 && (
                      <span className="bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
                        وفر {savingsPercent}%
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{pkg.durationMinutes} دقيقة / للغسلة</span>
                  </div>

                  {/* Title overlay on bottom of image */}
                  <div className="absolute bottom-3 right-3 left-3 text-white">
                    <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-sm">
                      {pkg.title}
                    </h3>
                  </div>
                </div>

                {/* Description & Inclusions */}
                <div className="p-5 sm:p-6 space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    {pkg.description}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-orange-500" />
                      <span>ما تشمله هذه الباقة:</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pkg.includes.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Call to Action Footer */}
              <div className="p-5 sm:p-6 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    السعر الإجمالي للباقة شامل الضريبة
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-orange-600">
                      {pkg.price.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-slate-700">ر.س</span>
                    {pkg.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {pkg.originalPrice.toFixed(2)} ر.س
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => openPackageDetail(pkg)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    عرض التفاصيل
                  </button>
                  <button
                    onClick={() => openBookingModal(pkg)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>شراء وحجز الآن</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Value Proposition / Why Choose Nixt Packages Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="bg-white/20 text-xs font-black px-3 py-1 rounded-full inline-block">
              مزايا حصرية لعملاء الباقات ⭐
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              لماذا باقات نيكست هي الخيار الأمثل لسيارتك؟
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 space-y-1.5 border border-white/10">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
              01
            </div>
            <h4 className="text-sm font-bold">توفير مالي مضمون</h4>
            <p className="text-xs text-white/80 leading-relaxed">
              وفر حتى 40% مقارنة بسعر الغسيل الفردي للزيارة الواحدة.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 space-y-1.5 border border-white/10">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
              02
            </div>
            <h4 className="text-sm font-bold">صلاحية طويلة ومرنة</h4>
            <p className="text-xs text-white/80 leading-relaxed">
              صلاحية تمتد حتى 120 يوماً مع إمكانية استخدام الغسلات في أي وقت.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 space-y-1.5 border border-white/10">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
              03
            </div>
            <h4 className="text-sm font-bold">مشاركة الباقة</h4>
            <p className="text-xs text-white/80 leading-relaxed">
              يمكنك استخدام غسلات الباقة لجميع سيارات العائلة المسجلة بحسابك.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 space-y-1.5 border border-white/10">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
              04
            </div>
            <h4 className="text-sm font-bold">ضمان ذهبي 100%</h4>
            <p className="text-xs text-white/80 leading-relaxed">
              إعادة الغسيل مجاناً في حال لم تكن راضياً عن مستوى النظافة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

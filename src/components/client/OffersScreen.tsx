import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceItem, Coupon } from '../../types';
import {
  ArrowRight,
  BadgePercent,
  Copy,
  Check,
  Tag,
  Clock,
  Sparkles,
  CalendarCheck,
  Gift,
  Share2,
  ChevronRight,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface OffersScreenProps {
  onOpenCarModal?: () => void;
  onOpenAddressModal?: () => void;
}

export const OffersScreen: React.FC<OffersScreenProps> = () => {
  const { coupons, services, openBookingModal, setCurrentScreen, applyCoupon } = useApp();
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);

  // Copy coupon and apply it to context
  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    applyCoupon(code);
    setCopiedCouponCode(code);
    setTimeout(() => {
      setCopiedCouponCode(null);
    }, 2500);
  };

  // Find all services that currently have active discounts
  const discountedServices = services.filter(
    (s: ServiceItem) => s.originalPrice && s.originalPrice > s.price && s.isActive
  );

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
              <span className="text-purple-600 font-bold">العروض والخصومات</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <BadgePercent className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">
                  العروض والخصومات الحصرية
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-normal">
                  أحدث كوبونات الخصم الفعالة والعروض المتاحة لفترة محدودة على كافة خدمات نيكست
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
      </div>

      {/* 2. Active Coupons Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              <span>كوبونات الخصم الفعالة اليوم</span>
            </h2>
            <p className="text-xs text-slate-500">انسخ الرمز الترويجي واضغط على تفعيل للاستفادة من الخصم فوراً</p>
          </div>
          <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full">
            {coupons.filter((c: Coupon) => c.isActive).length} كوبون نشط
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {coupons
            .filter((c: Coupon) => c.isActive)
            .map((coupon: Coupon) => {
              const isCopied = copiedCouponCode === coupon.code;

              return (
                <div
                  key={coupon.id}
                  className="bg-white rounded-3xl border border-purple-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
                >
                  {/* Decorative background circle */}
                  <div className="absolute -left-6 -top-6 w-24 h-24 bg-purple-50 rounded-full pointer-events-none" />

                  <div className="space-y-3 z-10">
                    <div className="flex items-center justify-between">
                      <span className="bg-purple-50 text-purple-700 font-bold text-xs px-2.5 py-1 rounded-full border border-purple-150">
                        {coupon.discountType === 'percentage' ? `خصم ${coupon.discountValue}%` : `خصم ${coupon.discountValue} ر.س`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        ساري حتى {coupon.endDate}
                      </span>
                    </div>

                    <h3 className="font-black text-base text-slate-900 leading-snug">
                      {coupon.title}
                    </h3>

                    {coupon.minOrderValue && (
                      <p className="text-xs text-slate-500">
                        الحد الأدنى للطلب: {coupon.minOrderValue} ر.س
                      </p>
                    )}
                  </div>

                  {/* Coupon Code Box with Copy Button */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-2 z-10">
                    <div className="flex-1 bg-slate-50 border border-dashed border-purple-300 rounded-xl px-3 py-2 text-center font-mono font-black text-purple-700 text-sm tracking-wider">
                      {coupon.code}
                    </div>

                    <button
                      onClick={() => handleCopyCoupon(coupon.code)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        isCopied
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>تم التطبيق!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ وتفعيل</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 3. Discounted Services with Direct Booking */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>خدمات وعروض بأسعار مخفضة</span>
            </h2>
            <p className="text-xs text-slate-500">احجز الخدمة مباشرة بسعر العرض الترويجي</p>
          </div>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
            {discountedServices.length} عروض خاصة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {discountedServices.map((service: ServiceItem) => {
            const savings = service.originalPrice ? service.originalPrice - service.price : 0;
            const savingsPercent = service.originalPrice ? Math.round((savings / service.originalPrice) * 100) : 0;

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-purple-300 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image Box */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />

                    {/* Discount badge */}
                    <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                      وفر {savingsPercent}%
                    </div>

                    {/* Tag badge */}
                    {service.tag && (
                      <div className="absolute top-2.5 left-2.5 bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                        {service.tag}
                      </div>
                    )}

                    {/* Duration */}
                    <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-300" />
                      <span>{service.durationMinutes} دقيقة</span>
                    </div>
                  </div>

                  {/* Content Box */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/40">
                  <div>
                    <span className="text-[10px] text-slate-400 block">سعر العرض</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base sm:text-lg font-black text-purple-700">
                        {service.price.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-slate-700">ر.س</span>
                      {service.originalPrice && (
                        <span className="text-[11px] text-slate-400 line-through">
                          {service.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => openBookingModal(service)}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>احجز الآن</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Referral and Gift Promotional Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
        {/* Referral Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-black">
              اكسب 50 ر.س رصيد مع كل دعوة صديق!
            </h3>
            <p className="text-xs text-blue-100 leading-relaxed">
              شارك كود الإحالة الخاص بك مع عائلتك وأصدقائك؛ يحصل صديقك على خصم 25 ر.س وتصلك 50 ر.س في محفظتك.
            </p>
          </div>

          <button
            onClick={() => {
              setCurrentScreen('referral');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="self-start px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <span>الانتقال لبرنامج الإحالة</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

        {/* Gift Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-black">
              أهدِ من تحب تجربة غسيل فاخرة 🎁
            </h3>
            <p className="text-xs text-amber-100 leading-relaxed">
              أرسل بطاقة هدية إلكترونية لغسيل السيارة أو السجاد لأصدقائك وأحبابك برسالة مخصصة تصلهم فوراً.
            </p>
          </div>

          <button
            onClick={() => {
              setCurrentScreen('send_gift');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="self-start px-5 py-2.5 rounded-xl bg-white text-orange-700 hover:bg-orange-50 font-black text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <span>إرسال بطاقة هدية الآن</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

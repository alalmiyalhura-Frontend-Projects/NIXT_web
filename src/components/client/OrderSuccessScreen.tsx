import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, Check } from 'lucide-react';

interface OrderSuccessScreenProps {
  onBackToHome: () => void;
  orderNumber?: string;
  serviceTitle?: string;
}

export const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({
  onBackToHome,
  orderNumber,
  serviceTitle
}) => {
  useEffect(() => {
    // Launch festive multi-color confetti cannon
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="relative w-full h-full min-h-[520px] bg-white rounded-3xl overflow-hidden flex flex-col justify-between p-6 text-center select-none animate-in fade-in zoom-in-95 duration-300">
      {/* Background Confetti & Streamers Graphics (Matching screenshot festive atmosphere) */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-center pt-2">
        {/* Festive SVG Background Details */}
        <div className="relative w-full max-w-[280px] h-[220px] flex items-center justify-center">
          {/* Confetti particles background */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 300 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Streamers */}
            <path d="M 30 30 Q 40 45, 30 60 T 35 90" stroke="#EC4899" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 270 40 Q 255 60, 268 80 T 260 110" stroke="#8B5CF6" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 50 140 Q 65 155, 55 175 T 60 200" stroke="#06B6D4" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 245 150 Q 235 170, 248 190 T 240 215" stroke="#E11D48" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Confetti Bars & Dots */}
            <rect x="35" y="80" width="6" height="24" rx="3" fill="#22C55E" transform="rotate(15 35 80)" />
            <rect x="260" y="65" width="5" height="22" rx="2.5" fill="#22C55E" transform="rotate(-20 260 65)" />
            <rect x="55" y="115" width="16" height="12" rx="2" fill="#F97316" transform="rotate(45 55 115)" />
            <rect x="235" y="105" width="14" height="10" rx="2" fill="#FBBF24" transform="rotate(-30 235 105)" />
            <rect x="50" y="220" width="18" height="6" rx="3" fill="#EAB308" transform="rotate(10 50 220)" />

            <circle cx="115" cy="45" r="4" fill="#0EA5E9" />
            <circle cx="195" cy="40" r="3.5" fill="#EC4899" />
            <circle cx="230" cy="50" r="3" fill="#F59E0B" />
            <circle cx="80" cy="55" r="3.5" fill="#A855F7" />
            <circle cx="210" cy="180" r="3.5" fill="#3B82F6" />
            <circle cx="95" cy="205" r="4" fill="#EC4899" />

            {/* Little Stars */}
            <path d="M 285 85 L 288 92 L 295 93 L 290 98 L 291 105 L 285 101 L 279 105 L 280 98 L 275 93 L 282 92 Z" fill="#84CC16" />
            <path d="M 15 75 L 18 82 L 25 83 L 20 88 L 21 95 L 15 91 L 9 95 L 10 88 L 5 83 L 12 82 Z" fill="#84CC16" />
            <path d="M 160 50 L 163 56 L 170 57 L 165 62 L 166 69 L 160 65 L 154 69 L 155 62 L 150 57 L 157 56 Z" fill="#EAB308" />
          </svg>

          {/* Glowing Radial Halo */}
          <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-amber-200/60 via-yellow-100/80 to-transparent blur-xl pointer-events-none" />

          {/* Central Gold Medal with Blue Ribbon (Pixel-matched with Screenshot) */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Medal Ribbon (Blue V-shape) */}
            <div className="relative flex justify-center -mb-4">
              <svg width="100" height="65" viewBox="0 0 100 65" fill="none">
                {/* Left ribbon */}
                <path d="M 20 0 L 50 40 L 40 40 L 10 0 Z" fill="#3B82F6" />
                {/* Right ribbon */}
                <path d="M 80 0 L 50 40 L 60 40 L 90 0 Z" fill="#2563EB" />
              </svg>
            </div>

            {/* Medal Body */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#FCD34D] to-[#F59E0B] p-2 shadow-lg shadow-amber-500/30 flex items-center justify-center border-4 border-[#FDE68A]">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-inner border border-amber-300">
                {/* Star in Center */}
                <svg className="w-10 h-10 text-amber-100 fill-amber-100 drop-shadow-sm" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Success Title (تم إنشاء الطلب بنجاح) */}
        <div className="mt-4 space-y-1">
          <h2 className="text-2xl font-black text-[#2E7D32] font-['Cairo'] tracking-tight">
            تم إنشاء الطلب بنجاح
          </h2>
          {orderNumber && (
            <p className="text-xs font-bold text-slate-400">
              رقم الطلب: <span className="text-slate-700 font-mono">#{orderNumber}</span>
            </p>
          )}
          {serviceTitle && (
            <p className="text-xs font-bold text-slate-500">
              الخدمة: <span className="text-blue-600 font-black">{serviceTitle}</span>
            </p>
          )}
        </div>

        {/* Message Card (Matching Screenshot message & green checkmark) */}
        <div className="w-full max-w-sm mt-5 p-4 rounded-2xl bg-[#F4FAF6] border border-[#D5EEDB] flex items-center justify-between gap-3 text-right shadow-xs">
          <p className="text-xs font-bold text-slate-700 leading-relaxed flex-1">
            تم إنشاء طلبك بنجاح، وسيقوم فريقنا بالتواصل معك قريبًا لتأكيد التفاصيل.
          </p>
          <div className="w-8 h-8 rounded-full bg-[#E2F6E9] border border-[#86EFAC] text-[#16A34A] flex items-center justify-center shrink-0 shadow-2xs">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
        </div>
      </div>

      {/* Bottom Large Green Button (العودة الي الرئيسية ←) */}
      <div className="w-full max-w-sm mx-auto pt-6 pb-2">
        <button
          type="button"
          onClick={onBackToHome}
          className="w-full bg-[#34A853] hover:bg-[#2E7D32] active:scale-[0.99] text-white font-black text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 font-['Cairo']"
        >
          <span>العودة الي الرئيسية</span>
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

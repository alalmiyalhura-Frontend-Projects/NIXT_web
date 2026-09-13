import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  Gift,
  Copy,
  Check,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReferralScreen: React.FC = () => {
  const { setCurrentScreen, user } = useApp();
  const [copied, setCopied] = useState<boolean>(false);
  const referralCode = '0R3Kp0OG';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 }
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    const shareText = `استخدم رمز دعوتي (${referralCode}) عند تسجيلك في تطبيق نيكست لغسيل السيارات واحصل على خصم 25 ريال على أول حجز! حمل التطبيق الآن: https://nixt.sa/app`;
    if (navigator.share) {
      navigator.share({
        title: 'دعوة للانضمام إلى تطبيق نيكست',
        text: shareText,
        url: 'https://nixt.sa'
      }).catch(() => {});
    } else {
      handleCopyCode();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-16 text-right animate-in fade-in duration-300">
      {/* Top Bar with Title and Back Arrow to Rewards Hub */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            setCurrentScreen('gifts');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition-all cursor-pointer text-xs font-bold"
          title="العودة لصفحة المكافآت والهدايا"
        >
          <ArrowRight className="w-4 h-4 text-blue-600" />
          <span>المكافآت والهدايا</span>
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            ادع واكسب
          </h2>
          <span className="text-[11px] text-slate-400">برنامج إحالة الأصدقاء</span>
        </div>

        <div className="w-24" /> {/* Spacer for symmetry */}
      </div>

      {/* Main Hero Card matching Screenshot 4 */}
      <div className="bg-gradient-to-b from-blue-50/90 via-slate-50/40 to-white rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm text-center space-y-4">
        {/* Gift Icon in rounded container */}
        <div className="w-20 h-20 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
          <Gift className="w-10 h-10" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-blue-900">
          دعوة الأصدقاء والفوز
        </h3>

        {/* Subtext matching Screenshot 4 text */}
        <p className="text-slate-600 text-sm leading-relaxed max-w-xs mx-auto font-normal">
          ادعُ أصدقاءك لتجربة نيكست! ستحصل أنت وصديقك على مكافأة عند أول طلب. بالإضافة إلى ذلك، ستحصل على المزيد من العروض الحصرية عند أول طلب.
        </p>
      </div>

      {/* Referral Code Section matching Screenshot 4 */}
      <div className="space-y-2 text-center pt-2">
        <label className="text-sm font-semibold text-slate-700 block">
          رمز دعوتك
        </label>

        {/* Referral Code Box */}
        <div
          onClick={handleCopyCode}
          className="bg-white border-2 border-blue-200 hover:border-blue-400 rounded-2xl py-3.5 px-6 flex items-center justify-center gap-4 cursor-pointer shadow-xs transition-all group"
        >
          <span className="text-xl font-black font-mono tracking-widest text-slate-900 select-all">
            {referralCode}
          </span>
          <button
            type="button"
            className="text-blue-600 group-hover:scale-110 transition-transform p-1"
            title="نسخ الرمز"
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-600" />
            ) : (
              <Copy className="w-5 h-5 text-blue-600" />
            )}
          </button>
        </div>
        {copied && (
          <p className="text-xs font-bold text-emerald-600 animate-in fade-in">
            تم نسخ رمز الدعوة بنجاح!
          </p>
        )}
      </div>

      {/* Share Button matching Screenshot 4 */}
      <div className="pt-2">
        <button
          onClick={handleShare}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5 active:scale-[0.99] text-base"
        >
          <Share2 className="w-5 h-5" />
          <span>شارك رمزك</span>
        </button>
      </div>
    </div>
  );
};

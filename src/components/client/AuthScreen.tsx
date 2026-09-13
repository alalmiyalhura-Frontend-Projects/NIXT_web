import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Phone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  User,
  Sparkles,
  Lock,
  Clock,
  Car
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, setCurrentScreen } = useApp();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('505555555');
  const [name, setName] = useState('شركة ترو فينتشر');
  const [otp, setOtp] = useState(['1', '2', '3', '4']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || phone.length < 9) {
      alert('يرجى إدخال رقم جوال صحيح');
      return;
    }
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      login(phone, name);
      setIsSubmitting(false);
      setCurrentScreen('home');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 text-right">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button
            onClick={() => setCurrentScreen('home')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            الرئيسية
          </button>
          <span>/</span>
          <span className="text-slate-800 font-bold">تسجيل الدخول والتحقق</span>
        </div>

        {/* Main Auth Card (Website 2-Column or Centered Container) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch">
          
          {/* Right/Hero Brand Showcase (md:col-span-5) */}
          <div className="md:col-span-5 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white p-8 sm:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white text-blue-900 flex items-center justify-center font-black text-2xl shadow-md">
                N
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white">منصة نيكست NIXT</h2>
                <p className="text-xs text-blue-200">الوجهة الذكية الأولى لخدمات السيارات وغسيل السجاد بالمملكة</p>
              </div>
            </div>

            <div className="space-y-4 my-8">
              <div className="flex items-start gap-3 text-xs text-blue-100">
                <div className="w-7 h-7 rounded-lg bg-blue-700/50 flex items-center justify-center shrink-0 mt-0.5">
                  <Car className="w-4 h-4 text-amber-400" />
                </div>
                <span>حجز فوري للغسيل المتنقل عند بيتك أو عملك في أقل من 60 ثانية</span>
              </div>

              <div className="flex items-start gap-3 text-xs text-blue-100">
                <div className="w-7 h-7 rounded-lg bg-blue-700/50 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <span>باقات توفير حصرية توفر حتى 40% من قيمة الغسيل المنفرد</span>
              </div>

              <div className="flex items-start gap-3 text-xs text-blue-100">
                <div className="w-7 h-7 rounded-lg bg-blue-700/50 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-blue-300" />
                </div>
                <span>دفع إلكتروني آمن ومحمي ومعتمد من البنك المركزي السعودي</span>
              </div>
            </div>

            <div className="text-[11px] text-blue-300/80 border-t border-blue-800/80 pt-4">
              نظام محمي برمز تحقق فوري OTP دون الحاجة لتذكر كلمات مرور معقدة.
            </div>
          </div>

          {/* Left/Form Container (md:col-span-7) */}
          <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {step === 'phone' ? 'تسجيل الدخول / فتح حساب جديد' : 'أدخل رمز التحقق السريع OTP'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {step === 'phone'
                  ? 'أدخل رقم جوالك لتصلك رسالة التأكيد والتمتع بجميع المزايا'
                  : `تم إرسال رمز التحقق التجريبي المكون من 4 أرقام لرقمك (+966 ${phone})`}
              </p>
            </div>

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">الاسم الكامل / اسم العميل:</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="أدخل اسمك الكريم"
                      required
                      className="w-full pl-3 pr-10 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 text-right"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">رقم الجوال (السعودية):</label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="500000000"
                      required
                      className="flex-1 px-3.5 py-3 text-xs sm:text-sm font-bold bg-transparent focus:outline-none"
                      dir="ltr"
                    />
                    <div className="bg-slate-200 text-slate-700 px-3.5 py-3 text-xs font-bold shrink-0" dir="ltr">
                      +966 🇸🇦
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50 text-xs text-blue-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>سيصلك رمز تحقق فوري عبر رسالة SMS للتأكيد دون الحاجة لكلمة مرور.</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>متابعة وإرسال رمز التحقق</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
                  <p className="text-xs text-slate-600 font-semibold">
                    رمز التحقق التجريبي المعتمد هو:
                  </p>
                  <p className="text-xl font-black text-blue-600 tracking-widest" dir="ltr">
                    1 • 2 • 3 • 4
                  </p>
                </div>

                {/* 4-digit input */}
                <div className="flex items-center justify-center gap-3" dir="ltr">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={otp[idx]}
                      onChange={e => {
                        const newOtp = [...otp];
                        newOtp[idx] = e.target.value;
                        setOtp(newOtp);
                      }}
                      className="w-14 h-14 text-center text-xl font-black rounded-2xl border-2 border-slate-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all shadow-xs"
                    />
                  ))}
                </div>

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? 'جاري التحقق والدخول...' : 'تأكيد الرمز والدخول إلى حسابي'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-xs font-bold text-slate-500 hover:text-blue-600 hover:underline cursor-pointer"
                  >
                    تغيير رقم الجوال (+966 {phone})
                  </button>
                </div>
              </form>
            )}

            <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={() => setCurrentScreen('home')}
                className="hover:text-blue-600 font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة للصفحة الرئيسية</span>
              </button>

              <span>NIXT KSA © 2026</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

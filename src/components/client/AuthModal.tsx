import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Phone, ShieldCheck, X, ArrowLeft, CheckCircle2, User } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, login } = useApp();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('505555555');
  const [name, setName] = useState('شركة ترو فينتشر');
  const [otp, setOtp] = useState(['1', '2', '3', '4']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showAuthModal) return null;

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
      setStep('phone');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-200 text-right space-y-5 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
              N
            </div>
            <h3 className="text-base font-black font-['Cairo'] text-slate-900">
              {step === 'phone' ? 'تسجيل الدخول / حساب جديد' : 'رمز التحقق السريع'}
            </h3>
          </div>
          <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">اسم العميل / المؤسسة</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="أدخل اسمك الكريم"
                  required
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">رقم الجوال</label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="500000000"
                  required
                  className="flex-1 px-3 py-2.5 text-xs font-bold bg-transparent focus:outline-none"
                  dir="ltr"
                />
                <div className="bg-slate-200 text-slate-700 px-3 py-2.5 text-xs font-bold shrink-0" dir="ltr">
                  +966 🇸🇦
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 text-[11px] text-blue-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>سيصلك رمز تحقق فوري عبر رسالة SMS للتأكيد.</span>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>متابعة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-500 font-semibold">
                تم إرسال رمز التحقق المكون من 4 أرقام إلى الرقم
              </p>
              <p className="text-xs font-black text-blue-900" dir="ltr">
                +966 {phone}
              </p>
            </div>

            {/* 4-digit input */}
            <div className="flex items-center justify-center gap-2" dir="ltr">
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
                  className="w-12 h-12 text-center text-lg font-black rounded-xl border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              ))}
            </div>

            <span className="text-[11px] text-center block text-slate-400 font-bold">
              رمز التحقق التجريبي هو: 1 2 3 4
            </span>

            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'جاري التحقق...' : 'دخول إلى الحساب'}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              تغيير رقم الجوال
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

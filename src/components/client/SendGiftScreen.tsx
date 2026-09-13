import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  ArrowLeft,
  Gift,
  Wallet,
  Phone,
  User,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Package,
  Layers,
  Check,
  Clock,
  Car,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ServiceItem } from '../../types';

export const SendGiftScreen: React.FC = () => {
  const { setCurrentScreen, walletBalance, packages, sendGift } = useApp();

  const [giftMode, setGiftMode] = useState<'amount' | 'package'>('package');
  const [selectedPackage, setSelectedPackage] = useState<ServiceItem | null>(() => {
    return packages && packages.length > 0 ? packages[0] : null;
  });

  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [giftAmount, setGiftAmount] = useState<number>(100);
  const [customAmountInput, setCustomAmountInput] = useState<string>('100');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'wallet' | 'apple_pay'>('credit_card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [generatedGiftCode, setGeneratedGiftCode] = useState<string>('');

  const quickAmounts = [50, 100, 150, 200, 250, 300];

  const handleSelectQuick = (val: number) => {
    setGiftAmount(val);
    setCustomAmountInput(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmountInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setGiftAmount(parsed);
    }
  };

  const currentTotalToPay = giftMode === 'package' && selectedPackage
    ? selectedPackage.price
    : giftAmount;

  const handleSendGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone || recipientPhone.length < 9) {
      alert('يرجى إدخال رقم جوال المستلم بشكل صحيح');
      return;
    }

    if (giftMode === 'package' && !selectedPackage) {
      alert('يرجى اختيار باقة من الباقات المتاحة لإهدائها');
      return;
    }

    if (giftMode === 'amount' && giftAmount < 20) {
      alert('الحد الأدنى لإرسال الهدية النقدية هو 20 ريال');
      return;
    }

    if (paymentMethod === 'wallet' && walletBalance < currentTotalToPay) {
      alert(`رصيد المحفظة الحالي (${walletBalance.toFixed(2)} ر.س) غير كافٍ لسداد قيمة الهدية (${currentTotalToPay.toFixed(2)} ر.س)`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const res = sendGift(
        recipientPhone,
        recipientName || 'المستلم الكريم',
        giftMode,
        currentTotalToPay,
        giftMode === 'package' ? (selectedPackage || undefined) : undefined,
        paymentMethod
      );

      setIsProcessing(false);
      if (res.success) {
        setGeneratedGiftCode(res.giftCode);
        setIsSuccess(true);
        confetti({
          particleCount: 85,
          spread: 70,
          origin: { y: 0.5 }
        });
      } else {
        alert(res.message);
      }
    }, 900);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 pb-20 text-right animate-in fade-in duration-300 font-['Cairo',sans-serif]">
      {/* Top Bar with Back Arrow to Rewards Hub */}
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
            إرسال الهدايا
          </h2>
          <span className="text-[11px] text-slate-400">إهداء باقة أو رصيد محفظة</span>
        </div>

        <div className="w-24" /> {/* Spacer for symmetry */}
      </div>

      {isSuccess ? (
        /* Success Screen */
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5 animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">تم إرسال الهدية بنجاح!</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {giftMode === 'package' && selectedPackage ? (
                <>
                  تم إرسال هدية <strong className="text-blue-600 font-bold">"{selectedPackage.title}"</strong> بقيمة <strong className="text-emerald-600 font-bold">{selectedPackage.price} ر.س</strong> إلى الرقم ({recipientPhone}) عبر رسالة نصية SMS.
                </>
              ) : (
                <>
                  تم إرسال كود الهدية بقيمة <strong className="text-emerald-600 font-bold">{giftAmount} ر.س</strong> إلى الرقم ({recipientPhone}) عبر رسالة نصية SMS تحتوي على رابط شحن الرصيد بالمحفظة.
                </>
              )}
            </p>

            {generatedGiftCode && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-2xl inline-block">
                <span className="text-xs text-blue-700 font-medium block mb-0.5">رمز الهدية المرسل:</span>
                <span className="text-base font-bold text-blue-900 font-mono tracking-wider">{generatedGiftCode}</span>
              </div>
            )}
          </div>
          <div className="pt-3 space-y-2">
            <button
              onClick={() => {
                setIsSuccess(false);
                setRecipientPhone('');
                setRecipientName('');
                setGeneratedGiftCode('');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-2xl shadow-md transition-all"
            >
              إرسال هدية أخرى
            </button>
            <button
              onClick={() => {
                setCurrentScreen('gifts');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-2xl transition-all text-sm cursor-pointer"
            >
              العودة لقسم المكافآت والهدايا
            </button>
          </div>
        </div>
      ) : (
        /* Main Gifting Form */
        <form onSubmit={handleSendGift} className="space-y-4">
          {/* Blue Hero Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 text-center shadow-lg relative overflow-hidden space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto text-white shadow-inner">
              <Gift className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold">
              إرسال الهدايا
            </h3>
            <p className="text-xs text-blue-100 font-medium">
              أهدي من تحب باقات غسيل فاخرة أو رصيد محفظة فوري
            </p>
          </div>

          {/* Gift Type Toggle: Package vs Amount */}
          <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setGiftMode('package')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                giftMode === 'package'
                  ? 'bg-white text-blue-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>إهداء باقة متوفرة</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-md font-bold">جديد ✨</span>
            </button>
            <button
              type="button"
              onClick={() => setGiftMode('amount')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                giftMode === 'amount'
                  ? 'bg-white text-blue-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>إهداء رصيد محفظة</span>
            </button>
          </div>

          {/* Wallet Balance Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-600">رصيد محفظتك الحالي</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900">
                {walletBalance.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-emerald-600">﷼</span>
            </div>
          </div>

          {/* Main Card with Input Controls */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
            {/* 1. Recipient Phone & Optional Name */}
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>اسم المستلم (اختياري)</span>
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="اسم الشخص المهدى إليه (مثال: محمد الشمري)"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 bg-slate-50/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>رقم جوال المستلم <span className="text-red-500">*</span></span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 px-3 py-3 rounded-2xl text-xs font-bold text-slate-700 shrink-0">
                    <span>966</span>
                    <span className="text-sm">🇸🇦</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      required
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="رقم الجوال (05xxxxxxxx)"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 bg-slate-50/50"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Choose Package OR Enter Amount */}
            {giftMode === 'package' ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>اختر الباقة المراد إهداؤها</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-bold">
                    {packages.length} باقات متوفرة
                  </span>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-0.5">
                  {packages.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/30'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Package Image / Thumbnail */}
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative bg-slate-100">
                            <img
                              src={pkg.image}
                              alt={pkg.title}
                              className="w-full h-full object-cover"
                            />
                            {pkg.tag && (
                              <span className="absolute top-0 right-0 left-0 bg-blue-600 text-white text-[8px] font-black text-center py-0.5">
                                {pkg.tag}
                              </span>
                            )}
                          </div>

                          {/* Package Info */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-black text-slate-900 truncate">
                                {pkg.title}
                              </h4>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                              }`}>
                                {isSelected && <Check className="w-2.5 h-2.5" />}
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {pkg.description}
                            </p>

                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-bold text-blue-700">
                                  {pkg.price.toFixed(2)}
                                </span>
                                <span className="text-[10px] font-medium text-slate-500">ر.س</span>
                                {pkg.originalPrice && (
                                  <span className="text-[10px] text-slate-400 font-normal line-through mr-1">
                                    {pkg.originalPrice} ر.س
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-md">
                                صالحة 60-90 يوم
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* What includes chips if selected */}
                        {isSelected && pkg.includes && pkg.includes.length > 0 && (
                          <div className="mt-2.5 pt-2.5 border-t border-blue-100 flex flex-wrap gap-1.5">
                            {pkg.includes.slice(0, 3).map((item, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-lg border border-blue-200/60 flex items-center gap-1"
                              >
                                <Check className="w-2.5 h-2.5 text-blue-600" />
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Amount Mode Inputs */
              <>
                {/* Gift Amount */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <span>قيمة الهدية النقدية</span>
                  </label>
                  <input
                    type="number"
                    min="20"
                    value={customAmountInput}
                    onChange={handleCustomChange}
                    placeholder="أدخل قيمة الهدية"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 bg-slate-50/50"
                  />
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="text-blue-600">⚡</span>
                    <span>اختيار سريع للمبلغ</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {quickAmounts.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelectQuick(val)}
                        className={`py-3 px-2 rounded-2xl text-center border transition-all ${
                          giftAmount === val
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-black'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 font-bold'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-sm font-semibold">{val}</span>
                          <span className={`text-[11px] font-medium ${
                            giftAmount === val ? 'text-emerald-300' : 'text-emerald-600'
                          }`}>﷼</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* 3. Payment Method */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-medium text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>طريقة الدفع</span>
              </label>

              {/* Credit Card Option */}
              <div
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 bg-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-700 shadow-inner font-mono font-bold">
                    💳
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">بطاقة بنكية (مدى / فيزا / ماستركارد)</span>
                    <span className="text-[10px] text-slate-500 font-normal">دفع آمن ومباشر عبر بوابة ميسر</span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'credit_card' ? 'border-blue-600' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'credit_card' && (
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
              </div>

              {/* Wallet Option */}
              <div
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'wallet'
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs shadow-inner font-bold">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">الدفع من رصيد المحفظة</span>
                    <span className={`text-[10px] ${walletBalance >= currentTotalToPay ? 'text-emerald-600 font-medium' : 'text-red-500'}`}>
                      المتوفر: {walletBalance.toFixed(2)} ر.س
                      {walletBalance < currentTotalToPay && ' (الرصيد غير كافٍ)'}
                    </span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'wallet' ? 'border-blue-600' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'wallet' && (
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>نوع الهدية:</span>
                <span className="font-semibold text-slate-800">
                  {giftMode === 'package' ? `باقة: ${selectedPackage?.title || ''}` : 'رصيد محفظة'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                <span>الإجمالي المطلوب سداده:</span>
                <span className="text-base text-blue-700 font-bold">
                  {currentTotalToPay.toFixed(2)} ر.س
                </span>
              </div>
            </div>

            {/* Confirm Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] text-base cursor-pointer"
              >
                {isProcessing ? (
                  <span>جاري الإرسال...</span>
                ) : (
                  <>
                    <span>تأكيد وإرسال الهدية</span>
                    <ArrowLeft className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

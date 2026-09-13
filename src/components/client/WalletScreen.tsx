import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  ShieldCheck,
  X,
  Search,
  RotateCcw,
  TrendingUp,
  CalendarRange,
  User,
  ShoppingBag,
  Car,
  MapPin,
  Gift,
  LogOut,
  ChevronDown,
  Check,
  Clock,
  ToggleLeft,
  ToggleRight,
  Power
} from 'lucide-react';
import wallet3dImage from '../../assets/images/wallet_3d_illustration_1788949300501.jpg';

export const WalletScreen: React.FC = () => {
  const {
    walletBalance,
    walletTransactions,
    rechargeWallet,
    user,
    setCurrentScreen,
    logout,
    updateProfile
  } = useApp();

  const [showRechargeModal, setShowRechargeModal] = useState<boolean>(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(100);
  const [customInput, setCustomInput] = useState<string>('100');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Wallet Enabled / Disabled Toggle
  const [isWalletEnabled, setIsWalletEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('nixt_wallet_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const handleToggleWallet = () => {
    setIsWalletEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('nixt_wallet_enabled', String(next));
      return next;
    });
  };

  // Date Filters: All, Today, Week, Month, Custom
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-07-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-08-19');
  const [showCustomDatePanel, setShowCustomDatePanel] = useState<boolean>(false);

  // Type filter & Search query
  const [typeFilter, setTypeFilter] = useState<'all' | 'recharge' | 'payment' | 'refund'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Profile Edit Modal State
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(user?.name || 'أحمد محمد');
  const [editPhone, setEditPhone] = useState<string>(user?.phone || '+966 50 123 4567');
  const [profileUpdatedMsg, setProfileUpdatedMsg] = useState<boolean>(false);

  const quickAmounts = [50, 100, 150, 200, 250, 300];

  const handleSelectQuickAmount = (val: number) => {
    setRechargeAmount(val);
    setCustomInput(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomInput(e.target.value);
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      setRechargeAmount(parsed);
    }
  };

  const handleConfirmRecharge = () => {
    if (rechargeAmount < 15) {
      alert('الحد الأدنى لشحن المحفظة هو 15 ريال');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      rechargeWallet(rechargeAmount);
      setIsProcessing(false);
      setShowRechargeModal(false);

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    }, 700);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(editName, editPhone);
    setProfileUpdatedMsg(true);
    setTimeout(() => {
      setProfileUpdatedMsg(false);
      setShowProfileModal(false);
    }, 1000);
  };

  // Helper date checker
  const isWithinDateFilter = (txDateStr: string) => {
    if (dateFilter === 'all') return true;
    if (dateFilter === 'custom') {
      if (customStartDate && txDateStr < customStartDate) return false;
      if (customEndDate && txDateStr > customEndDate) return false;
      return true;
    }

    const txDate = new Date(txDateStr);
    const referenceDate = new Date('2026-08-19');

    if (dateFilter === 'today') {
      // Latest transaction date or current mock date
      return txDateStr === '2026-08-19' || txDateStr === '2026-08-01';
    }
    if (dateFilter === 'week') {
      const diffTime = referenceDate.getTime() - txDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }
    if (dateFilter === 'month') {
      const diffTime = referenceDate.getTime() - txDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 31;
    }

    return true;
  };

  // Filtered transactions calculation
  const filteredTransactions = useMemo(() => {
    return walletTransactions.filter((tx) => {
      // 1. Date filter (All, Today, Week, Month, Custom)
      if (!isWithinDateFilter(tx.date)) {
        return false;
      }

      // 2. Type filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'recharge' && tx.type !== 'recharge') return false;
        if (typeFilter === 'payment' && tx.type !== 'payment') return false;
        if (typeFilter === 'refund' && tx.type !== 'refund') return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = tx.typeLabel?.toLowerCase().includes(q);
        const matchDesc = tx.description?.toLowerCase().includes(q);
        const matchTxNum = tx.transactionNumber?.toLowerCase().includes(q);
        const matchOrderId = tx.orderId?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchTxNum && !matchOrderId) return false;
      }

      return true;
    });
  }, [walletTransactions, dateFilter, customStartDate, customEndDate, typeFilter, searchQuery]);

  // Financial Statistics
  const totalIn = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const totalOut = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [filteredTransactions]);

  const netBalance = totalIn - totalOut;

  const handleResetFilters = () => {
    setDateFilter('all');
    setShowCustomDatePanel(false);
    setTypeFilter('all');
    setSearchQuery('');
    setCustomStartDate('2026-07-01');
    setCustomEndDate('2026-08-19');
  };

  // Helper to render transaction category icon
  const getCategoryIcon = (type: string, title?: string) => {
    if (type === 'recharge') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
          <Wallet className="w-5 h-5" />
        </div>
      );
    }
    if (type === 'refund' || title?.includes('مكافأة') || title?.includes('هدية')) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 shadow-2xs">
          <Gift className="w-5 h-5" />
        </div>
      );
    }
    if (type === 'refund' || title?.includes('استرداد')) {
      return (
        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 shadow-2xs">
          <RotateCcw className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
        <ShoppingBag className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 text-right animate-in fade-in duration-300" dir="rtl">
      {/* Breadcrumbs & Page Header */}
      <div className="space-y-1 text-right">
        <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setCurrentScreen('home')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            الرئيسية
          </button>
          <span className="text-slate-300">‹</span>
          <span className="text-slate-600 font-bold">المحفظة</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          المحفظة الرقمية
        </h1>
      </div>

          {/* 1. TOP HERO CARD: Wallet Balance & Toggle Switch */}
          <div className="bg-gradient-to-l from-blue-50/95 via-sky-50/70 to-blue-100/50 border border-blue-200/80 rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 text-right">
            {/* RIGHT SIDE of card: Balance, Status & Toggle & Add Funds */}
            <div className="space-y-3.5 text-right shrink-0 w-full md:w-auto">
              {/* Status Badge + Active Toggle Switch */}
              <div className="flex items-center justify-start gap-3 flex-wrap">
                {/* Interactive Toggle Switch */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">تفعيل المحفظة:</span>
                  <div dir="ltr" className="inline-flex items-center">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isWalletEnabled}
                      id="btn-toggle-wallet"
                      onClick={handleToggleWallet}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
                        isWalletEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      title={isWalletEnabled ? 'اضغط لتعطيل استخدام المحفظة' : 'اضغط لتفعيل استخدام المحفظة'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                          isWalletEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {isWalletEnabled ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    نشط ومفعل
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    معطل مؤقتاً
                  </span>
                )}
              </div>

              {/* Balance Amount */}
              <div className="space-y-0.5">
                <span className="text-xs sm:text-sm text-slate-500 font-bold block">
                  رصيد المحفظة الحالي
                </span>
                <div className="flex items-baseline justify-start gap-1.5">
                  <span className={`text-3xl sm:text-4xl font-black tracking-tight ${
                    isWalletEnabled ? 'text-emerald-600' : 'text-slate-600'
                  }`}>
                    {walletBalance.toFixed(2)}
                  </span>
                  <span className={`text-sm sm:text-base font-bold ${
                    isWalletEnabled ? 'text-emerald-600' : 'text-slate-500'
                  }`}>
                    ر.س
                  </span>
                </div>
              </div>

              {/* Add funds action button */}
              <button
                id="btn-add-funds"
                onClick={() => setShowRechargeModal(true)}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>شحن المحفظة</span>
              </button>
            </div>

            {/* CENTER of card: Promotional Text */}
            <div className="space-y-2 text-right flex-1 w-full md:w-auto">
              <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 leading-snug">
                استخدم رصيد المحفظة في تسديد الفواتير والطلبات
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                استمتع بتجربة دفع أسرع وأسهل مع محفظتك الإلكترونية
              </p>
            </div>

            {/* LEFT SIDE of card: 3D Blue Wallet illustration with coins */}
            <div className="relative shrink-0 flex items-center justify-center">
              <img
                src={wallet3dImage}
                alt="المحفظة الإلكترونية"
                className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-md rounded-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* 2. TRANSACTIONS SECTION ("سجل المعاملات والعمليات") */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6 text-right">
            {/* Header with Title & Search Bar & Operation Type */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
              {/* Title on the right */}
              <div className="space-y-1 text-right">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    سجل المعاملات والعمليات
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  تصفح وتتبع جميع حركات الرصيد في محفظتك
                </p>
              </div>

              {/* Operation Type Dropdown on the left */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Operation Type Dropdown */}
                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl py-2 pl-7 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">نوع العملية (الكل)</option>
                    <option value="recharge">إيداع وشحن فقط</option>
                    <option value="payment">خصم وسداد طلبات</option>
                    <option value="refund">استرداد ومكافآت</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
                </div>

                {/* Reset Filters */}
                {(dateFilter !== 'all' || typeFilter !== 'all') && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 transition-colors px-2 py-1 cursor-pointer"
                    title="إعادة ضبط الفلاتر"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>إعادة ضبط</span>
                  </button>
                )}
              </div>
            </div>

            {/* DATE FILTER BUTTONS (All, Today, Week, Month, Custom) */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-500 ml-1">تصفية حسب التاريخ:</span>
                
                {/* 1. الكل */}
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('all');
                    setShowCustomDatePanel(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    dateFilter === 'all'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  الكل
                </button>

                {/* 2. اليوم */}
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('today');
                    setShowCustomDatePanel(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    dateFilter === 'today'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  اليوم
                </button>

                {/* 3. هذا الأسبوع */}
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('week');
                    setShowCustomDatePanel(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    dateFilter === 'week'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  هذا الأسبوع
                </button>

                {/* 4. هذا الشهر */}
                <button
                  type="button"
                  onClick={() => {
                    setDateFilter('month');
                    setShowCustomDatePanel(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    dateFilter === 'month'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  هذا الشهر
                </button>

                {/* 5. تاريخ مخصص */}
                <button
                  type="button"
                  id="btn-filter-custom-date"
                  onClick={() => {
                    setDateFilter('custom');
                    setShowCustomDatePanel((prev) => !prev);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                    dateFilter === 'custom'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CalendarRange className={`w-3.5 h-3.5 ${dateFilter === 'custom' ? 'text-white' : 'text-blue-600'}`} />
                  <span>تاريخ مخصص</span>
                  {dateFilter === 'custom' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Custom Date Range Picker */}
            {showCustomDatePanel && (
              <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/50 to-slate-50 p-4 rounded-2xl border border-blue-200/80 space-y-3 animate-in fade-in slide-in-from-top-2 text-right">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-black text-slate-800">تحديد النطاق الزمني والتاريخ المخصص:</h4>
                  </div>
                  <span className="text-[11px] text-blue-700 font-bold">
                    من {customStartDate} إلى {customEndDate}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 text-right">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      من تاريخ (تاريخ البداية):
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => {
                        setCustomStartDate(e.target.value);
                        setDateFilter('custom');
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-right">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      إلى تاريخ (تاريخ النهاية):
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => {
                        setCustomEndDate(e.target.value);
                        setDateFilter('custom');
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-blue-200/50 text-[11px]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-slate-500">فترات سريعة:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomStartDate('2026-08-01');
                        setCustomEndDate('2026-08-19');
                        setDateFilter('custom');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-blue-100/70 border border-slate-200 rounded-lg text-slate-700 font-bold transition-colors cursor-pointer"
                    >
                      شهر أغسطس
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomStartDate('2026-07-01');
                        setCustomEndDate('2026-07-31');
                        setDateFilter('custom');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-blue-100/70 border border-slate-200 rounded-lg text-slate-700 font-bold transition-colors cursor-pointer"
                    >
                      شهر يوليو
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomStartDate('2026-07-01');
                        setCustomEndDate('2026-08-19');
                        setDateFilter('custom');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-blue-100/70 border border-slate-200 rounded-lg text-slate-700 font-bold transition-colors cursor-pointer"
                    >
                      كامل الفترة
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDateFilter('custom');
                      setShowCustomDatePanel(false);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    تطبيق التاريخ
                  </button>
                </div>
              </div>
            )}

            {/* Summary Stat Cards matching the screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-right">
              {/* Card 1: مجموع الإيداعات بالفترة (Right in RTL) */}
              <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-0.5 text-right">
                  <span className="text-xs font-bold text-emerald-800/90 block">
                    مجموع الإيداعات بالفترة
                  </span>
                  <span className="text-xl font-black text-emerald-700 block">
                    {totalIn.toFixed(2)} ر.س
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>

              {/* Card 2: مجموع المصروفات بالفترة (Left in RTL) */}
              <div className="bg-rose-50/50 border border-rose-200/70 rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-0.5 text-right">
                  <span className="text-xs font-bold text-rose-800/90 block">
                    مجموع المصروفات بالفترة
                  </span>
                  <span className="text-xl font-black text-rose-600 block">
                    {totalOut.toFixed(2)} ر.س
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-right border-collapse min-w-[640px]">
                {/* Table Header */}
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                    <th className="py-3 px-4 text-right">التاريخ والوقت</th>
                    <th className="py-3 px-4 text-right">الوصف</th>
                    <th className="py-3 px-4 text-center">رقم المعاملة</th>
                    <th className="py-3 px-4 text-center">نوع العملية</th>
                    <th className="py-3 px-4 text-left">المبلغ</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="space-y-2">
                          <p className="font-bold text-slate-600">لا توجد معاملات مطابقة للبحث أو الفلتر المحدد</p>
                          <button
                            onClick={handleResetFilters}
                            className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                          >
                            عرض كافة المعاملات
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const isPositive = tx.amount > 0;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* 1. Date & Time */}
                          <td className="py-4 px-4 whitespace-nowrap text-right">
                            <div className="space-y-0.5 text-slate-500 font-medium">
                              <div className="flex items-center gap-1 text-[11px]">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{tx.date}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{tx.time}</span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Description & Subtitle */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center gap-3">
                              {getCategoryIcon(tx.type, tx.typeLabel)}
                              <div className="text-right">
                                <h5 className="font-black text-slate-900 text-xs sm:text-[13px]">
                                  {tx.typeLabel}
                                </h5>
                                <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                                  {tx.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* 3. Transaction ID */}
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                              {tx.transactionNumber}
                            </span>
                          </td>

                          {/* 4. Operation Type Badge */}
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            {isPositive ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-lg shadow-2xs">
                                <span>إيداع</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/70 px-2.5 py-1 rounded-lg shadow-2xs">
                                <span>خصم</span>
                                <ArrowDownLeft className="w-3 h-3" />
                              </span>
                            )}
                          </td>

                          {/* 5. Amount (Aligned Left) */}
                          <td className="py-4 px-4 text-left whitespace-nowrap">
                            <span
                              className={`text-sm sm:text-base font-black ${
                                isPositive ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {isPositive ? `+${tx.amount.toFixed(2)}` : `${tx.amount.toFixed(2)}`} ر.س
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

      {/* ========================================================================= */}
      {/* ADD FUNDS (RECHARGE) MODAL */}
      {/* ========================================================================= */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-right space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  إضافة الأموال إلى المحفظة
                </h4>
              </div>
              <button
                onClick={() => setShowRechargeModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold">
              الحد الأدنى للشحن هو 15 ريال
            </div>

            {/* Quick Amount Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block">اختر مبلغ الشحن السريع:</label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectQuickAmount(val)}
                    className={`py-2 px-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                      rechargeAmount === val
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val} ر.س
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">أو اكتب مبلغاً مخصصاً:</label>
              <div className="relative">
                <input
                  type="number"
                  min="15"
                  value={customInput}
                  onChange={handleCustomChange}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-right"
                  placeholder="100"
                />
                <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">ر.س</span>
              </div>
            </div>

            {/* Simulated Payment Gateway Notice */}
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>سداد فوري عبر ميسر (مدى، أبل باي، فيزا)</span>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>

            {/* Submit Actions */}
            <div className="flex gap-2 pt-2">
              <button
                disabled={isProcessing}
                onClick={handleConfirmRecharge}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'جاري الشحن...' : `تأكيد الشحن (${rechargeAmount.toFixed(2)} ر.س)`}
              </button>
              <button
                disabled={isProcessing}
                onClick={() => setShowRechargeModal(false)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT PROFILE MODAL */}
      {/* ========================================================================= */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-right space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h4 className="text-base font-bold text-slate-900">تعديل الملف الشخصي</h4>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {profileUpdatedMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>تم تحديث الملف الشخصي بنجاح!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3 text-right">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">الاسم الكامل:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none text-right"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">رقم الجوال:</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none dir-ltr text-right"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

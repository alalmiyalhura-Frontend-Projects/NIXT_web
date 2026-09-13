import React, { useState } from 'react';
import { useApp, AppScreen } from '../../context/AppContext';
import {
  User,
  UserCheck,
  ShoppingBag,
  Wallet,
  CreditCard,
  Car,
  MapPin,
  Gift,
  LogOut,
  ChevronLeft,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  X,
  Settings
} from 'lucide-react';

interface AccountSidebarProps {
  currentScreen: AppScreen;
  onNavigate?: (screen: AppScreen) => void;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({ currentScreen, onNavigate }) => {
  const {
    user,
    walletBalance,
    orders,
    cars,
    addresses,
    userSubscriptions,
    logout,
    setCurrentScreen
  } = useApp();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleItemClick = (screen: AppScreen) => {
    if (onNavigate) {
      onNavigate(screen);
    } else {
      setCurrentScreen(screen);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    setCurrentScreen('home');
  };

  // Nav items in the exact required order:
  // 1. الملف الشخصي
  // 2. حسابي
  // 3. طلباتي
  // 4. المحفظة
  // 5. الاشتراكات
  // 6. سياراتي
  // 7. عناويني
  // 8. المكافآت والهدايا
  const navItems: Array<{
    id: string;
    screen: AppScreen;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: 'sidebar-nav-profile',
      screen: 'profile',
      label: 'الملف الشخصي',
      description: 'البيانات الشخصية وكلمة المرور',
      icon: UserCheck,
      isActive: currentScreen === 'profile',
    },
    {
      id: 'sidebar-nav-orders',
      screen: 'orders',
      label: 'طلباتي',
      description: 'سجل الحجوزات ومتابعة الطلبات',
      icon: ShoppingBag,
      isActive: currentScreen === 'orders' || currentScreen === 'order_detail',
      badge: orders.length > 0 ? orders.length : undefined,
    },
    {
      id: 'sidebar-nav-wallet',
      screen: 'wallet',
      label: 'المحفظة',
      description: 'الرصيد وعمليات السداد والشحن',
      icon: Wallet,
      isActive: currentScreen === 'wallet',
      badge: `${walletBalance.toFixed(0)} ر.س`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    },
    {
      id: 'sidebar-nav-subscriptions',
      screen: 'subscriptions',
      label: 'الاشتراكات',
      description: 'باقات الغسيل الدورية والأسبوعية',
      icon: CreditCard,
      isActive: currentScreen === 'subscriptions',
      badge: userSubscriptions.filter(s => s.status === 'active').length > 0
        ? userSubscriptions.filter(s => s.status === 'active').length
        : undefined,
    },
    {
      id: 'sidebar-nav-cars',
      screen: 'cars',
      label: 'سياراتي',
      description: 'إدارة المركبات واللوحات المسجلة',
      icon: Car,
      isActive: currentScreen === 'cars',
      badge: cars.length > 0 ? cars.length : undefined,
    },
    {
      id: 'sidebar-nav-addresses',
      screen: 'addresses',
      label: 'عناويني',
      description: 'مواقع تقديم الخدمة المحفوظة',
      icon: MapPin,
      isActive: currentScreen === 'addresses',
      badge: addresses.length > 0 ? addresses.length : undefined,
    },
    {
      id: 'sidebar-nav-gifts',
      screen: 'gifts',
      label: 'المكافآت والهدايا',
      description: 'إرسال الهدايا ورمز ادع واكسب',
      icon: Gift,
      isActive: currentScreen === 'gifts' || currentScreen === 'referral' || currentScreen === 'send_gift',
      badge: 'مكافأة 25 ر.س',
      badgeColor: 'bg-amber-50 text-amber-800 border border-amber-200/60',
    },
    {
      id: 'sidebar-nav-settings',
      screen: 'settings',
      label: 'الإعدادات',
      description: 'خيارات الإشعارات واللغة',
      icon: Settings,
      isActive: currentScreen === 'settings',
    },
  ];

  return (
    <aside className="w-full space-y-4 text-right select-none" dir="rtl">
      {/* 1. User Profile Snapshot Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />
        
        <div className="flex items-center gap-3.5 pt-1">
          {/* Avatar Container */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white font-black text-xl flex items-center justify-center overflow-hidden border-2 border-white shadow-xs">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user.name ? user.name.charAt(0) : 'N'}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white flex items-center justify-center" title="حساب نشط">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>

          {/* User Details */}
          <div className="min-w-0 flex-1">
            <div>
              <h3 className="text-sm font-black text-slate-900 truncate" title={user.name || 'عميل نيكست'}>
                {user.name || 'عميل نيكست'}
              </h3>
            </div>

            <p className="text-xs text-slate-500 font-mono mt-0.5" dir="ltr">
              +{user.phone || '966505555555'}
            </p>

            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200/60">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                <span>حساب موثق</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Menu List */}
      <div className="bg-white rounded-3xl p-2.5 border border-slate-200/80 shadow-xs space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400">
          أقسام الحساب
        </div>

        {navItems.map((item) => {
          const ActiveIcon = item.icon;
          return (
            <button
              key={item.id}
              id={item.id}
              onClick={() => handleItemClick(item.screen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer text-right group ${
                item.isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25 ring-1 ring-blue-600'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    item.isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                  }`}
                >
                  <ActiveIcon className="w-4 h-4" />
                </div>
                <div className="truncate text-right">
                  <span className="block leading-snug">{item.label}</span>
                  <span
                    className={`text-[10px] font-normal block truncate mt-0.5 ${
                      item.isActive ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {item.description}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 mr-2">
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      item.isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronLeft
                  className={`w-3.5 h-3.5 transition-transform ${
                    item.isActive
                      ? 'text-white/80 -translate-x-0.5'
                      : 'text-slate-300 group-hover:text-blue-600 group-hover:-translate-x-0.5'
                  }`}
                />
              </div>
            </button>
          );
        })}

        {/* Separator */}
        <div className="pt-2 mt-2 border-t border-slate-100">
          {/* 3. Logout Button at Bottom */}
          <button
            id="sidebar-nav-logout"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-right group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-100 flex items-center justify-center shrink-0 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <span>تسجيل الخروج</span>
            </div>
            <ChevronLeft className="w-3.5 h-3.5 text-rose-300 group-hover:text-rose-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-right space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-black text-slate-900">تأكيد تسجيل الخروج</h4>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟ يمكنك تسجيل الدخول مجدداً في أي وقت برقم جوالك.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleConfirmLogout}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                نعم، تسجيل الخروج
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

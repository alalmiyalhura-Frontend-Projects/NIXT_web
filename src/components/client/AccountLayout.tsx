import React from 'react';
import { useApp, AppScreen } from '../../context/AppContext';
import { AccountSidebar } from './AccountSidebar';
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
  Settings
} from 'lucide-react';

interface AccountLayoutProps {
  currentScreen: AppScreen;
  children: React.ReactNode;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({ currentScreen, children }) => {
  const { user, setCurrentScreen, logout, walletBalance } = useApp();

  const handleNavigate = (screen: AppScreen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mobile horizontal nav items
  const mobileNavItems = [
    { id: 'mob-profile', screen: 'profile' as AppScreen, label: 'الملف الشخصي', icon: UserCheck, isActive: currentScreen === 'profile' },
    { id: 'mob-orders', screen: 'orders' as AppScreen, label: 'طلباتي', icon: ShoppingBag, isActive: currentScreen === 'orders' || currentScreen === 'order_detail' },
    { id: 'mob-wallet', screen: 'wallet' as AppScreen, label: 'المحفظة', icon: Wallet, isActive: currentScreen === 'wallet' },
    { id: 'mob-subscriptions', screen: 'subscriptions' as AppScreen, label: 'الاشتراكات', icon: CreditCard, isActive: currentScreen === 'subscriptions' },
    { id: 'mob-cars', screen: 'cars' as AppScreen, label: 'سياراتي', icon: Car, isActive: currentScreen === 'cars' },
    { id: 'mob-addresses', screen: 'addresses' as AppScreen, label: 'عناويني', icon: MapPin, isActive: currentScreen === 'addresses' },
    { id: 'mob-gifts', screen: 'gifts' as AppScreen, label: 'المكافآت', icon: Gift, isActive: currentScreen === 'gifts' || currentScreen === 'referral' || currentScreen === 'send_gift' },
    { id: 'mob-settings', screen: 'settings' as AppScreen, label: 'الإعدادات', icon: Settings, isActive: currentScreen === 'settings' },
  ];

  return (
    <div className="min-h-[80vh] bg-slate-50/70 pb-16 pt-4 sm:pt-6 text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile & Tablet Header & Horizontal Nav (< lg screens) */}
        <div className="lg:hidden mb-5 space-y-3">
          {/* Mobile User Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name ? user.name.charAt(0) : 'N'}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {user.name || 'عميل نيكست'}
                  </h3>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md border border-blue-200/60 shrink-0">
                    {walletBalance.toFixed(0)} ر.س
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5" dir="ltr">
                  +{user.phone || '966505555555'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                setCurrentScreen('home');
              }}
              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal Scrollable Tabs on Mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={item.id}
                  onClick={() => handleNavigate(item.screen)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    item.isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100/80 border border-slate-200/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop 2-Column Unified Layout */}
        {/* Note: In RTL (dir="rtl"), flex-row places item 1 on the RIGHT and item 2 on the LEFT */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 w-full">
          {/* 1. RIGHT SIDE MENU (Sticky on desktop, Right in RTL) */}
          <div className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-24">
            <AccountSidebar currentScreen={currentScreen} onNavigate={handleNavigate} />
          </div>

          {/* 2. LEFT MAIN CONTENT AREA (Takes remaining width, Left in RTL) */}
          <main className="flex-1 min-w-0 w-full">
            {children}
          </main>
        </div>

      </div>
    </div>
  );
};

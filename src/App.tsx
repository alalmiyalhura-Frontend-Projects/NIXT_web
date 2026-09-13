import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomeScreen } from './components/client/HomeScreen';
import { StoreScreen } from './components/client/StoreScreen';
import { CartScreen } from './components/client/CartScreen';
import { OrdersScreen } from './components/client/OrdersScreen';
import { OrderDetailScreen } from './components/client/OrderDetailScreen';
import { WalletScreen } from './components/client/WalletScreen';
import { MenuScreen } from './components/client/MenuScreen';
import { ReferralScreen } from './components/client/ReferralScreen';
import { SendGiftScreen } from './components/client/SendGiftScreen';
import { RewardsHubScreen } from './components/client/RewardsHubScreen';
import { HelpScreen } from './components/client/HelpScreen';
import { StaticPageScreen } from './components/client/StaticPageScreen';
import { CategoryServicesScreen } from './components/client/CategoryServicesScreen';
import { PackagesScreen } from './components/client/PackagesScreen';
import { SubscriptionsScreen } from './components/client/SubscriptionsScreen';
import { OffersScreen } from './components/client/OffersScreen';
import { CarsScreen } from './components/client/CarsScreen';
import { AddressesScreen } from './components/client/AddressesScreen';
import { ProfileScreen } from './components/client/ProfileScreen';
import { PackageDetailScreen } from './components/client/PackageDetailScreen';
import { BookingScreen } from './components/client/BookingScreen';
import { AuthScreen } from './components/client/AuthScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AccountLayout } from './components/client/AccountLayout';
import { SettingsScreen } from './components/client/SettingsScreen';

const isAccountScreen = (screen: string): boolean => {
  return [
    'profile',
    'menu',
    'orders',
    'order_detail',
    'wallet',
    'subscriptions',
    'cars',
    'addresses',
    'gifts',
    'referral',
    'send_gift',
    'settings'
  ].includes(screen);
};

const AppContent: React.FC = () => {
  const { currentScreen, isAdmin } = useApp();

  // If in admin mode, show full admin dashboard
  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white" dir="rtl">
      {/* Top Navigation Bar for the Website */}
      <Header />

      {/* Main Full-Page Website Content Area */}
      <main className="flex-1 w-full pb-12">
        {currentScreen === 'home' && <HomeScreen />}

        {/* User Account Pages wrapped in Unified Desktop Account Layout */}
        {isAccountScreen(currentScreen) && (
          <AccountLayout currentScreen={currentScreen}>
            {currentScreen === 'profile' && <ProfileScreen />}
            {currentScreen === 'menu' && <MenuScreen />}
            {currentScreen === 'orders' && <OrdersScreen />}
            {currentScreen === 'order_detail' && <OrderDetailScreen />}
            {currentScreen === 'wallet' && <WalletScreen />}
            {currentScreen === 'subscriptions' && <SubscriptionsScreen />}
            {currentScreen === 'cars' && <CarsScreen />}
            {currentScreen === 'addresses' && <AddressesScreen />}
            {currentScreen === 'gifts' && <RewardsHubScreen />}
            {currentScreen === 'referral' && <ReferralScreen />}
            {currentScreen === 'send_gift' && <SendGiftScreen />}
            {currentScreen === 'settings' && <SettingsScreen />}
          </AccountLayout>
        )}

        {/* Other Website Pages (Store, Packages, Offers, Services, Booking, etc.) */}
        {!isAccountScreen(currentScreen) && currentScreen !== 'home' && (
          <div className="w-full">
            {currentScreen === 'store' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                <StoreScreen />
              </div>
            )}
            {currentScreen === 'cart' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                <CartScreen />
              </div>
            )}
            {currentScreen === 'help' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                <HelpScreen />
              </div>
            )}
            {currentScreen === 'packages' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                <PackagesScreen />
              </div>
            )}
            {currentScreen === 'offers' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                <OffersScreen />
              </div>
            )}
            {currentScreen === 'static_page' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                <StaticPageScreen />
              </div>
            )}
            {currentScreen === 'category_services' && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
                <CategoryServicesScreen />
              </div>
            )}
            {currentScreen === 'package_detail' && <PackageDetailScreen />}
            {currentScreen === 'booking' && <BookingScreen />}
            {currentScreen === 'auth' && <AuthScreen />}
          </div>
        )}
      </main>

      {/* Full Website Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  CreditCard,
  Car as CarIcon,
  MapPin,
  Gift,
  Bell,
  Globe,
  Headphones,
  Ticket,
  FileText,
  Shield,
  Star,
  Share2,
  LogOut,
  ChevronLeft,
  Edit2,
  Wallet,
  Copy,
  Check,
  X,
  Send,
  MessageSquare,
  Plus,
  Sparkles,
  ExternalLink,
  Settings
} from 'lucide-react';
import { ProfileModal } from './ProfileModal';

interface MenuScreenProps {
  onOpenCarModal?: () => void;
  onOpenAddressModal?: () => void;
}

interface TicketItem {
  id: string;
  title: string;
  category: string;
  date: string;
  status: 'open' | 'closed' | 'pending';
  response?: string;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({ onOpenCarModal, onOpenAddressModal }) => {
  const {
    user,
    walletBalance,
    logout,
    setShowAuthModal,
    setCurrentScreen,
    setActiveStaticPageKey,
    language,
    notificationSettings
  } = useApp();

  // Modals state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'info' | 'subscriptions'>('info');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Specific interactive modals for each menu item
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showGiftsModal, setShowGiftsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);

  // Gifting state
  const [selectedGiftType, setSelectedGiftType] = useState('wash_premium');
  const [giftRecipientPhone, setGiftRecipientPhone] = useState('');
  const [giftRecipientName, setGiftRecipientName] = useState('');
  const [giftSuccess, setGiftSuccess] = useState(false);

  // Tickets state
  const [tickets, setTickets] = useState<TicketItem[]>([
    {
      id: 'TK-1082',
      title: 'استفسار بخصوص موعد غسيل باقة الفي آي بي',
      category: 'المواعيد والحجوزات',
      date: '18 أغسطس 2026',
      status: 'pending',
      response: 'جاري مراجعة طلبك من قبل فريق خدمة العملاء وسيتم التواصل معك خلال 15 دقيقة.'
    },
    {
      id: 'TK-0941',
      title: 'إضافة سيارة جديدة في حسابي',
      category: 'الحساب والسيارات',
      date: '10 أغسطس 2026',
      status: 'closed',
      response: 'تم حل المشكلة وتأكيد إضافة السيارة بنجاح. شكراً لتواصلك معنا.'
    }
  ]);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('خدمة العملاء');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  // Notification toggles
  const [notifyBooking, setNotifyBooking] = useState(true);
  const [notifyOffers, setNotifyOffers] = useState(true);
  const [notifySMS, setNotifySMS] = useState(false);

  // Language state
  const [selectedLang, setSelectedLang] = useState<'ar' | 'en'>('ar');

  const showToast = (msg: string) => {
    setCopiedText(msg);
    setTimeout(() => setCopiedText(null), 3000);
  };

  const handleOpenProfile = (tab: 'info' | 'subscriptions' = 'info') => {
    setCurrentScreen('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStatic = (key: 'about' | 'terms' | 'privacy' | 'faq') => {
    setActiveStaticPageKey(key);
    setCurrentScreen('static_page');
  };

  const handleShareApp = () => {
    const shareUrl = window.location.origin || 'https://nixt.sa';
    if (navigator.share) {
      navigator.share({
        title: 'موقع ومنصة نيكست لخدمات غسيل وتلميع السيارات',
        text: 'تفضل بزيارة موقع نيكست لحجز أفضل خدمات غسيل وتلميع السيارات المتنقلة!',
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast('تم نسخ رابط الموقع بنجاح!');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`تم نسخ الكود (${code}) بنجاح!`);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketTitle.trim() || !newTicketMessage.trim()) return;

    const newTicket: TicketItem = {
      id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTicketTitle,
      category: newTicketCategory,
      date: 'الآن',
      status: 'open',
      response: 'تم استلام تذكرتك بنجاح، جاري الرد عليك في أقرب وقت.'
    };

    setTickets([newTicket, ...tickets]);
    setNewTicketTitle('');
    setNewTicketMessage('');
    setShowNewTicketForm(false);
    showToast('تم إرسال تذكرتك بنجاح برقم: ' + newTicket.id);
  };

  const handleSendGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftRecipientPhone.trim()) return;
    setGiftSuccess(true);
    setTimeout(() => {
      setGiftSuccess(false);
      setShowGiftsModal(false);
      setGiftRecipientPhone('');
      setGiftRecipientName('');
      showToast('تم إرسال الهدية بنجاح إلى الرقم المرفق!');
    }, 1800);
  };

  return (
    <div className="space-y-6 pb-10 text-right animate-in fade-in duration-300 w-full">
      
      {/* Toast Feedback */}
      {copiedText && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-2xl border border-slate-700 backdrop-blur-md animate-in fade-in zoom-in-95 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{copiedText}</span>
        </div>
      )}

      {/* 1. Header Bar */}
      <div className="bg-[#1a1b4b] rounded-3xl p-5 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5 font-bold text-xs bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
          <Wallet className="w-3.5 h-3.5 text-amber-300" />
          <span className="font-mono">{walletBalance.toFixed(2)}</span>
          <span className="text-[11px] text-amber-300">ر.س</span>
        </div>
        <h2 className="text-lg font-black tracking-wide">حسابي - لوحة التحكم</h2>
      </div>

      {/* 2. Top Profile Card Matching Screenshot 15 */}
      <div 
        onClick={() => handleOpenProfile('info')}
        className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white p-1 shadow-md shrink-0 flex items-center justify-center overflow-hidden border-2 border-white/80">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-amber-400 via-orange-500 to-blue-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                🚗
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                {user.name || 'شركة ترو فينتشر'}
              </h3>
              <Edit2 className="w-4 h-4 text-white/90 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-xs text-white/90 font-mono tracking-wider" dir="ltr">
              +{user.phone || '966505555555'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid container for account sections on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* 3. قسم الحساب (Account Section) */}
      <div className="space-y-1.5 pt-2">
        <h4 className="text-xs font-bold text-slate-500 px-3">الحساب</h4>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
          
          {/* الملف الشخصي */}
          <button
            id="menu-btn-profile"
            onClick={() => handleOpenProfile('info')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-right group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">الملف الشخصي</span>
                <span className="text-[11px] text-slate-400">تعديل الاسم، الجوال، وكلمة المرور</span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* الاشتراكات */}
          <button
            id="menu-btn-subscriptions"
            onClick={() => handleOpenProfile('subscriptions')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-right group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">الاشتراكات</span>
                <span className="text-[11px] text-slate-400">باقات الغسيل الشهرية والغسلات المتبقية</span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* سياراتي */}
          <button
            id="menu-btn-cars"
            onClick={() => {
              setCurrentScreen('cars');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-right group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <CarIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">سياراتي</span>
                <span className="text-[11px] text-slate-400">إضافة مركبات جديدة وتعديل اللوحات</span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* عناويني */}
          <button
            id="menu-btn-addresses"
            onClick={() => {
              setCurrentScreen('addresses');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-right group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">عناويني</span>
                <span className="text-[11px] text-slate-400">تحديد مواقع الغسيل على الخريطة</span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

        </div>
      </div>

      {/* 4. قسم المكافآت (Rewards Section) */}
      <div className="space-y-1.5 pt-2">
        <h4 className="text-xs font-bold text-slate-500 px-3">المكافآت</h4>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
          
          {/* ادع واكسب */}
          <button
            id="menu-btn-referral"
            onClick={() => setCurrentScreen('referral')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-right group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">ادع واكسب</span>
                <span className="text-[11px] text-emerald-600 font-bold">احصل على 25 ر.س رصيد لكل صديق</span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* إرسال الهدايا */}
          <button
            id="menu-btn-gifts"
            onClick={() => setCurrentScreen('send_gift')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-right group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">إرسال الهدايا</span>
                <span className="text-[11px] text-slate-400">أهدِ أحبابك غسيل مجاني أو رصيد محفظة</span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

        </div>
      </div>

      {/* 5. قسم الإعدادات والتفضيلات (Settings & Preferences Section) */}
      <div className="space-y-1.5 pt-2">
        <h4 className="text-xs font-bold text-slate-500 px-3">الإعدادات والتفضيلات</h4>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
          
          {/* زر خاص بالإعدادات */}
          <button
            id="menu-btn-settings"
            onClick={() => {
              setCurrentScreen('settings');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-right group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">الإعدادات</span>
                <span className="text-[11px] text-slate-400">خيارات الإشعارات، مفتاح تفعيل التنبيهات، واللغة</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                تفضيلات
              </span>
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </button>

          {/* الإشعارات */}
          <button
            id="menu-btn-notifications"
            onClick={() => {
              setCurrentScreen('settings');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-right group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">خيارات الإشعارات</span>
                <span className="text-[11px] text-slate-400">تنبيهات المواعيد، العروض، والرسائل</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                notificationSettings.enabled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {notificationSettings.enabled ? 'مفعلة' : 'معطلة'}
              </span>
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </button>

          {/* اللغة */}
          <button
            id="menu-btn-language"
            onClick={() => {
              setCurrentScreen('settings');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-right group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-800">اللغة</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {language === 'ar' ? 'العربية' : 'English'}
              </span>
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </button>

        </div>
      </div>

      {/* 6. قسم الدعم الفنى (Technical Support Section) */}
      <div className="space-y-1.5 pt-2">
        <h4 className="text-xs font-bold text-slate-500 px-3">الدعم الفنى</h4>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
          
          {/* المساعدة */}
          <button
            id="menu-btn-help"
            onClick={() => setCurrentScreen('help')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-right group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">المساعدة والدعم الفني</span>
                <span className="text-[11px] text-slate-400">إرشادات الحجز، جودة الخدمة، ومشاكل الدفع</span>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* التذاكر */}
          <button
            id="menu-btn-tickets"
            onClick={() => setShowTicketsModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-right group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 block">تذاكر الدعم</span>
                <span className="text-[11px] text-slate-400">متابعة الشكاوى والاقتراحات</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                {tickets.length} تذاكر
              </span>
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </button>

        </div>
      </div>

      {/* 7. قسم حول الموقع (About Website Section) */}
      <div className="space-y-1.5 pt-2">
        <h4 className="text-xs font-bold text-slate-500 px-3">حول الموقع</h4>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
          
          {/* الشروط والأحكام */}
          <button
            id="menu-btn-terms"
            onClick={() => handleOpenStatic('terms')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-right group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-800">الشروط والأحكام</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* سياسة الخصوصية */}
          <button
            id="menu-btn-privacy"
            onClick={() => handleOpenStatic('privacy')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-right group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-800">سياسة الخصوصية</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* شارك رابط الموقع */}
          <button
            id="menu-btn-share"
            onClick={handleShareApp}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-right group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-slate-800">شارك رابط الموقع</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

        </div>
      </div>
      </div>

      {/* 8. بطاقة تسجيل الخروج المنفصلة */}
      <div className="pt-2">
        <button
          id="menu-btn-logout"
          onClick={() => setShowLogoutConfirmModal(true)}
          className="w-full p-4 rounded-2xl bg-[#fff1f2] border border-[#fecdd3]/80 flex items-center justify-between hover:bg-[#ffe4e6] transition-colors text-right text-[#e11d48] group shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#fee2e2] text-[#e11d48] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-sm font-black">تسجيل خروج</span>
          </div>
          <ChevronLeft className="w-4 h-4 text-[#fb7185] group-hover:text-[#e11d48] transition-colors" />
        </button>
      </div>

      {/* 9. أيقونات التواصل الاجتماعي وحقوق النشر والإصدار */}
      <div className="text-center space-y-3.5 pt-4 text-xs text-slate-400">
        <div className="flex items-center justify-center gap-5 text-white">
          {/* TikTok */}
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noreferrer"
            className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-md hover:scale-110 transition-transform font-bold"
            title="TikTok"
          >
            <span className="text-lg font-black">d</span>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 flex items-center justify-center shadow-md hover:scale-110 transition-transform font-bold"
            title="Instagram"
          >
            <span className="text-lg">📷</span>
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className="w-12 h-12 rounded-full bg-[#1877f2] flex items-center justify-center shadow-md hover:scale-110 transition-transform font-bold"
            title="Facebook"
          >
            <span className="text-lg font-black">f</span>
          </a>
        </div>

        <p className="font-bold text-slate-700 text-xs">
          © 2026 نيكست ، جميع الحقوق محفوظة
        </p>
        <p className="text-[11px] text-slate-400 font-mono font-medium">
          إصدار (7) 1.0.28
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 10. MODALS & DETAILED DESTINATIONS FOR EVERY OPTION IN THE MENU          */}
      {/* ========================================================================= */}

      {/* 1. Profile & Subscriptions Modal */}
      {showProfileModal && (
        <ProfileModal
          initialTab={profileInitialTab}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* 2. ادع واكسب Modal (Invite & Earn) */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 text-right space-y-5 animate-in zoom-in-95 relative">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute left-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2 pt-2">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-inner text-2xl">
                🎁
              </div>
              <h3 className="text-lg font-black text-slate-900">ادع أصدقائك واكسب 25 ر.س</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                شارك كود الدعوة الخاص بك، سيحصل صديقك على خصم 25 ر.س على أول حجز، وستحصل أنت على 25 ر.س في محفظتك فور إتمام الخدمة!
              </p>
            </div>

            {/* Referral Code Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-center space-y-2">
              <span className="text-[11px] font-bold text-slate-400">كود الدعوة الخاص بك</span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-xl font-black text-blue-900 tracking-wider">NX555</span>
                <button
                  onClick={() => handleCopyCode('NX555')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الكود</span>
                </button>
              </div>
            </div>

            {/* Total Earned */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100">
                <span className="text-[11px] text-emerald-700 block font-semibold">الأرباح المكتسبة</span>
                <span className="text-base font-black text-emerald-800">50.00 ر.س</span>
              </div>
              <div className="bg-blue-50 rounded-2xl p-3 border border-blue-100">
                <span className="text-[11px] text-blue-700 block font-semibold">الأصدقاء المنضمين</span>
                <span className="text-base font-black text-blue-800">2 عملاء</span>
              </div>
            </div>

            {/* Direct Share Button */}
            <button
              onClick={handleShareApp}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>مشاركة رابط الدعوة الآن</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. إرسال الهدايا Modal (Send Gifts) */}
      {showGiftsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 text-right space-y-5 animate-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowGiftsModal(false)}
              className="absolute left-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1 pt-1">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-xl">
                ✨
              </div>
              <h3 className="text-lg font-black text-slate-900">إرسال هدية غسيل سيارة</h3>
              <p className="text-xs text-slate-500">أهدِ غسيل فاخر لأصدقائك أو عائلتك بكل سهولة</p>
            </div>

            <form onSubmit={handleSendGift} className="space-y-4">
              {/* Select Gift Option */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">اختر نوع الهدية</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedGiftType('wash_premium')}
                    className={`p-3 rounded-2xl border text-right transition-all ${
                      selectedGiftType === 'wash_premium'
                        ? 'border-purple-600 bg-purple-50/70 text-purple-900 ring-2 ring-purple-300'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-black block">غسيل شامل متنقل</span>
                    <span className="text-[11px] text-purple-700 font-bold">59 ر.س</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGiftType('wallet_100')}
                    className={`p-3 rounded-2xl border text-right transition-all ${
                      selectedGiftType === 'wallet_100'
                        ? 'border-purple-600 bg-purple-50/70 text-purple-900 ring-2 ring-purple-300'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-black block">رصيد محفظة 100 ر.س</span>
                    <span className="text-[11px] text-purple-700 font-bold">100 ر.س</span>
                  </button>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">اسم المهدى إليه (اختياري)</label>
                <input
                  type="text"
                  value={giftRecipientName}
                  onChange={(e) => setGiftRecipientName(e.target.value)}
                  placeholder="مثال: محمد عبدالله"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">رقم جوال المستلم *</label>
                <input
                  type="tel"
                  required
                  value={giftRecipientPhone}
                  onChange={(e) => setGiftRecipientPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-right focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={giftSuccess}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {giftSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تم إرسال الهدية بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>تأكيد وإرسال الهدية</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. الإشعارات Modal (Notifications Settings & Alerts) */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 text-right space-y-5 animate-in zoom-in-95 relative">
            <button
              onClick={() => setShowNotificationsModal(false)}
              className="absolute left-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">إعدادات وتنبيهات الإشعارات</h3>
                <p className="text-[11px] text-slate-400">تخصيص الرسائل والتنبيهات المباشرة</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">إشعارات حالة الحجز والمواعيد</span>
                  <span className="text-[10px] text-slate-400">تنبيه عند وصول الفني وبدء الغسيل</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyBooking}
                  onChange={(e) => setNotifyBooking(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">العروض والخصومات الحصرية</span>
                  <span className="text-[10px] text-slate-400">كوبونات الخصم وتخفيضات الباقات</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOffers}
                  onChange={(e) => setNotifyOffers(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">رسائل SMS التذكيرية</span>
                  <span className="text-[10px] text-slate-400">تلقي رسائل نصية قصيرة على الجوال</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifySMS}
                  onChange={(e) => setNotifySMS(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setShowNotificationsModal(false);
                showToast('تم حفظ تفضيلات الإشعارات بنجاح');
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
            >
              حفظ التفضيلات
            </button>
          </div>
        </div>
      )}

      {/* 5. تذاكر الدعم الفني Modal (Support Tickets) */}
      {showTicketsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 text-right space-y-5 animate-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowTicketsModal(false)}
              className="absolute left-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">تذاكر الدعم والمساعدة</h3>
                  <p className="text-[11px] text-slate-400">تواصل مباشر مع فريق الدعم الفني</p>
                </div>
              </div>

              {!showNewTicketForm && (
                <button
                  onClick={() => setShowNewTicketForm(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>تذكرة جديدة</span>
                </button>
              )}
            </div>

            {/* Create New Ticket Form */}
            {showNewTicketForm ? (
              <form onSubmit={handleCreateTicket} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-900 pb-1">فتح تذكرة دعم جديدة</h4>
                
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">نوع الاستفسار / القسم</label>
                  <select
                    value={newTicketCategory}
                    onChange={(e) => setNewTicketCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  >
                    <option value="خدمة العملاء">خدمة العملاء العامة</option>
                    <option value="المواعيد والحجوزات">المواعيد والحجوزات</option>
                    <option value="المدفوعات والمحفظة">المدفوعات ورصيد المحفظة</option>
                    <option value="الشكاوى والاقتراحات">الشكاوى ومستوى الخدمة</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">عنوان التذكرة *</label>
                  <input
                    type="text"
                    required
                    value={newTicketTitle}
                    onChange={(e) => setNewTicketTitle(e.target.value)}
                    placeholder="موجز الطلب أو المشكلة"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">التفاصيل والوصف *</label>
                  <textarea
                    required
                    rows={3}
                    value={newTicketMessage}
                    onChange={(e) => setNewTicketMessage(e.target.value)}
                    placeholder="يرجى كتابة التفاصيل لمساعدتك بأفضل طريقة..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    إرسال التذكرة
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewTicketForm(false)}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            ) : (
              /* Tickets List */
              <div className="space-y-3">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-blue-900 bg-blue-100/60 px-2 py-0.5 rounded-md">
                        {ticket.id}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        ticket.status === 'open' ? 'bg-amber-100 text-amber-700' :
                        ticket.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {ticket.status === 'open' ? 'قيد المراجعة' : ticket.status === 'pending' ? 'جاري المعالجة' : 'مغلقة ومكتملة'}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-800">{ticket.title}</h4>
                    <p className="text-[11px] text-slate-500">{ticket.category} • {ticket.date}</p>

                    {ticket.response && (
                      <div className="mt-2 p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                        <span className="font-bold text-blue-800 block">رد فريق الدعم:</span>
                        <p>{ticket.response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. اللغة Modal (Language Selector) */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-right space-y-4 animate-in zoom-in-95">
            <h4 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              اختر لغة التطبيق / Select Language
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedLang('ar');
                  setShowLanguageModal(false);
                  showToast('تم ضبط اللغة على: العربية');
                }}
                className={`w-full p-3 rounded-xl border text-xs font-black flex items-center justify-between transition-all ${
                  selectedLang === 'ar'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-400/30'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>العربية (الافتراضية)</span>
                {selectedLang === 'ar' && <span>✓</span>}
              </button>

              <button
                onClick={() => {
                  setSelectedLang('en');
                  setShowLanguageModal(false);
                  showToast('Language set to: English');
                }}
                className={`w-full p-3 rounded-xl border text-xs font-black flex items-center justify-between transition-all ${
                  selectedLang === 'en'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-400/30'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>English</span>
                {selectedLang === 'en' && <span>✓</span>}
              </button>
            </div>

            <button
              onClick={() => setShowLanguageModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* 8. تأكيد تسجيل الخروج Modal */}
      {showLogoutConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto text-xl">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">تسجيل الخروج من الحساب</h3>
              <p className="text-xs text-slate-500 mt-1">هل أنت متأكد من رغبتك في تسجيل الخروج؟ يمكنك الدخول مرة أخرى في أي وقت.</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setShowLogoutConfirmModal(false);
                  logout();
                  setShowAuthModal(true);
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors"
              >
                نعم، تسجيل خروج
              </button>
              <button
                onClick={() => setShowLogoutConfirmModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

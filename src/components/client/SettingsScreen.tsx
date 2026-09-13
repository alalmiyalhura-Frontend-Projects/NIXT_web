import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Bell,
  Globe,
  Check,
  ArrowRight,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    notificationSettings,
    setNotificationSettings,
    toggleNotificationSetting,
    language,
    setLanguage,
    setCurrentScreen,
    user
  } = useApp();

  // Local feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggleNotifications = () => {
    const nextState = !notificationSettings.enabled;
    toggleNotificationSetting('enabled');
    showToast(nextState ? 'تم تفعيل استقبال الإشعارات بنجاح' : 'تم تعطيل استقبال الإشعارات');
  };

  const handleSelectLanguage = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    showToast(lang === 'ar' ? 'تم تفعيل اللغة العربية بنجاح' : 'English language has been activated');
  };

  const handleSavePreferences = () => {
    setIsSaved(true);
    showToast('تم حفظ جميع التفضيلات والإعدادات بنجاح!');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetDefaults = () => {
    setNotificationSettings({
      enabled: true,
      bookings: true,
      offers: true,
      sms: false,
      wallet: true,
    });
    setLanguage('ar');
    showToast('تمت استعادة الإعدادات الافتراضية');
  };

  return (
    <div className="space-y-6 pb-12 text-right animate-in fade-in duration-300 w-full select-none" dir="rtl">
      
      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-bold py-3 px-6 rounded-full shadow-2xl border border-slate-700 backdrop-blur-md animate-in fade-in zoom-in-95 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner & Breadcrumb */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          {/* Title & Icon */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-0.5">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('menu')}
                  className="hover:text-blue-600 transition-colors cursor-pointer"
                >
                  حسابي
                </button>
                <span>/</span>
                <span className="text-blue-600 font-black">الإعدادات</span>
              </div>
              <h1 className="text-xl font-black text-slate-900">
                إعدادات الحساب والتفضيلات
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                التحكم في استقبال إشعارات المنصة، خيارات التنبيه، واللغة المفضلة
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              id="btn-settings-back"
              onClick={() => setCurrentScreen('menu')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة لحسابي</span>
            </button>
            <button
              id="btn-settings-save"
              onClick={handleSavePreferences}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                isSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaved ? 'تم الحفظ' : 'حفظ التفضيلات'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Notifications Section (قسم خيارات الإشعارات مع Toggle) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">خيارات وتنبيهات الإشعارات</h2>
              <p className="text-xs text-slate-500">تخصيص الرسائل والتنبيهات المباشرة الواردة لهاتفك وحسابك</p>
            </div>
          </div>

          {/* Master Status Badge */}
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${
              notificationSettings.enabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {notificationSettings.enabled ? 'الإشعارات مفعلة' : 'الإشعارات معطلة'}
          </span>
        </div>

        {/* Master Toggle Card */}
        <div
          id="setting-master-notification-card"
          className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
            notificationSettings.enabled
              ? 'bg-blue-50/50 border-blue-200/80 ring-1 ring-blue-500/15'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">استقبال الإشعارات</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                المفتاح الرئيسي
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              تفعيل أو غلق استقبال جميع التنبيهات المباشرة لمتابعة الحجوزات والعروض الخاصة
            </p>
          </div>

          {/* Master Switch Button */}
          <button
            id="toggle-master-notifications"
            type="button"
            role="switch"
            aria-checked={notificationSettings.enabled}
            onClick={handleToggleNotifications}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
              notificationSettings.enabled ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span className="sr-only">تفعيل أو غلق استقبال الإشعارات</span>
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                notificationSettings.enabled ? '-translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. Language Section (قسم اللغة وتفعيل العربية أو الإنجليزية) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">اللغة المفضلة / Preferred Language</h2>
              <p className="text-xs text-slate-500">اختر لغة واجهة المنصة والتنبيهات المباشرة</p>
            </div>
          </div>

          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200/60">
            {language === 'ar' ? 'العربية (الافتراضية)' : 'English (Active)'}
          </span>
        </div>

        {/* Language Selection Interactive Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Option 1: Arabic */}
          <div
            id="lang-option-arabic"
            onClick={() => handleSelectLanguage('ar')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-4 group ${
              language === 'ar'
                ? 'bg-blue-50/40 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-xl">
                  🇸🇦
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900">اللغة العربية</h3>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      الافتراضية
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    واجهة باللغة العربية كاملة مع دعم الكتابة من اليمين لليسار (RTL)
                  </p>
                </div>
              </div>

              {/* Active Checkmark */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  language === 'ar'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'border-2 border-slate-300 group-hover:border-blue-400'
                }`}
              >
                {language === 'ar' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">حالة التفعيل:</span>
              <span
                className={`font-bold ${
                  language === 'ar' ? 'text-blue-700' : 'text-slate-500'
                }`}
              >
                {language === 'ar' ? 'مفعلة حالياً ✓' : 'اضغط للتفعيل'}
              </span>
            </div>
          </div>

          {/* Option 2: English */}
          <div
            id="lang-option-english"
            onClick={() => handleSelectLanguage('en')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-4 group ${
              language === 'en'
                ? 'bg-blue-50/40 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-xl">
                  🌐
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900">English Language</h3>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                      International
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    English application interface and notifications (LTR)
                  </p>
                </div>
              </div>

              {/* Active Checkmark */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  language === 'en'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'border-2 border-slate-300 group-hover:border-blue-400'
                }`}
              >
                {language === 'en' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Activation status:</span>
              <span
                className={`font-bold ${
                  language === 'en' ? 'text-blue-700' : 'text-slate-500'
                }`}
              >
                {language === 'en' ? 'Currently Active ✓' : 'Click to activate'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Reset & Additional Account Info Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <button
          id="btn-reset-settings"
          type="button"
          onClick={handleResetDefaults}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 py-2 cursor-pointer self-start"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>استعادة الإعدادات الافتراضية</span>
        </button>

        <p className="text-[11px] text-slate-400 font-medium">
          يتم حفظ جميع التغييرات تلقائياً ومزامنتها مع متصفحك.
        </p>
      </div>

    </div>
  );
};

import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Phone,
  Mail,
  Lock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Award,
  Calendar,
  Clock,
  Car as CarIcon,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  Eye,
  EyeOff,
  ShieldAlert,
  Plus,
  ArrowRight,
  CreditCard,
  Wallet,
  Check,
  Edit2,
  X
} from 'lucide-react';

interface ProfileScreenProps {
  initialTab?: 'info';
}

export const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const {
    user,
    updateProfile,
    changePassword,
    deleteAccount,
    userSubscriptions,
    setCurrentScreen,
    walletBalance,
  } = useApp();

  // Profile fields state
  const [fullName, setFullName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || `${user.phone || '966505555555'}@nixt.sa`);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isEditingProfile) {
      setFullName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || `${user.phone || '966505555555'}@nixt.sa`);
    }
  }, [user.name, user.phone, user.email, isEditingProfile]);

  // Start editing profile with auto-focus
  const handleStartEdit = (field?: 'name' | 'phone' | 'email') => {
    setIsEditingProfile(true);
    setProfileErrorMsg('');
    setTimeout(() => {
      if (field === 'phone') {
        phoneInputRef.current?.focus();
        phoneInputRef.current?.select();
      } else if (field === 'email') {
        emailInputRef.current?.focus();
        emailInputRef.current?.select();
      } else {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
      }
    }, 60);
  };

  // Cancel edit profile
  const handleCancelEditProfile = () => {
    setFullName(user.name || '');
    setPhone(user.phone || '');
    setEmail(user.email || `${user.phone || '966505555555'}@nixt.sa`);
    setIsEditingProfile(false);
    setProfileErrorMsg('');
  };

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete Account Confirmation Modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Subscription action feedback
  const [subActionMsg, setSubActionMsg] = useState<string | null>(null);

  // Handle Save Profile
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName.trim()) {
      setProfileErrorMsg('يرجى إدخال الاسم الكامل');
      nameInputRef.current?.focus();
      return;
    }
    setProfileErrorMsg('');
    updateProfile(fullName.trim(), phone.trim(), email.trim());
    setIsEditingProfile(false);
    setProfileSuccessMsg('تم حفظ وتحديث بيانات الحساب بنجاح!');
    setTimeout(() => setProfileSuccessMsg(''), 3500);
  };

  // Handle Update Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'يرجى إدخال كلمة المرور الحالية' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'يجب أن تتكون كلمة المرور الجديدة من 6 خانات على الأقل' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين' });
      return;
    }

    const res = changePassword(currentPassword, newPassword);
    if (res.success) {
      setPasswordMsg({ type: 'success', text: res.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 3500);
    } else {
      setPasswordMsg({ type: 'error', text: res.message });
    }
  };

  // Handle Delete Account
  const handleConfirmDelete = () => {
    if (deleteConfirmationText !== 'حذف نهائي') {
      alert('يرجى كتابة "حذف نهائي" للتأكيد');
      return;
    }
    deleteAccount();
    setShowDeleteConfirm(false);
    setCurrentScreen('home');
  };

  return (
    <div className="w-full space-y-6 text-right animate-in fade-in duration-300">
      {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-2">
          <button
            onClick={() => setCurrentScreen('home')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            الرئيسية
          </button>
          <span>/</span>
          <span className="text-slate-800 font-bold">الملف الشخصي والاشتراكات</span>
        </div>

        {/* User Account Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600/30 border-2 border-blue-400/40 flex items-center justify-center text-white text-2xl font-black shadow-inner overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name.charAt(0) || 'N'}</span>
                )}
              </div>

              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-white">{user.name || 'عميل نيكست'}</h1>
                <p className="text-xs sm:text-sm text-slate-300" dir="ltr">
                  +{user.phone || '966505555555'} • {user.email || 'user@nixt.sa'}
                </p>
              </div>
            </div>

            {/* Quick Stats Chips */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentScreen('wallet')}
                className="bg-white/10 hover:bg-white/15 transition-colors cursor-pointer backdrop-blur-xs border border-white/10 rounded-2xl p-3 px-4 min-w-[120px] text-center"
                title="عرض المحفظة"
              >
                <span className="text-[11px] text-slate-300 block">رصيد المحفظة</span>
                <span className="text-lg font-black text-emerald-400">{walletBalance.toFixed(2)} ر.س</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentScreen('subscriptions')}
                className="bg-white/10 hover:bg-white/15 transition-colors cursor-pointer backdrop-blur-xs border border-white/10 rounded-2xl p-3 px-4 min-w-[120px] text-center"
                title="الانتقال إلى شاشة الاشتراكات"
              >
                <span className="text-[11px] text-slate-300 block">الاشتراكات النشطة</span>
                <span className="text-lg font-black text-blue-300">
                  {userSubscriptions.filter(s => s.status === 'active').length} باقات
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* PERSONAL INFO & SECURITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Form 1: Personal Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">البيانات الشخصية ومعلومات الاتصال</h3>
                    <p className="text-xs text-slate-500">تُستخدم هذه البيانات للتواصل وتأكيد الحجوزات</p>
                  </div>
                </div>
                {!isEditingProfile ? (
                  <button
                    type="button"
                    onClick={() => handleStartEdit('name')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>تعديل</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    وضع التعديل مفعل
                  </span>
                )}
              </div>

              {profileSuccessMsg && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="bg-red-50 text-red-800 border border-red-200 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              {isEditingProfile && (
                <div className="bg-blue-50/70 border border-blue-200/70 p-3 rounded-xl text-xs font-medium text-blue-900 flex items-center gap-2 animate-in fade-in">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>يمكنك الآن تعديل الحقول بالأسفل مباشرة، ثم النقر على "حفظ التعديلات".</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">الاسم الكامل:</label>
                  <div className="relative">
                    <input
                      ref={nameInputRef}
                      type="text"
                      required
                      readOnly={!isEditingProfile}
                      value={fullName}
                      onClick={() => { if (!isEditingProfile) handleStartEdit('name'); }}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="الاسم الكامل"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-right transition-all ${
                        isEditingProfile
                          ? 'bg-white border-2 border-blue-500 shadow-xs focus:outline-none focus:ring-4 focus:ring-blue-500/15 text-slate-900 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 font-semibold cursor-pointer'
                      }`}
                    />
                    {!isEditingProfile && (
                      <Edit2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">رقم الجوال المعتمد:</label>
                  <div className="relative">
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      required
                      readOnly={!isEditingProfile}
                      value={phone}
                      onClick={() => { if (!isEditingProfile) handleStartEdit('phone'); }}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="966505555555"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-right transition-all ${
                        isEditingProfile
                          ? 'bg-white border-2 border-blue-500 shadow-xs focus:outline-none focus:ring-4 focus:ring-blue-500/15 text-slate-900 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 font-semibold cursor-pointer'
                      }`}
                      dir="ltr"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">البريد الإلكتروني للإشعارات والفواتير:</label>
                  <div className="relative">
                    <input
                      ref={emailInputRef}
                      type="email"
                      required
                      readOnly={!isEditingProfile}
                      value={email}
                      onClick={() => { if (!isEditingProfile) handleStartEdit('email'); }}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@nixt.sa"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-right transition-all ${
                        isEditingProfile
                          ? 'bg-white border-2 border-blue-500 shadow-xs focus:outline-none focus:ring-4 focus:ring-blue-500/15 text-slate-900 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 font-semibold cursor-pointer'
                      }`}
                      dir="ltr"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {isEditingProfile ? (
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 animate-in fade-in duration-200">
                    <button
                      type="submit"
                      id="btn-save-account-details"
                      className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-3.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span>حفظ التعديلات</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditProfile}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      type="button"
                      id="btn-start-edit-account"
                      onClick={() => handleStartEdit('name')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm py-3.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Edit2 className="w-4 h-4 stroke-[2.5]" />
                      <span>بيانات الحساب</span>
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Form 2: Password Change & Security */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">تغيير كلمة المرور والأمان</h3>
                    <p className="text-xs text-slate-500">قم بتحديث كلمة المرور لحماية حسابك</p>
                  </div>
                </div>

                {passwordMsg && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {passwordMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">كلمة المرور الحالية:</label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">كلمة المرور الجديدة:</label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">تأكيد كلمة المرور:</label>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>تحديث وتغيير كلمة المرور</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Danger Zone: Account Deletion */}
              <div className="bg-red-50/60 rounded-3xl p-6 border border-red-200/80 space-y-3">
                <div className="flex items-center gap-2 text-red-800">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <h4 className="text-sm font-black">منطقة إدارة الحساب الحساسة</h4>
                </div>
                <p className="text-xs text-red-700/80">
                  عند حذف الحساب سيتم مسح سجل طلباتك وعناوينك وباقاتك غير المستخدمة نهائياً.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-white hover:bg-red-100 text-red-600 border border-red-300 text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>طلب حذف الحساب نهائياً</span>
                </button>
              </div>
            </div>
          </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-right space-y-4 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="text-base font-bold text-slate-900">تأكيد حذف الحساب</h4>
                <p className="text-xs text-slate-500 mt-1">
                  اكتب <strong className="text-red-600 font-black">حذف نهائي</strong> لتأكيد رغبتك:
                </p>
              </div>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="حذف نهائي"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-center font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                >
                  تأكيد الحذف
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
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

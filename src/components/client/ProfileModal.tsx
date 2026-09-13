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
  X,
  Eye,
  EyeOff,
  ShieldAlert,
  Plus,
  Edit2
} from 'lucide-react';

interface ProfileModalProps {
  initialTab?: 'info' | 'subscriptions';
  onClose: () => void;
  onOpenBookingModal?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  initialTab = 'info',
  onClose,
  onOpenBookingModal
}) => {
  const {
    user,
    updateProfile,
    changePassword,
    deleteAccount,
    userSubscriptions,
    renewUserSubscription,
    useSubscriptionWash,
    pauseOrResumeSubscription,
    setCurrentScreen,
    setActiveServiceTab
  } = useApp();

  const [activeTab, setActiveTab] = useState<'info' | 'subscriptions'>(initialTab);

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
    setTimeout(() => setProfileSuccessMsg(''), 3000);
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
    deleteAccount();
    setShowDeleteConfirm(false);
    onClose();
  };

  // Handle Renew
  const handleRenewSub = (subId: string, planName: string) => {
    renewUserSubscription(subId);
    setSubActionMsg(`تم تجديد ${planName} بنجاح وإضافة رصيد الغسلات!`);
    setTimeout(() => setSubActionMsg(null), 3000);
  };

  // Handle Use Wash
  const handleUseWash = (subId: string) => {
    const success = useSubscriptionWash(subId);
    if (success) {
      setSubActionMsg('تم خصم غسلة واحدة من رصيدك. يمكنك الآن تثبيت الموعد المفضل!');
      setTimeout(() => setSubActionMsg(null), 3000);
      if (onOpenBookingModal) {
        setTimeout(() => {
          onClose();
          onOpenBookingModal();
        }, 800);
      }
    } else {
      alert('عفواً، لا يوجد رصيد غسلات متبقي في هذا الاشتراك. يرجى تجديد الباقة.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 text-right overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 my-auto">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white flex items-center justify-between border-b border-blue-600">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <User className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-['Cairo'] text-white">
                الملف الشخصي والاشتراكات
              </h3>
              <p className="text-xs text-blue-100">
                إدارة معلوماتك الشخصية، الأمان، وباقات الغسيل الدورية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* PERSONAL INFO & SECURITY & DELETE ACCOUNT */}
          <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Profile Card Header */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-black text-slate-900">
                      {user.name || 'عميل نيكست'}
                    </h4>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      عميل مميز
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono" dir="ltr">
                    +{user.phone || '966505555555'}
                  </p>
                </div>
              </div>

              {/* Success Banner */}
              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              {isEditingProfile && (
                <div className="bg-blue-50/70 border border-blue-200/70 p-3 rounded-xl text-xs font-medium text-blue-900 flex items-center gap-2 animate-in fade-in">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>وضع التعديل نشط: يمكنك الآن تعديل بياناتك والضغط على "حفظ التعديلات".</span>
                </div>
              )}

              {/* 1. Edit Personal Info Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <h5 className="text-xs sm:text-sm font-black text-slate-900">
                      بيانات الحساب ومعلومات الاتصال
                    </h5>
                  </div>
                  {!isEditingProfile && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit('name')}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>تعديل</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 block">
                        الاسم الكامل
                      </label>
                      {isEditingProfile ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          متاح للتعديل الآن
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">انقر للتعديل</span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        ref={nameInputRef}
                        type="text"
                        readOnly={!isEditingProfile}
                        value={fullName}
                        onClick={() => { if (!isEditingProfile) handleStartEdit('name'); }}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="الاسم الكامل"
                        className={`w-full pl-3 pr-9 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isEditingProfile
                            ? 'bg-white border-2 border-blue-500 shadow-xs focus:ring-4 focus:ring-blue-500/15 text-slate-900 focus:outline-none'
                            : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 cursor-pointer'
                        }`}
                        required
                      />
                      <User className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 block">
                        رقم الجوال
                      </label>
                      {isEditingProfile ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          متاح للتعديل الآن
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">انقر للتعديل</span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        ref={phoneInputRef}
                        type="tel"
                        readOnly={!isEditingProfile}
                        value={phone}
                        onClick={() => { if (!isEditingProfile) handleStartEdit('phone'); }}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="966505555555"
                        className={`w-full pl-3 pr-9 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isEditingProfile
                            ? 'bg-white border-2 border-blue-500 shadow-xs focus:ring-4 focus:ring-blue-500/15 text-slate-900 focus:outline-none'
                            : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 cursor-pointer'
                        }`}
                        dir="ltr"
                        required
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 block">
                        البريد الإلكتروني
                      </label>
                      {isEditingProfile ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          متاح للتعديل الآن
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">انقر للتعديل</span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        ref={emailInputRef}
                        type="email"
                        readOnly={!isEditingProfile}
                        value={email}
                        onClick={() => { if (!isEditingProfile) handleStartEdit('email'); }}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="user@nixt.sa"
                        className={`w-full pl-3 pr-9 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                          isEditingProfile
                            ? 'bg-white border-2 border-blue-500 shadow-xs focus:ring-4 focus:ring-blue-500/15 text-slate-900 focus:outline-none'
                            : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 cursor-pointer'
                        }`}
                        dir="ltr"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {isEditingProfile ? (
                  <div className="pt-2 flex items-center justify-end gap-2 animate-in fade-in duration-200">
                    <button
                      type="button"
                      onClick={handleCancelEditProfile}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span>حفظ التعديلات</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      type="button"
                      id="btn-start-edit-account-modal"
                      onClick={() => handleStartEdit('name')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Edit2 className="w-4 h-4 stroke-[2.5]" />
                      <span>بيانات الحساب</span>
                    </button>
                  </div>
                )}
              </form>

              {/* 2. Change Password Section */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <h5 className="text-xs sm:text-sm font-black text-slate-900">
                    تعديل كلمة المرور والأمان
                  </h5>
                </div>

                {passwordMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                      passwordMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {passwordMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-3">
                  {/* Current Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      كلمة المرور الحالية
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-left"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* New Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        كلمة المرور الجديدة
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-left"
                          dir="ltr"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        تأكيد كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all"
                    >
                      تحديث كلمة المرور
                    </button>
                  </div>
                </form>
              </div>

              {/* 3. Danger Zone: Delete Account */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-black text-red-900">
                        حذف الحساب نهائياً
                      </h5>
                      <p className="text-[11px] text-red-700 leading-relaxed mt-0.5">
                        سيؤدي هذا الإجراء إلى مسح كافة بياناتك وسجل الطلبات، ورصيد المحفظة والاشتراكات بشكل نهائي لا يمكن استرجاعه.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف الحساب</span>
                  </button>
                </div>
              </div>

              {/* Shortcut to Dedicated Subscriptions Screen */}
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-blue-900 font-bold">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>باقات الغسيل واشتراكاتك الدورية أصبحت متوفرة في شاشة الاشتراكات المخصصة</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setCurrentScreen('subscriptions');
                  }}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer text-center shrink-0"
                >
                  الانتقال للاشتراكات
                </button>
              </div>

            </div>

        </div>

        {/* Modal Footer Bottom */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            منصة NIXT • أمان وخصوصية بياناتك مضمونة 100%
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black rounded-xl transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>

      {/* Delete Account Double Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-red-200 text-right space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1">
              <h4 className="text-base font-black text-slate-900 font-['Cairo']">
                تأكيد حذف الحساب
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد تماماً من رغبتك في حذف حسابك؟ سيتم مسح بياناتك نهائياً ولن تتمكن من استعادتها.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 block">
                اكتب <strong className="text-red-600">حذف</strong> للتأكيد:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={e => setDeleteConfirmationText(e.target.value)}
                placeholder="حذف"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-center focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={deleteConfirmationText !== 'حذف'}
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs py-2.5 rounded-xl shadow-xs transition-all"
              >
                تأكيد الحذف النهائي
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmationText('');
                }}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
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

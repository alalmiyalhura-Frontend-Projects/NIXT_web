import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Phone, Mail, MapPin, Sparkles, CheckCircle2, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentScreen, setActiveStaticPageKey } = useApp();

  const handleOpenPage = (key: 'about' | 'terms' | 'privacy' | 'faq') => {
    setActiveStaticPageKey(key);
    setCurrentScreen('static_page');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-12 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800 text-right">
          <div className="flex items-center gap-3.5 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">غسيل متنقل فاخر</h4>
              <p className="text-xs text-slate-400 mt-0.5">نصلك أينما كنت بأحدث فانات الغسيل المجهزة</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">مواد أصلية وآمنة</h4>
              <p className="text-xs text-slate-400 mt-0.5">شامبو إيطالي وواكس مخصص لحماية الطلاء</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">التزام تام بالمواعيد</h4>
              <p className="text-xs text-slate-400 mt-0.5">كباتن محترفون وجدولة ذكية للسعة التشغيلية</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">دفع آمن وتقسيط</h4>
              <p className="text-xs text-slate-400 mt-0.5">مدى، ميسر، أبل باي، وتقسيط تابي وتمارا</p>
            </div>
          </div>
        </div>

        {/* Links Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 border-b border-slate-800 text-right">
          {/* Brand & Description */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                <span>N</span>
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight text-white">
                  NIXT <span className="text-amber-400 text-sm font-semibold">نيكست</span>
                </span>
                <p className="text-xs text-slate-400 font-normal">المنصة الشاملة لخدمات العناية بالمركبات والمتجر الإلكتروني</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              نوفر لك تجربة غسيل سيارات متنقلة واحترافية بأيدي كباتن مختصين وبأعلى معايير النظافة والتلميع، دون الحاجة للانتظار في المغاسل التقليدية.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span dir="ltr">920000000</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>support@nixt.sa</span>
              </div>
            </div>
          </div>

          {/* Quick Services */}
          <div>
            <h5 className="text-white text-sm font-bold mb-4">الخدمات والباقات</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => setCurrentScreen('home')} className="hover:text-amber-400 transition-colors">غسيل داخلي وخارجي</button></li>
              <li><button onClick={() => setCurrentScreen('home')} className="hover:text-amber-400 transition-colors">تلميع داخلي احترافي</button></li>
              <li><button onClick={() => setCurrentScreen('home')} className="hover:text-amber-400 transition-colors">غسيل بالبخار والتعقيم</button></li>
              <li><button onClick={() => setCurrentScreen('home')} className="hover:text-amber-400 transition-colors">الباقة الفضية والذهبية</button></li>
              <li><button onClick={() => setCurrentScreen('home')} className="hover:text-amber-400 transition-colors">الاشتراكات الشهرية</button></li>
            </ul>
          </div>

          {/* E-Store */}
          <div>
            <h5 className="text-white text-sm font-bold mb-4">متجر نيكست</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => setCurrentScreen('store')} className="hover:text-amber-400 transition-colors">اكسسوارات داخلية</button></li>
              <li><button onClick={() => setCurrentScreen('store')} className="hover:text-amber-400 transition-colors">شواحن وكيابل سيارة</button></li>
              <li><button onClick={() => setCurrentScreen('store')} className="hover:text-amber-400 transition-colors">تلبيسات مقاعد ومفارش</button></li>
              <li><button onClick={() => setCurrentScreen('store')} className="hover:text-amber-400 transition-colors">منتجات التنظيف والنانو</button></li>
              <li><button onClick={() => setCurrentScreen('store')} className="hover:text-amber-400 transition-colors">معطرات وتماثيل الديكور</button></li>
            </ul>
          </div>

          {/* Policies & Info */}
          <div>
            <h5 className="text-white text-sm font-bold mb-4">روابط ومساعدة</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => { setCurrentScreen('help'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-amber-400 transition-colors">مركز المساعدة والأسئلة</button></li>
              <li><button onClick={() => { setCurrentScreen('referral'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-amber-400 transition-colors">برنامج ادع واكسب</button></li>
              <li><button onClick={() => { setCurrentScreen('send_gift'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-amber-400 transition-colors">إرسال الهدايا</button></li>
              <li><button onClick={() => handleOpenPage('about')} className="hover:text-amber-400 transition-colors">عن منصة نيكست</button></li>
              <li><button onClick={() => handleOpenPage('terms')} className="hover:text-amber-400 transition-colors">الشروط والأحكام</button></li>
              <li><button onClick={() => handleOpenPage('privacy')} className="hover:text-amber-400 transition-colors">سياسة الخصوصية</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-center text-xs text-slate-500 border-t border-slate-800">
          <p className="text-center">© 2026 شركة نيكست لتقنية المعلومات NIXT. جميع الحقوق محفوظة - موثق لدى المركز السعودي للأعمال.</p>
        </div>
      </div>
    </footer>
  );
};

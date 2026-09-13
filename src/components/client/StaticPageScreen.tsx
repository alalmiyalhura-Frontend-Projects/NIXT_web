import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Shield, HelpCircle, Info, ArrowRight } from 'lucide-react';

export const StaticPageScreen: React.FC = () => {
  const { activeStaticPageKey, staticContent, setCurrentScreen } = useApp();

  let title = 'معلومات المنصة';
  let icon = <Info className="w-6 h-6 text-blue-600" />;
  let content = '';

  if (activeStaticPageKey === 'about') {
    title = 'عن منصة نيكست NIXT';
    icon = <Info className="w-6 h-6 text-blue-600" />;
    content = staticContent.aboutUs;
  } else if (activeStaticPageKey === 'terms') {
    title = 'الشروط والأحكام وسياسة الإلغاء';
    icon = <FileText className="w-6 h-6 text-blue-600" />;
    content = staticContent.termsAndConditions;
  } else if (activeStaticPageKey === 'privacy') {
    title = 'سياسة الخصوصية وأمن البيانات';
    icon = <Shield className="w-6 h-6 text-emerald-600" />;
    content = staticContent.privacyPolicy;
  } else if (activeStaticPageKey === 'faq') {
    title = 'الأسئلة الشائعة والمساعدة';
    icon = <HelpCircle className="w-6 h-6 text-amber-600" />;
  }

  return (
    <div className="space-y-6 pb-24 text-right animate-in fade-in duration-300 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <span className="text-xs text-slate-400 font-normal">آخر تحديث: أغسطس 2026</span>
          </div>
        </div>

        <button
          onClick={() => setCurrentScreen('home')}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all"
        >
          <span>العودة للرئيسية</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-slate-800 text-xs sm:text-sm leading-relaxed">
        {activeStaticPageKey === 'faq' ? (
          <div className="space-y-4">
            {staticContent.faq.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{item.q}</span>
                </h4>
                <p className="text-xs text-slate-600 font-normal leading-relaxed pr-4">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="whitespace-pre-line leading-relaxed text-slate-700 font-normal">
            {content}
          </div>
        )}
      </div>
    </div>
  );
};

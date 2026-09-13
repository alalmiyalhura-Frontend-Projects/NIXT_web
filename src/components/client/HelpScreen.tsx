import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  Folder,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Search,
  HelpCircle,
  Plus,
  X,
  CheckCircle2,
  Package,
  Calendar,
  Sparkles,
  Lightbulb,
  Image as ImageIcon,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubTopic {
  id: string;
  question: string;
  answer: string;
}

interface HelpCategory {
  id: string;
  title: string;
  subTopics: SubTopic[];
}

export const HelpScreen: React.FC = () => {
  const { setCurrentScreen, orders, addSupportTicket } = useApp();

  // Navigation levels
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>('b1');
  const [activeQuestionForMessage, setActiveQuestionForMessage] = useState<SubTopic | null>(null);

  // Message Form State (matching Screenshot 2)
  const [noteText, setNoteText] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showOrdersToggle, setShowOrdersToggle] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccessMessage, setIsSuccessMessage] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const helpCategories: HelpCategory[] = [
    {
      id: 'booking_issues',
      title: 'مشاكل الحجز',
      subTopics: [
        {
          id: 'b1',
          question: 'لا توجد مواعيد متاحة',
          answer: 'يمكنك اختيار تاريخ أو موقع مختلف.'
        },
        {
          id: 'b2',
          question: 'تم تأكيد الحجز ولكن العامل لم يصل',
          answer: 'يمكنك تتبع موقع الكابتن المباشر في الخريطة أو التواصل مع الكابتن مباشرة عبر الهاتف، أو رفع رسالة للدعم الفني وسنقوم بتوجيه كابتن بديل فوراً.'
        },
        {
          id: 'b3',
          question: 'كيفية إلغاء موعد الحجز؟',
          answer: 'توجه إلى تفاصيل الطلب من صفحة "طلباتي" واضغط على زر إلغاء الطلب قبل الموعد بـ 30 دقيقة لاسترداد المبلغ كاملاً إلى محفظتك الإلكترونية.'
        },
        {
          id: 'b4',
          question: 'هل يمكن إلغاء الحجز من قبل العميل ؟',
          answer: 'نعم، يحق للعميل إلغاء الحجز في أي وقت قبل مباشرة الكابتن للعمل وسيتم تحويل قيمة الحجز فوراً كرصيد متاح في المحفظة.'
        },
        {
          id: 'b5',
          question: 'في حال عدم تجاوب العميل بعد وصول المندوب',
          answer: 'يقوم الكابتن بالانتظار لمدة 15 دقيقة والتواصل معك هاتفياً، وفي حال تعذر الوصول يتم إعادة جدولة الموعد لوقت لاحق يناسبك دون إلغاء الخدمة.'
        }
      ]
    },
    {
      id: 'service_quality',
      title: 'جودة الخدمة',
      subTopics: [
        {
          id: 'q1',
          question: 'ما هو ضمان الجودة وإعادة الغسيل المجاني؟',
          answer: 'نضمن لك نظافة تامة ولمعاناً لا مثيل له. في حال وجود أي ملاحظة على نظافة السيارة، نوفر لك إعادة غسيل مجانية بالكامل خلال 24 ساعة دون أي رسوم.'
        },
        {
          id: 'q2',
          question: 'ما هي المواد المستخدمة وهل هي آمنة على النانو سيراميك؟',
          answer: 'نستخدم مواد إيطالية وألمانية معتمدة ومناشف مايكروفايبر معقمة لكل سيارة، وجميع المواد آمنة تماماً على الطلاء والنانو سيراميك.'
        },
        {
          id: 'q3',
          question: 'كيف يمكنني تقييم الكابتن وإرسال الملاحظات؟',
          answer: 'بعد انتهاء الخدمة مباشرة يمكنك تقييم الكابتن عبر النجوم وإضافة ملاحظاتك ليتم مراجعتها من قبل قسم الجودة.'
        }
      ]
    },
    {
      id: 'payment_issues',
      title: 'مشاكل الدفع',
      subTopics: [
        {
          id: 'p1',
          question: 'تم خصم المبلغ من البنك ولكن لم يتأكد الحجز',
          answer: 'يتم فك الحجز المالي تلقائياً من البنك خلال 24 ساعة، وإذا استمرت المشكلة يمكنك إرسال رسالة مع إرفاق إيصال الدفع للتحقق فوراً.'
        },
        {
          id: 'p2',
          question: 'ما هي وسائل الدفع المدعومة؟',
          answer: 'ندعم الدفع عبر مدى، Apple Pay، فيزا وماستركارد، رصيد المحفظة، وخدمات الدفع بالتقسيط (تابي وتمارا).'
        },
        {
          id: 'p3',
          question: 'متى يتم استرداد المبالغ عند الإلغاء؟',
          answer: 'الاسترداد إلى المحفظة فوري ولحظي، أما الاسترداد إلى البطاقة البنكية فيستغرق من 1 إلى 3 أيام عمل حسب البنك المصدر.'
        }
      ]
    },
    {
      id: 'membership_packages',
      title: 'العضوية والباقات',
      subTopics: [
        {
          id: 'm1',
          question: 'كيف تعمل باقات الغسيل والاشتراكات الشهرية؟',
          answer: 'تمنحك الباقات غسلات متعددة بسعر مخفض مع أولوية في المواعيد وإمكانية استخدامها لسيارات متعددة.'
        },
        {
          id: 'm2',
          question: 'كيف أجدد اشتراكي أو أوقف التجديد التلقائي؟',
          answer: 'من خلال صفحة "الاشتراكات" في ملفك الشخصي يمكنك التحكم في حالة الباقة وتفعيل أو إيقاف التجديد التلقائي بنقرة واحدة.'
        }
      ]
    },
    {
      id: 'general_inquiries',
      title: 'الاستفسارات العامة',
      subTopics: [
        {
          id: 'g1',
          question: 'ما هي المدن والمناطق المغطاة بخدمة نيكست؟',
          answer: 'نغطي كافة أحياء الرياض، جدة، مكة المكرمة، الدمام، والخبر، ونتوسع تدريجياً في كافة مناطق المملكة.'
        },
        {
          id: 'g2',
          question: 'هل يجب أن أكون متواجداً أثناء غسيل السيارة؟',
          answer: 'يكفي فتح السيارة للكابتن للغسيل الداخلي، أما للغسيل الخارجي فلا يشترط تواجدك في حال كانت السيارة بمكان يسهل الوصول إليه.'
        }
      ]
    }
  ];

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (uploadedImages.length + files.length > 3) {
      alert('يمكنك تحميل ما يصل إلى 3 صور فقط');
      return;
    }

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setUploadedImages(prev => [...prev, reader.result as string].slice(0, 3));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) {
      alert('يرجى كتابة وصف الملاحظة أو الاستفسار');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      if (activeQuestionForMessage) {
        addSupportTicket({
          category: selectedCategory?.title || 'عام',
          subject: activeQuestionForMessage.question,
          orderId: showOrdersToggle && selectedOrderId ? selectedOrderId : undefined,
          initialMessage: noteText.trim(),
          attachments: uploadedImages
        });
      }
      setIsSubmitting(false);
      setIsSuccessMessage(true);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    }, 700);
  };

  const resetMessageForm = () => {
    setNoteText('');
    setUploadedImages([]);
    setShowOrdersToggle(false);
    setSelectedOrderId('');
    setIsSuccessMessage(false);
    setActiveQuestionForMessage(null);
  };

  // -------------------------------------------------------------
  // LEVEL 3: Send Message / Note Screen (Matching Screenshot 2)
  // -------------------------------------------------------------
  if (activeQuestionForMessage) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-5 pb-20 text-right animate-in fade-in duration-300">
        {/* Top Header matching Screenshot 2: Question title + Blue Circle Back Arrow */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setActiveQuestionForMessage(null)}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0"
            title="الرجوع للأسئلة"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 text-center px-2 line-clamp-2">
            {activeQuestionForMessage.question}
          </h2>
          <div className="w-10 shrink-0" />
        </div>

        {isSuccessMessage ? (
          /* Success Card */
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5 animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">تم إرسال رسالتك بنجاح!</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                تم استلام ملاحظتك بخصوص «{activeQuestionForMessage.question}» وسيقوم فريق الدعم الفني بمراجعتها والتواصل معك خلال دقائق.
              </p>
            </div>
            <div className="pt-3 space-y-2">
              <button
                onClick={resetMessageForm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-2xl shadow-md transition-all text-xs sm:text-sm"
              >
                العودة إلى مركز المساعدة
              </button>
              <button
                onClick={() => {
                  resetMessageForm();
                  setCurrentScreen('menu');
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-2xl transition-all text-xs"
              >
                العودة للقائمة الرئيسية
              </button>
            </div>
          </div>
        ) : (
          /* Main Message Form matching Screenshot 2 */
          <form onSubmit={handleSendMessageSubmit} className="space-y-6 pt-2">
            {/* 1. Describe Note Textarea matching Screenshot 2 */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <textarea
                required
                rows={6}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="صف الملاحظة"
                className="w-full bg-transparent border-0 resize-none text-xs sm:text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none text-right"
              />
            </div>

            {/* 2. Image Upload Box matching Screenshot 2 */}
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-3">
                {/* Upload Plus Box */}
                {uploadedImages.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-2xl border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 bg-white flex items-center justify-center text-slate-600 transition-all group"
                  >
                    <Plus className="w-6 h-6 text-slate-600 group-hover:scale-110 transition-transform stroke-[2.5]" />
                  </button>
                )}

                {/* Uploaded Previews */}
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                    <img src={img} alt="مرفق" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Helper text matching Screenshot 2 */}
              <p className="text-[11px] text-slate-400 font-bold">
                يمكنك تحميل ما يصل إلى 3 صور
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200/80 pt-4" />

            {/* 3. Show Orders Toggle matching Screenshot 2 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOrdersToggle}
                    onChange={(e) => setShowOrdersToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm font-bold text-slate-800">
                  عرض الطلبات
                </span>
              </div>

              {/* Order Selection Panel when Toggle is ON */}
              {showOrdersToggle && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[11px] font-bold text-slate-500 block">
                    اختر الطلب المرتبط بهذه الملاحظة:
                  </label>
                  {orders && orders.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {orders.map((ord) => (
                        <div
                          key={ord.id}
                          onClick={() => setSelectedOrderId(ord.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            selectedOrderId === ord.id
                              ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900">
                                {ord.service?.title || 'طلب غسيل سيارة'}
                              </span>
                              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                #{ord.orderNumber}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {ord.date} • {ord.timeSlot}
                            </span>
                          </div>
                          <span className="text-xs font-black text-blue-600 font-['Cairo']">
                            {ord.totalAmount} ر.س
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-2 text-center">لا توجد طلبات سابقة مسجلة</p>
                  )}
                </div>
              )}
            </div>

            {/* 4. Action Button "ارسال" matching Screenshot 2 */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] text-base"
              >
                {isSubmitting ? 'جاري الإرسال...' : 'ارسال'}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // LEVEL 2: Sub-Topics & Questions View (Matching Screenshot 1)
  // -------------------------------------------------------------
  if (selectedCategory) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-5 pb-20 text-right animate-in fade-in duration-300">
        {/* Top Header matching Screenshot 1: "المساعدة والدعم الفني" + Blue Circle Back Arrow */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            title="العودة للقضايا الرئيسية"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              المساعدة والدعم الفني
            </h2>
            <p className="text-xs text-blue-600 font-bold mt-0.5">{selectedCategory.title}</p>
          </div>
          <div className="w-10" />
        </div>

        {/* Return to Main Topics Link matching Screenshot 1 */}
        <div className="pt-1 pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>العودة إلى القضايا الرئيسية</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Subtopic Question Cards matching Screenshot 1 */}
        <div className="space-y-3">
          {selectedCategory.subTopics.map((sub) => {
            const isExpanded = expandedQuestionId === sub.id;

            return (
              <div
                key={sub.id}
                className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-blue-400 shadow-md ring-1 ring-blue-200'
                    : 'border-slate-200/90 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Question Header Card */}
                <div
                  onClick={() => setExpandedQuestionId(isExpanded ? null : sub.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
                >
                  {/* Left Chevron Arrow */}
                  <div className="text-slate-400 p-1">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>

                  {/* Right: Question Title + Help Circle Icon matching Screenshot 1 */}
                  <div className="flex items-center gap-3">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                      {sub.question}
                    </h4>
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Expanded Solution & Action Button matching Screenshot 1 */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-100 animate-in fade-in duration-200">
                    {/* Solution Subheader */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs sm:text-sm">
                        <Lightbulb className="w-4 h-4" />
                        <span>الحل</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                        {sub.answer}
                      </p>
                    </div>

                    {/* Send Message Button matching Screenshot 1 */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveQuestionForMessage(sub)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-2xl shadow-md hover:shadow-blue-500/25 transition-all text-xs sm:text-sm active:scale-[0.99] flex items-center justify-center gap-2"
                      >
                        <span>إرسال رسالة</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LEVEL 1: Main Help Categories List (Adapted to Page Width)
  // -------------------------------------------------------------
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 text-right animate-in fade-in duration-300">
      {/* Top Bar with Back Arrow -> Takes user to Home Screen */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            setCurrentScreen('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
          title="العودة للصفحة الرئيسية"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          المساعدة والدعم الفني
        </h2>
        <div className="w-10" />
      </div>

      {/* Main Categories Cards matching the site layout width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {helpCategories.map((category, idx) => (
          <div
            key={category.id}
            onClick={() => {
              setSelectedCategory(category);
              setExpandedQuestionId(category.subTopics[0]?.id || null);
            }}
            className={`bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/90 hover:border-blue-400 hover:shadow-md transition-all group ${
              idx === helpCategories.length - 1 && helpCategories.length % 2 !== 0 ? 'md:col-span-2' : ''
            }`}
          >
            {/* Left Chevron */}
            <div className="text-slate-400 group-hover:text-blue-600 transition-colors p-1 shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </div>

            {/* Right Title + Subtitle Badge + Folder Icon */}
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="space-y-1.5 text-right">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {category.title}
                </h4>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50/90 px-3 py-1 rounded-xl">
                  <span>عرض المواضيع الفرعية ({category.subTopics.length})</span>
                  <span className="text-xs">↳</span>
                </span>
              </div>

              {/* Folder Icon in rounded square */}
              <div className="w-12 h-12 rounded-2xl bg-blue-50/90 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Folder className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

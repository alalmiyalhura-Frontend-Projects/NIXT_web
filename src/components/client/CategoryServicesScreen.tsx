import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceItem } from '../../types';
import {
  Car,
  Sparkles,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  ShieldCheck,
  Award,
  Truck,
  Heart,
  Tag,
  Copy,
  Check,
  PhoneCall,
  MessageSquare,
  Sofa,
  Cylinder,
  Bug,
  LayoutGrid,
  FileText,
  BadgePercent,
  SlidersHorizontal,
  ChevronLeft,
  Info,
  Home,
  Gift,
  CalendarCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryServicesScreenProps {
  onOpenCarModal?: () => void;
  onOpenAddressModal?: () => void;
}

interface CategoryMeta {
  id: string;
  categoryKey: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  heroImage: string;
  promoCode: string;
  promoDiscount: string;
  icon: React.ComponentType<{ className?: string }>;
  stats: { label: string; value: string }[];
  trustPoints: string[];
  subcategories: string[];
  faqs: { q: string; a: string }[];
  reviews: { name: string; city: string; rating: number; date: string; comment: string }[];
}

export const CategoryServicesScreen: React.FC<CategoryServicesScreenProps> = () => {
  const {
    services,
    packages,
    subscriptions,
    selectedCategory,
    setSelectedCategory,
    setCurrentScreen,
    openBookingModal,
    openPackageDetail,
    applyCoupon,
    appliedCoupon
  } = useApp();

  // Active Tab: 'services' (الخدمات) by default, and 'packages' (الباقات)
  const [activeTab, setActiveTab] = useState<'services' | 'packages'>('services');

  // When selected category changes, always reset default tab to 'services'
  useEffect(() => {
    setActiveTab('services');
  }, [selectedCategory]);

  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Favorite tracking
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nixt_fav_services');
      return saved ? JSON.parse(saved) : ['srv-ext', 'srv-sofa-3', 'srv-tank-upper'];
    } catch {
      return ['srv-ext', 'srv-sofa-3', 'srv-tank-upper'];
    }
  });

  const toggleFavorite = (serviceId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const updated = prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId];
      try {
        localStorage.setItem('nixt_fav_services', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // 6 Main Categories Definition matching the user's exact specification & screenshot
  const categoriesMap: Record<string, CategoryMeta> = useMemo(() => ({
    cars: {
      id: 'cars',
      categoryKey: 'cars',
      title: 'غسيل السيارات',
      subtitle: 'تلميع ونظافة شاملة لسيارتك',
      badge: 'الخدمة الأكثر طلباً في المملكة 🚗',
      description:
        'خدمات غسيل وتلميع متنقلة تصلك أينما كنت عند باب بيتك أو عملك. نستخدم أحدث المعدات الألمانية والمناشف المعقمة الخاصة لكل سيارة لضمان عدم حدوث أي خدوش، مع واكس حماية يدوم طويلاً وتعقيم المقصورة الداخلية بالكامل.',
      heroImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
      promoCode: 'X25',
      promoDiscount: 'خصم 25%',
      icon: Car,
      stats: [
        { label: 'سيارة تم غسلها', value: '+50,000' },
        { label: 'نسبة رضا العملاء', value: '99.4%' },
        { label: 'كابتن محترف مدرب', value: '+120' }
      ],
      trustPoints: [
        'غسيل متنقل بمعدات متكاملة عند باب موقعك',
        'واكس حماية للطلاء ضد أشعة الشمس والأتربة',
        'منشفة مايكروفايبر معقمة جديدة لكل سيارة',
        'ضمان إعادة الغسيل مجاناً في حال وجود أي ملاحظة'
      ],
      subcategories: ['الكل', 'غسيل خارجي', 'غسيل داخلي', 'تلميع واكس', 'باقات التوفير'],
      faqs: [
        {
          q: 'هل يحتاج الكابتن لتوفير ماء أو كهرباء من موقعي؟',
          a: 'لا، سيارات الخدمة المتنقلة مجهزة بالكامل بخزانات مياه عذبة ومولدات كهرباء صامتة دون الحاجة لأي تمديدات من منزلك.'
        },
        {
          q: 'كم يستغرق الغسيل المتنقل للسيارة الواحدة؟',
          a: 'يستغرق الغسيل الشامل الداخلي والخارجي ما بين 35 إلى 50 دقيقة حسب حجم السيارة ونوع الخدمة المختارة.'
        },
        {
          q: 'ما هو الضمان المقدم على الخدمة؟',
          a: 'نضمن لك نظافة ولمعان سيارتك 100%. في حال لم تكن راضياً تماماً، يتم إعادة الغسيل فوراً ومجاناً دون أي تكلفة إضافية.'
        }
      ],
      reviews: [
        {
          name: 'سلطان القحطاني',
          city: 'الرياض',
          rating: 5,
          date: 'منذ يومين',
          comment: 'دقة عالية في الموعد والكابتن كان في قمة الاحترام، والسيارة خرجت تلمع وكأنها خارجة من الوكالة!'
        },
        {
          name: 'عبدالله الشهري',
          city: 'جدة',
          rating: 5,
          date: 'منذ 4 أيام',
          comment: 'أفضل تجربة غسيل متنقل جربتها، أعجبني استخدام مناشف جديدة تماماً وتلميع الكفرات باحترافية.'
        },
        {
          name: 'نورة المطيري',
          city: 'الدمام',
          rating: 5,
          date: 'منذ أسبوع',
          comment: 'وفروا علي مشوار المغسلة والانتظار، خدمة راقية جداً وباقة التوفير ممتازة وسعرها اقتصادي.'
        }
      ]
    },
    carpets: {
      id: 'carpets',
      categoryKey: 'carpets',
      title: 'غسيل السجاد',
      subtitle: 'عناية احترافية للسجاد والموكيت',
      badge: 'استلام وتوصيل مجاني حتى باب بيتك 🚚',
      description:
        'غسيل آلي عميق للسجاد والموكيت بأحدث خطوط الغسيل والتطهير بالبخار لإزالة البقع العنيدة والروائح والتغليف الحراري مع استلام وتوصيل لباب بيتك.',
      heroImage: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
      promoCode: 'CARPET20',
      promoDiscount: 'خصم 20%',
      icon: Sparkles,
      stats: [
        { label: 'سجادة تم تنظيفها', value: '+35,000' },
        { label: 'توصيل مجاني', value: '100%' },
        { label: 'مدة التجهيز', value: '48 ساعة' }
      ],
      trustPoints: [
        'استلام وتوصيل مجاني من وإلى باب منزلك',
        'غسيل آلي عميق بمواد إيطالية تحافظ على الخيوط والألوان',
        'تطهير حراري وتعطير فندقي يدوم طويلاً',
        'تغليف آلي مفرغ من الهواء لحماية السجاد من الغبار'
      ],
      subcategories: ['الكل', 'غسيل بالمتر', 'باقات سجاد', 'موكيت وممرات', 'ألحفة وبطانيات'],
      faqs: [
        {
          q: 'كيف يتم حساب تكلفة غسيل السجاد؟',
          a: 'يتم احتساب السعر إما بالمتر المربع (12 ر.س / م²) أو بنظام الباقات الاقتصادية الشاملة لعدة قطع مع التوصيل المجاني.'
        },
        {
          q: 'كم يستغرق استلام السجاد وإعادته نظيفاً؟',
          a: 'تستغرق دورة الغسيل والتعقيم والتجفيف الآلي والتغليف من 48 إلى 72 ساعة كحد أقصى ويتم تسليمه لباب منزلك معطراً ومغلفاً.'
        },
        {
          q: 'هل المواد المستخدمة آمنة على السجاد الحريري والإيراني؟',
          a: 'نعم، لدينا خطوط غسيل خاصة للسجاد الحرير واليدوي تستخدم شامبوهات طبيعية معتدلة الحموضة لمنع تلف الألياف أو بهتان الصبغة.'
        }
      ],
      reviews: [
        {
          name: 'فاطمة الدوسري',
          city: 'الرياض',
          rating: 5,
          date: 'منذ 3 أيام',
          comment: 'السجاد رجع أنظف من الجديد ورائحة النظافة تفوح في الصالة، والتغليف راقي ومحكم جداً.'
        },
        {
          name: 'خالد الغامدي',
          city: 'الخبر',
          rating: 5,
          date: 'منذ أسبوع',
          comment: 'التزام دقيق بمواعيد الاستلام والتسليم، تم إزالة بقع قهوة قديمة عجزت عنها مغاسل ثانية.'
        }
      ]
    },
    furniture: {
      id: 'furniture',
      categoryKey: 'furniture',
      title: 'غسيل الكنب',
      subtitle: 'تجديد ونظافة عميقة لجميع أنواع الكنب',
      badge: 'تنظيف عميق بالبخار وجفاف خلال ساعتين 🛋️',
      description:
        'غسيل وتنظيف عميق للكنب والمجالس والمراتب بأجهزة الشفط والفرك بالبخار الحار لإزالة البقع المستعصية والروائح وتعقيم الأقمشة دون بهتان الألوان، مع مواد إيطالية صديقة للأقمشة.',
      heroImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      promoCode: 'SOFA30',
      promoDiscount: 'خصم 30%',
      icon: Sofa,
      stats: [
        { label: 'طقم كنب تم غسيله', value: '+20,000' },
        { label: 'سرعة الجفاف', value: 'ساعتين فقط' },
        { label: 'نسبة إزالة البقع', value: '98%' }
      ],
      trustPoints: [
        'تنظيف فوري في موقعك بدون الحاجة لنقل الكنب',
        'أجهزة فرك وشفط ألمانية متطورة تمنع تراكم الرطوبة',
        'إزالة روائح الحيوانات الأليفة والأطعمة العالقة',
        'تطهير بدرجة حرارة عالية للقضاء على البكتيريا وعثة الغبار'
      ],
      subcategories: ['الكل', 'كنب مفرد وثنائي', 'كنب 3 مقاعد', 'أطقم كنب كاملة', 'مجالس أرضية', 'مراتب سرير'],
      faqs: [
        {
          q: 'هل يجف الكنب بسرعة بعد عملية الغسيل؟',
          a: 'نعم، بفضل أجهزة الشفط ذات المحركات التوربينية المزدوجة، يجف الكنب بالكامل في غضون ساعتين إلى 3 ساعات كحد أقصى.'
        },
        {
          q: 'هل تؤثر المواد على ألوان الكنب الحساسة والمخمل؟',
          a: 'نقوم باختبار الأقمشة أولاً، وموادنا مصممة خصيصاً للمخمل والكتان والجلد لحماية الأنسجة وتثبيت الألوان.'
        }
      ],
      reviews: [
        {
          name: 'منيرة العتيبي',
          city: 'الرياض',
          rating: 5,
          date: 'منذ يومين',
          comment: 'الكنب كان عليه بقع عصير وألوان أطفال، الكابتن نظفه ورجعه كأنه جديد في أقل من ساعة!'
        },
        {
          name: 'محمد الصالح',
          city: 'جدة',
          rating: 5,
          date: 'منذ 5 أيام',
          comment: 'شغل احترافي ومحترم جداً، والريحة بعد الغسيل منعشة ولطيفة.'
        }
      ]
    },
    tanks: {
      id: 'tanks',
      categoryKey: 'tanks',
      title: 'تنظيف الخزانات',
      subtitle: 'مياه نظيفة وصحية لعائلتك',
      badge: 'تعقيم بمواد معتمدة من وزارة الصحة 💧',
      description:
        'تنظيف وتطهير شامل لخزانات المياه العلوية والأرضية مع شفط الرواسب والطين واستخدام معقمات ومطهرات صحية مصرحة تضمن مياه نقية وصحية بنسبة 100%، مع فحص سلامة العوامات والتسريبات.',
      heroImage: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=1200&q=80',
      promoCode: 'TANK15',
      promoDiscount: 'خصم 15%',
      icon: Cylinder,
      stats: [
        { label: 'خزان تم تعقيمه', value: '+12,000' },
        { label: 'نقاء المياه', value: '100%' },
        { label: 'ضمان معتمد', value: '30 يوماً' }
      ],
      trustPoints: [
        'شفط كامل للرواسب والطين والطحالب المتراكمة',
        'فرك جدران وأرضية الخزان بمطهرات غير كيميائية ضارة',
        'تعقيم بنسب الكلور الصحية الموصى بها رسمياً',
        'فحص العوامات ومنافذ التهوية وتقديم تقرير فني مجاني'
      ],
      subcategories: ['الكل', 'خزان علوي', 'خزان أرضي', 'باقة علوي + أرضي', 'عزل وتعقيم'],
      faqs: [
        {
          q: 'كم مرة ينصح بتنظيف خزان المياه منزلياً؟',
          a: 'توصي وزارة الصحة والجهات المختصة بتنظيف وتعقيم خزانات المياه مرة واحدة كل 6 أشهر على الأقل لضمان خلوها من البكتيريا والطحالب.'
        },
        {
          q: 'كم المدة التي يستغرقها تنظيف الخزان؟',
          a: 'يستغرق تنظيف الخزان العلوي حوالي 45 دقيقة، بينما الخزان الأرضي يستغرق من ساعة إلى ساعة ونصف.'
        },
        {
          q: 'هل يمكن استخدام المياه مباشرة بعد التنظيف؟',
          a: 'نعم، بعد انتهاء عملية التعقيم والشطف يتم تفريغ مياه الغسيل وتعبئة الخزان بمياه نقية جاهزة للاستخدام الآمن فوراً.'
        }
      ],
      reviews: [
        {
          name: 'م. فهد السبيعي',
          city: 'الرياض',
          rating: 5,
          date: 'منذ 3 أيام',
          comment: 'فرق شاسع في نقاء ورائحة المياه بعد التنظيف، الفنيين محترفين ونزلوا داخل الخزان ونظفوه بذمة وضمير.'
        },
        {
          name: 'سعد الحربي',
          city: 'مكة المكرمة',
          rating: 5,
          date: 'منذ أسبوع',
          comment: 'سعر مناسب جداً مقارنة بالشركات الثانية، وسرعة في الحضور والالتزام بالموعد المحدد.'
        }
      ]
    },
    pest_control: {
      id: 'pest_control',
      categoryKey: 'pest_control',
      title: 'مكافحة الحشرات',
      subtitle: 'بيئة صحية وآمنة لمنزلك ومكان عملك',
      badge: 'مبيدات ألمانية بدون رائحة وبدون مغادرة المنزل 🛡️',
      description:
        'إبادة ومكافحة فورية لجميع أنواع الحشرات والآفات المنزلية (الصراصير، بق الفراش، النمل الأبيض، القوارض) بمبيدات مرخصة آمنة على الأطفال والحيوانات الأليفة مع ضمان معتمد وزيارة متابعة مجانية.',
      heroImage: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=1200&q=80',
      promoCode: 'PEST20',
      promoDiscount: 'خصم 20%',
      icon: Bug,
      stats: [
        { label: 'منزل تم تحصينه', value: '+18,000' },
        { label: 'ضمان معتمد', value: 'حتى سنة' },
        { label: 'أمان بيئي', value: '100% بدون رائحة' }
      ],
      trustPoints: [
        'مبيدات معتمدة من هيئة الغذاء والدواء السعودية',
        'لا حاجة لمغادرة المنزل أو تفريغ أواني المطبخ',
        'حقن الجل الألماني في الشقوق ومكامن التكاثر',
        'سند ضمان معتمد وزيارة إعادة رش مجانية في حال ظهور أي حشرة'
      ],
      subcategories: ['الكل', 'مكافحة حشرات عامة', 'جل صراصير المطابخ', 'بق الفراش بالتبخير', 'النمل الأبيض والقوارض'],
      faqs: [
        {
          q: 'هل المبيدات تسبب حساسية أو رائحة كريهة؟',
          a: 'لا نهائياً، نستخدم تركيبات حديثة عديمة الرائحة وآمنة تماماً على مرضى الحساسية والأطفال وكبار السن.'
        },
        {
          q: 'ما هي مدة الضمان الممنوح لمكافحة الحشرات؟',
          a: 'يتراوح الضمان من 3 أشهر إلى سنة كاملة حسب نوع الحشرة ونوع الباقة المختارة، مع التزام بزيارات متابعة مجانية.'
        }
      ],
      reviews: [
        {
          name: 'إبراهيم العنزي',
          city: 'الرياض',
          rating: 5,
          date: 'منذ يومين',
          comment: 'تخلصت من مشكلة الصراصير الصغيرة في المطبخ من أول جلسة جل، ما شاء الله شغل مضمون ومريح.'
        },
        {
          name: 'ريم الشمري',
          city: 'حائل',
          rating: 5,
          date: 'منذ أسبوع',
          comment: 'الفريق محترم جداً والتزموا بالرش في كل الزوايا، وبدون أي رائحة تزعجنا.'
        }
      ]
    },
    other: {
      id: 'other',
      categoryKey: 'other',
      title: 'خدمات أخرى',
      subtitle: 'اكتشف المزيد من الخدمات قريباً',
      badge: 'قريباً في منصة نيكست 🚀',
      description:
        'نعمل باستمرار على توسيع باقة خدماتنا وتجهيز حلول وخدمات جديدة متكاملة لتلبية جميع احتياجاتكم بأعلى معايير الجودة والاحترافية.',
      heroImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
      promoCode: '',
      promoDiscount: '',
      icon: LayoutGrid,
      stats: [
        { label: 'حالة الخدمات', value: 'قريباً' },
        { label: 'تغطية مستقبلية', value: 'كافة المدن' },
        { label: 'ضمان الجودة', value: '100% معتمد' }
      ],
      trustPoints: [
        'معايير احترافية وتقنيات حديثة معتمدة',
        'كوادر فنية متخصصة ومعدات متطورة',
        'تغطية واسعة لكافة أحياء ومناطق المملكة',
        'ضمان جودة شامل وأسعار تنافسية عند الإطلاق'
      ],
      subcategories: ['الكل'],
      faqs: [],
      reviews: []
    }
  }), []);

  // Determine active category metadata
  const currentCategoryKey = (selectedCategory && categoriesMap[selectedCategory])
    ? selectedCategory
    : (selectedCategory === 'carpets_furniture' ? 'carpets' : 'cars');

  const currentCategoryMeta = categoriesMap[currentCategoryKey] || categoriesMap.cars;

  // Filter individual services belonging to this category
  const categoryServices = useMemo(() => {
    let list: ServiceItem[] = [];

    if (currentCategoryKey === 'cars') {
      list = services.filter(s => (s.category === 'cars' || s.category === 'wash_offers') && s.type !== 'package');
    } else if (currentCategoryKey === 'carpets') {
      list = services.filter(s => (s.category === 'carpets' || s.category === 'carpets_furniture' || s.category === 'curtains') && s.type !== 'package');
    } else if (currentCategoryKey === 'furniture') {
      list = services.filter(s => (s.category === 'furniture' || s.id.includes('sofa') || s.id.includes('majlis')) && s.type !== 'package');
    } else if (currentCategoryKey === 'tanks') {
      list = services.filter(s => (s.category === 'tanks' || s.id.includes('tank')) && s.type !== 'package');
    } else if (currentCategoryKey === 'pest_control') {
      list = services.filter(s => (s.category === 'pest_control' || s.id.includes('pest')) && s.type !== 'package');
    } else {
      // other
      list = services.filter(
        s => (s.category === 'ac' || s.category === 'kitchen' || s.category === 'facades' || s.category === 'post_construction' || s.category === 'sanitization') && s.type !== 'package'
      );
    }

    return list;
  }, [services, currentCategoryKey]);

  // Filter packages belonging strictly to this category and service
  const categoryPackages = useMemo(() => {
    let list: ServiceItem[] = [];

    if (currentCategoryKey === 'cars') {
      list = packages.filter(
        p => p.category === 'cars' || p.category === 'wash_offers' || p.title.includes('سيار') || p.id.includes('pkg-1') || p.id.includes('pkg-2') || p.id.includes('pkg-3')
      );
    } else if (currentCategoryKey === 'carpets') {
      list = packages.filter(
        p => p.category === 'carpets' || p.category === 'carpets_furniture' || p.id.includes('carpet') || p.title.includes('سجاد') || p.title.includes('موكيت')
      );
    } else if (currentCategoryKey === 'furniture') {
      list = packages.filter(
        p => p.category === 'furniture' || p.id.includes('furn') || p.title.includes('كنب') || p.title.includes('مجالس')
      );
    } else if (currentCategoryKey === 'tanks') {
      list = packages.filter(
        p => p.category === 'tanks' || p.id.includes('tank') || p.title.includes('خزان')
      );
    } else if (currentCategoryKey === 'pest_control') {
      list = packages.filter(
        p => p.category === 'pest_control' || p.id.includes('pest') || p.title.includes('حشرات')
      );
    } else {
      list = packages.filter(p => p.category === 'ac' || p.id.includes('ac') || p.category === 'other');
    }

    return list;
  }, [packages, currentCategoryKey]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    applyCoupon(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleBookService = (service: ServiceItem) => {
    openBookingModal(service);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-right pb-16" dir="rtl">
      
      {/* 1. Breadcrumbs & Back Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600">
          <button
            onClick={() => setCurrentScreen('home')}
            className="text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>الرئيسية</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500">الخدمات</span>
          <span className="text-slate-300">/</span>
          <span className="text-blue-600 font-black">
            {currentCategoryKey === 'other' ? 'اكتشف المزيد من الخدمات قريباً' : currentCategoryMeta.title}
          </span>
        </div>

        <button
          onClick={() => setCurrentScreen('home')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة إلى الرئيسية</span>
        </button>
      </div>

      {/* 2. Hero Showcase Banner for this Category */}
      <div className={`relative overflow-hidden rounded-3xl ${
        currentCategoryKey === 'other'
          ? 'bg-gradient-to-r from-slate-900 via-blue-900/90 to-indigo-900 border-blue-500/30'
          : 'bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 border-slate-700/60'
      } text-white shadow-xl`}>
        {/* Background Overlay Image */}
        <div className="absolute inset-0 z-0 opacity-30 mix-blend-luminosity overflow-hidden pointer-events-none">
          <img
            src={currentCategoryMeta.heroImage}
            alt={currentCategoryMeta.title}
            className="w-full h-full object-cover object-center"
          />
          <div className={`absolute inset-0 ${
            currentCategoryKey === 'other'
              ? 'bg-gradient-to-l from-indigo-950/70 via-blue-900/40 to-transparent'
              : 'bg-gradient-to-l from-slate-900/80 via-slate-800/60 to-transparent'
          }`} />
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Right Column: Information & Trust & Promo */}
          <div className="flex-1 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>{currentCategoryMeta.badge}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {currentCategoryKey === 'other' ? 'خدمات جديدة ومتميزة قادمة إليكم قريباً' : currentCategoryMeta.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentCategoryMeta.description}
            </p>

            {/* Trust Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {currentCategoryMeta.trustPoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {/* Promo Code Box or Announcement Callout */}
            {currentCategoryKey === 'other' ? (
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 px-4 py-2.5 rounded-xl backdrop-blur-xs text-amber-200 text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>تنبيه: لا تتوفر خدمات للحجز في هذا القسم حالياً • قيد التجهيز</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentScreen('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-400/10 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>الذهاب إلى الصفحة الرئيسية</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/90 px-3.5 py-2 rounded-xl backdrop-blur-xs">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-slate-300 font-medium">كوبون حصري:</span>
                  <span className="text-xs font-black text-amber-300 tracking-wider font-mono">
                    {currentCategoryMeta.promoCode}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400">
                    ({currentCategoryMeta.promoDiscount})
                  </span>
                </div>

                <button
                  onClick={() => handleCopyCode(currentCategoryMeta.promoCode)}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-400/10 cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>تم تطبيق الكوبون!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>تطبيق الكود الآن</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Left Column: Visual Image or Coming Soon Showcase */}
          {currentCategoryKey === 'other' ? (
            <div className="w-full lg:w-96 shrink-0">
              <div className="bg-slate-800/85 border border-slate-600/70 rounded-2xl p-6 backdrop-blur-md text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-400/20 text-blue-200 text-[11px] font-bold">
                    <Sparkles className="w-3 h-3 text-blue-300" />
                    <span>توسيع مستمر لخدماتنا</span>
                  </div>
                  <h3 className="text-lg font-black text-white">ترقبوا إطلاق خدماتنا الجديدة</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    نستعد لتوفير باقة متطورة من الحلول والخدمات لتلبية جميع احتياجاتكم وفق أعلى معايير الجودة والضمان.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                  <div className="bg-slate-700/70 border border-slate-600/60 rounded-xl p-2.5">
                    <div className="text-sm font-black text-amber-300">100%</div>
                    <div className="text-[10px] text-slate-300 font-medium">ضمان الجودة</div>
                  </div>
                  <div className="bg-slate-700/70 border border-slate-600/60 rounded-xl p-2.5">
                    <div className="text-sm font-black text-blue-300">قريباً</div>
                    <div className="text-[10px] text-slate-300 font-medium">إطلاق رسمي</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full lg:w-96 space-y-4 shrink-0">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl group">
                <img
                  src={currentCategoryMeta.heroImage}
                  alt={currentCategoryMeta.title}
                  className="w-full h-48 sm:h-56 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-full text-amber-400 font-bold border border-slate-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>4.9 / 5.0 (تقييمات معتمدة)</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                {currentCategoryMeta.stats.map((stat, idx) => (
                  <div key={idx} className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 backdrop-blur-xs">
                    <div className="text-sm sm:text-base font-black text-amber-300">{stat.value}</div>
                    <div className="text-[10px] text-slate-300 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Main Content (Full-Width Responsive Grid for Services or Coming Soon Showcase) */}
      {currentCategoryKey === 'other' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Informational Notice: No Services Currently Available */}
          <div className="py-8 px-4 text-center max-w-2xl mx-auto space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>تنبيه توضيحي</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              لا تتوفر خدمات للحجز في هذا القسم حالياً
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              نود إحاطتكم بأنه لا تتوفر خدمات مضافة للحجز المباشر في هذا القسم في الوقت الحالي، حيث نعمل على تجهيز وإطلاق باقة جديدة ومتميزة من الخدمات قريباً بأعلى معايير الاحترافية والضمان.
            </p>
          </div>

          {/* Active Categories Quick Jump */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>الخدمات المتاحة للحجز الفوري</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  الخدمات المتاحة حالياً للحجز الفوري
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                  يمكنك طلب أي من خدماتنا النشطة الآن مع وصول فوري إلى موقعك في الوقت المحدد:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {[
                { key: 'cars', title: 'غسيل السيارات', icon: Car, color: 'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-600 hover:text-white' },
                { key: 'carpets', title: 'غسيل السجاد', icon: Sparkles, color: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-600 hover:text-white' },
                { key: 'furniture', title: 'غسيل الكنب والمجالس', icon: Sofa, color: 'text-purple-600 bg-purple-50 border-purple-100 hover:bg-purple-600 hover:text-white' },
                { key: 'tanks', title: 'تنظيف الخزانات', icon: Cylinder, color: 'text-cyan-600 bg-cyan-50 border-cyan-100 hover:bg-cyan-600 hover:text-white' },
                { key: 'pest_control', title: 'مكافحة الحشرات', icon: Bug, color: 'text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-600 hover:text-white' }
              ].map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setSelectedCategory(cat.key);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2.5 text-center group cursor-pointer shadow-2xs ${cat.color}`}
                  >
                    <CatIcon className="w-6 h-6" />
                    <span className="text-xs font-black">{cat.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* Category Tabs: Services (Default) and Packages - Centered in Page */}
          <div className="flex justify-center items-center w-full py-2">
            <div className="inline-flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/90 shadow-2xs w-full max-w-xs sm:w-auto">
              {/* Tab 1: Services */}
              <button
                type="button"
                id="category-tab-services"
                onClick={() => setActiveTab('services')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-6 sm:px-8 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 border border-slate-200/60'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${activeTab === 'services' ? 'text-amber-300' : 'text-blue-600'}`} />
                <span>الخدمات</span>
              </button>

              {/* Tab 2: Packages */}
              <button
                type="button"
                id="category-tab-packages"
                onClick={() => setActiveTab('packages')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-6 sm:px-8 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                  activeTab === 'packages'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-orange-600 border border-slate-200/60'
                }`}
              >
                <Gift className={`w-4 h-4 ${activeTab === 'packages' ? 'text-amber-200' : 'text-orange-500'}`} />
                <span>الباقات</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Services List View */}
          {activeTab === 'services' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>قائمة خدمات {currentCategoryMeta.title}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
                    {categoryServices.length} خدمة متاحة
                  </span>
                </h3>
              </div>

              {categoryServices.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                  <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">لا توجد خدمات متاحة حالياً في هذا القسم</h4>
                  <p className="text-xs text-slate-500">سيتم إضافة خدمات جديدة قريباً</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {categoryServices.map((service) => {
                    const isFav = favorites.includes(service.id);
                    const hasDiscount = service.originalPrice && service.originalPrice > service.price;
                    const discountPercent = hasDiscount
                      ? Math.round(((service.originalPrice! - service.price) / service.originalPrice!) * 100)
                      : 0;

                    return (
                      <div
                        key={service.id}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group"
                      >
                        {/* Image Box */}
                        <div className="relative h-44 overflow-hidden bg-slate-100">
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60" />

                          {/* Favorite button */}
                          <button
                            onClick={(e) => toggleFavorite(service.id, e)}
                            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                              isFav
                                ? 'bg-red-500 text-white'
                                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-red-500 backdrop-blur-xs'
                            }`}
                            title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                          </button>

                          {/* Badge */}
                          {service.tag && (
                            <div className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs">
                              {service.tag}
                            </div>
                          )}

                          {/* Discount Badge */}
                          {hasDiscount && (
                            <div className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                              وفر {discountPercent}%
                            </div>
                          )}

                          {/* Duration */}
                          {service.durationMinutes && (
                            <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-300" />
                              <span>{service.durationMinutes} دقيقة</span>
                            </div>
                          )}
                        </div>

                        {/* Content Box */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                              {service.title}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {service.description}
                            </p>

                            {/* What's included bullet preview */}
                            {service.includes && service.includes.length > 0 && (
                              <div className="pt-2 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 block">تشمل الخدمة:</span>
                                {service.includes.slice(0, 2).map((inc, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 line-clamp-1">
                                    <Check className="w-3 h-3 text-blue-600 shrink-0" />
                                    <span className="truncate">{inc}</span>
                                  </div>
                                ))}
                                {service.includes.length > 2 && (
                                  <span className="text-[10px] text-blue-600 font-bold block pt-0.5">
                                    + {service.includes.length - 2} مميزات إضافية
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Price & Action */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] text-slate-400 block">السعر شامل الضريبة</span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-base sm:text-lg font-black text-blue-700">
                                  {service.price.toFixed(2)}
                                </span>
                                <span className="text-xs font-bold text-slate-700">ر.س</span>
                                {hasDiscount && (
                                  <span className="text-[11px] text-slate-400 line-through">
                                    {service.originalPrice?.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleBookService(service)}
                              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:shadow-md"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>إنشاء طلب</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Packages List View */}
          {activeTab === 'packages' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>باقات وعروض توفير {currentCategoryMeta.title}</span>
                  <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2.5 py-0.5 rounded-full">
                    {categoryPackages.length} باقة توفير
                  </span>
                </h3>
              </div>

              {categoryPackages.length === 0 ? (
                <div className="bg-white p-10 sm:p-12 rounded-3xl border border-slate-200 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
                    <Gift className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h4 className="text-base font-bold text-slate-800">لا توجد باقات متوفرة حالياً في هذا القسم</h4>
                    <p className="text-xs sm:text-sm text-slate-500">
                      يمكنك حجز الخدمات الفردية المتاحة أو التواصل مع خدمة العملاء لطلب باقة مخصصة
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('services')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>تصفح الخدمات الفردية</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {categoryPackages.map((pkg) => {
                    const savings = pkg.originalPrice ? pkg.originalPrice - pkg.price : 0;
                    const savingsPercent = pkg.originalPrice ? Math.round((savings / pkg.originalPrice) * 100) : 0;

                    return (
                      <div
                        key={pkg.id}
                        className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                      >
                        <div>
                          {/* Image & Badges */}
                          <div className="relative h-48 sm:h-52 w-full bg-slate-100 overflow-hidden">
                            <img
                              src={pkg.image}
                              alt={pkg.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                            {/* Top Badges */}
                            <div className="absolute top-3 right-3 flex items-center gap-2">
                              <span className="bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-xs">
                                {pkg.tag || 'باقة توفير 🎁'}
                              </span>
                              {savingsPercent > 0 && (
                                <span className="bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
                                  وفر {savingsPercent}%
                                </span>
                              )}
                            </div>

                            {pkg.durationMinutes && (
                              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span>{pkg.durationMinutes} دقيقة / للغسلة</span>
                              </div>
                            )}

                            {/* Title overlay on bottom of image */}
                            <div className="absolute bottom-3 right-3 left-3 text-white">
                              <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-sm">
                                {pkg.title}
                              </h3>
                            </div>
                          </div>

                          {/* Description & Inclusions */}
                          <div className="p-5 sm:p-6 space-y-4">
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                              {pkg.description}
                            </p>

                            {pkg.includes && pkg.includes.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                  <Zap className="w-3.5 h-3.5 text-orange-500" />
                                  <span>ما تشمله هذه الباقة:</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {pkg.includes.map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                      <span className="truncate">{feat}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price & Call to Action Footer */}
                        <div className="p-5 sm:p-6 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                          <div>
                            <span className="text-[11px] text-slate-400 font-medium block">
                              السعر الإجمالي للباقة شامل الضريبة
                            </span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-orange-600">
                                {pkg.price.toFixed(2)}
                              </span>
                              <span className="text-xs font-bold text-slate-700">ر.س</span>
                              {pkg.originalPrice && (
                                <span className="text-xs text-slate-400 line-through">
                                  {pkg.originalPrice.toFixed(2)} ر.س
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => openPackageDetail(pkg)}
                              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                            >
                              عرض التفاصيل
                            </button>
                            <button
                              onClick={() => openBookingModal(pkg)}
                              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                            >
                              <CalendarCheck className="w-4 h-4" />
                              <span>شراء وحجز الآن</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6. Step-by-Step "How It Works" Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-black text-blue-600 uppercase tracking-wider">خطوات بسيطة ومريحة</span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">كيف نخدمك في {currentCategoryMeta.title}؟</h3>
          <p className="text-xs text-slate-500">من لحظة الحجز وحتى تسليم الخدمة بكل راحة واطمئنان</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'اختر الخدمة والموعد',
              desc: 'حدد تفاصيل طلبك وحدد اليوم والوقت الأنسب لجدولك بكل سهولة عبر الموقع.'
            },
            {
              step: '02',
              title: 'وصول الكابتن المتخصص',
              desc: 'يصلك فريقنا المجهز بكامل المعدات والأدوات إلى موقعك في الوقت المحدد بالضبط.'
            },
            {
              step: '03',
              title: 'تنفيذ احترافي عالي الجودة',
              desc: 'تطبيق أعلى معايير النظافة والتعقيم والتلميع تحت إشراف فني متخصص.'
            },
            {
              step: '04',
              title: 'فحص النتيجة والدفع الآمن',
              desc: 'تأكد من نظافة ولمعان سيارتك أو منزلك وادفع بالطريقة التي تناسبك بعد رضاك التام.'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-right space-y-2 relative">
              <span className="text-2xl font-black text-blue-600/30 block font-mono">{item.step}</span>
              <h5 className="text-xs font-bold text-slate-900">{item.title}</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Verified Customer Reviews for this Specific Category */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              تجارب العملاء في {currentCategoryMeta.title}
            </h3>
            <p className="text-xs text-slate-500">آراء حقيقية من عملاء جربوا الخدمة في مختلف مدن المملكة</p>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs font-black text-amber-900">4.9 من 5.0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentCategoryMeta.reviews.map((rev, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{rev.name}</h5>
                    <span className="text-[10px] text-slate-400">{rev.city} • {rev.date}</span>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold pt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>طلب مؤكد ومكتمل</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

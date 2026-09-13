import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceItem } from '../../types';
import {
  Car as CarIcon,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  ArrowLeft,
  CalendarCheck,
  Flame,
  LayoutGrid,
  Heart,
  Sofa,
  Wand2,
  Cylinder,
  Bug,
  Brush,
  CookingPot,
  Building2,
  Blinds,
  ShieldCheck,
  AirVent,
  Tag,
  FileText,
  X,
  Droplets,
  Quote,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// 3D Illustration assets matching the design
import cardPackagesGift from '../../assets/images/card_packages_gift_1788336459498.jpg';
import cardSubscriptionsClipboard from '../../assets/images/card_subscriptions_clipboard_1788336474969.jpg';
import cardDiscountsCoupon from '../../assets/images/card_discounts_coupon_1788336491476.jpg';
import heroBannerImg from '../../assets/images/hero_car_wash_banner_1788336434912.jpg';

interface HomeScreenProps {
  onSelectService?: (service: ServiceItem) => void;
  onOpenCarModal?: () => void;
  onOpenAddressModal?: () => void;
}

interface CategoryCardItem {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconStyle: string;
  categoryKey: string;
  targetServiceId?: string;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectService }) => {
  const {
    services,
    packages,
    subscriptions,
    activeCategory,
    setActiveCategory,
    activeServiceTab,
    setActiveServiceTab,
    applyCoupon,
    openBookingModal,
    openPackageDetail,
    navigateToCategoryServices,
    setCurrentScreen
  } = useApp();

  // Banner carousel state
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isHoveredBanner, setIsHoveredBanner] = useState(false);

  const banners = [
    {
      id: 'b1',
      badge: 'عرض لفترة محدودة',
      title: 'استخدم كود الخصم',
      code: 'X25',
      desc: 'غسيل داخلي وخارجي شامل بـ 39 ر.س فقط بدلاً من 48 ر.س',
      actionCode: 'X25',
      btnText: 'احجز الآن واستفد'
    },
    {
      id: 'b2',
      badge: 'جديدنا المتنقل ✨',
      title: 'غسيل السجاد والكنب بالبخار',
      code: 'CARPET15',
      desc: 'تنظيف عميق بالبخار وإزالة البقع والروائح بأحدث المعدات الألمانية',
      category: 'carpets_furniture',
      btnText: 'احجز خدمة السجاد'
    },
    {
      id: 'b3',
      badge: 'توفير عائلي حصري 🎁',
      title: 'باقات واشتراكات الغسيل',
      code: 'SAVE35',
      desc: 'وفر حتى 35% مع هدايا مجانية ومناديل فاخرة لجميع سيارات العائلة',
      tab: 'packages',
      btnText: 'استكشف الباقات'
    }
  ];

  // Auto-play banner carousel with pause on hover
  useEffect(() => {
    if (isHoveredBanner) return;
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isHoveredBanner, banners.length]);

  const handleApplyBannerCode = (code: string) => {
    applyCoupon(code);
    const targetService = services.find(s => s.id === 'srv-ext' || s.id === 'srv-1') || services[0];
    handleServiceClick(targetService);
  };

  // Selected Category among the 12 items
  const [selectedCatId, setSelectedCatId] = useState<string>('cat-cars');

  // Favorites tracking
  const [favoriteServiceIds, setFavoriteServiceIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nixt_fav_services');
      return saved ? JSON.parse(saved) : ['srv-ext', 'srv-sofa-3'];
    } catch {
      return ['srv-ext', 'srv-sofa-3'];
    }
  });

  // Offers Carousel state & controls
  const [offerSlideIndex, setOfferSlideIndex] = useState<number>(0);
  const [isHoveredOffers, setIsHoveredOffers] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [cardsPerView, setCardsPerView] = useState<number>(3);

  // Responsive cards per view
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) {
          setCardsPerView(1);
        } else if (window.innerWidth < 1024) {
          setCardsPerView(2);
        } else {
          setCardsPerView(3);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Explorer view expanded
  const [showExplorer, setShowExplorer] = useState<boolean>(false);

  // Toggle favorite
  const toggleFavorite = (serviceId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteServiceIds(prev => {
      const exists = prev.includes(serviceId);
      const updated = exists ? prev.filter(id => id !== serviceId) : [...prev, serviceId];
      try {
        localStorage.setItem('nixt_fav_services', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleServiceClick = (service: ServiceItem) => {
    if (service.type === 'package') {
      openPackageDetail(service);
    } else if (onSelectService) {
      onSelectService(service);
    } else {
      openBookingModal(service);
    }
  };

  // The 6 Available Service Categories with dedicated icons
  const categoryItems: CategoryCardItem[] = useMemo(() => [
    {
      id: 'cat-cars',
      title: 'غسيل السيارات',
      subtitle: 'تلميع ونظافة شاملة لسيارتك',
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
      icon: CarIcon,
      iconStyle: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600',
      categoryKey: 'cars',
      targetServiceId: 'srv-ext'
    },
    {
      id: 'cat-carpets',
      title: 'غسيل السجاد',
      subtitle: 'عناية احترافية للسجاد والموكيت',
      image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
      icon: Brush,
      iconStyle: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600',
      categoryKey: 'carpets',
      targetServiceId: 'srv-carpet-m2'
    },
    {
      id: 'cat-furniture',
      title: 'غسيل الكنب',
      subtitle: 'تجديد ونظافة عميقة لجميع أنواع الكنب',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      icon: Sofa,
      iconStyle: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600',
      categoryKey: 'furniture',
      targetServiceId: 'srv-sofa-3'
    },
    {
      id: 'cat-tanks',
      title: 'تنظيف الخزانات',
      subtitle: 'مياه نظيفة وصحية لعائلتك',
      image: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
      icon: Droplets,
      iconStyle: 'bg-sky-50 text-sky-600 border-sky-100 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600',
      categoryKey: 'tanks',
      targetServiceId: 'srv-tank-upper'
    },
    {
      id: 'cat-pest',
      title: 'مكافحة الحشرات',
      subtitle: 'بيئة صحية وآمنة لمنزلك ومكان عملك',
      image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=800&q=80',
      icon: Bug,
      iconStyle: 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600',
      categoryKey: 'pest_control',
      targetServiceId: 'srv-pest'
    },
    {
      id: 'cat-others',
      title: 'خدمات أخرى',
      subtitle: 'اكتشف المزيد من الخدمات قريباً',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
      icon: LayoutGrid,
      iconStyle: 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600',
      categoryKey: 'other'
    }
  ], []);

  // Handle Category click - opens dedicated full-page view
  const handleCategoryCardClick = (cat: CategoryCardItem) => {
    setSelectedCatId(cat.id);
    navigateToCategoryServices(cat.categoryKey);
  };

  // Section 2: Services with Active Offers & Discounts
  const offerCards = useMemo(() => [
    {
      id: 'offer-cars-ext',
      serviceId: 'srv-ext',
      title: 'غسيل خارجي للسيارة',
      subtitle: 'رغوة واكس وتلميع الجنوط وتسويد الإطارات',
      badge: 'خصم 25% 🔥',
      badgeColor: 'bg-blue-600 text-white',
      bgGradient: 'from-blue-50/90 via-sky-50/40 to-white',
      borderColor: 'border-blue-200/80',
      price: '29.00 ر.س',
      originalPrice: '39.00 ر.س',
      couponCode: 'X25',
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'offer-carpets',
      serviceId: 'srv-carpet-m2',
      title: 'غسيل السجاد الفاخر',
      subtitle: 'تنظيف عميق بالبخار وإزالة البقع مع التغليف',
      badge: 'خصم 33% ⚡',
      badgeColor: 'bg-emerald-600 text-white',
      bgGradient: 'from-emerald-50/90 via-teal-50/40 to-white',
      borderColor: 'border-emerald-200/80',
      price: '12.00 ر.س / م²',
      originalPrice: '18.00 ر.س',
      couponCode: 'CARPET20',
      image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'offer-furniture',
      serviceId: 'srv-sofa-3',
      title: 'غسيل الكنب والمجالس',
      subtitle: 'رغوة جافة وتطهير بالبخار يزيل أصعب البقع',
      badge: 'وفر 40 ر.س ✨',
      badgeColor: 'bg-rose-500 text-white',
      bgGradient: 'from-rose-50/90 via-pink-50/40 to-white',
      borderColor: 'border-rose-200/80',
      price: '120.00 ر.س',
      originalPrice: '160.00 ر.س',
      couponCode: 'SOFA30',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'offer-cars-interior',
      serviceId: 'srv-interior',
      title: 'غسيل داخلي متكامل للسيارة',
      subtitle: 'تنظيف المراتب والديكورات وتعقيم التكييف مع تعطير',
      badge: 'خصم 25% 🚗',
      badgeColor: 'bg-indigo-600 text-white',
      bgGradient: 'from-indigo-50/90 via-blue-50/40 to-white',
      borderColor: 'border-indigo-200/80',
      price: '45.00 ر.س',
      originalPrice: '60.00 ر.س',
      couponCode: 'X25',
      image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'offer-tank-upper',
      serviceId: 'srv-tank-upper',
      title: 'تنظيف وتعقيم خزان علوي',
      subtitle: 'تفريغ الرواسب وتطهير بالكلور الصحي المعتمد',
      badge: 'خصم 30% 💧',
      badgeColor: 'bg-sky-600 text-white',
      bgGradient: 'from-sky-50/90 via-cyan-50/40 to-white',
      borderColor: 'border-sky-200/80',
      price: '90.00 ر.س',
      originalPrice: '130.00 ر.س',
      couponCode: 'TANK20',
      image: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'offer-pest',
      serviceId: 'srv-pest',
      title: 'مكافحة الحشرات ورش مبيدات',
      subtitle: 'مبيدات ألمانية بدون رائحة وآمنة مع ضمان معتمد',
      badge: 'وفر 60 ر.س 🛡️',
      badgeColor: 'bg-amber-600 text-white',
      bgGradient: 'from-amber-50/90 via-orange-50/40 to-white',
      borderColor: 'border-amber-200/80',
      price: '160.00 ر.س',
      originalPrice: '220.00 ر.س',
      couponCode: 'PEST20',
      image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=800&q=80'
    }
  ], []);

  // Max slide index depending on cards per view
  const maxOfferSlideIndex = useMemo(() => {
    return Math.max(0, offerCards.length - cardsPerView);
  }, [offerCards.length, cardsPerView]);

  // Clamp index on screen resize
  useEffect(() => {
    if (offerSlideIndex > maxOfferSlideIndex) {
      setOfferSlideIndex(maxOfferSlideIndex);
    }
  }, [maxOfferSlideIndex, offerSlideIndex]);

  // Auto-play interval for Offers Slider (every 4.5 seconds with pause on hover)
  useEffect(() => {
    if (isHoveredOffers) return;
    const interval = setInterval(() => {
      setOfferSlideIndex((prev) => (prev >= maxOfferSlideIndex ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [isHoveredOffers, maxOfferSlideIndex]);

  // Next / Prev for offers carousel
  const nextOfferSlide = () => {
    setOfferSlideIndex(prev => (prev >= maxOfferSlideIndex ? 0 : prev + 1));
  };
  const prevOfferSlide = () => {
    setOfferSlideIndex(prev => (prev <= 0 ? maxOfferSlideIndex : prev - 1));
  };

  // Touch Swipe for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setIsHoveredOffers(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    // In RTL, dragging left (diff > 45) advances to next slide
    if (diff > 45) {
      nextOfferSlide();
    } else if (diff < -45) {
      prevOfferSlide();
    }
    setTouchStartX(null);
    setIsHoveredOffers(false);
  };

  // Handle Offer Click: Applies promo coupon (if any) and navigates directly to booking flow for this service
  const handleOfferClick = (offer: typeof offerCards[0]) => {
    if (offer.couponCode) {
      applyCoupon(offer.couponCode);
    }
    const target = services.find(s => s.id === offer.serviceId) || services[0];
    handleServiceClick(target);
  };

  // Section 3: Popular Services (4 cards matching image.png exactly)
  const popularServicesData = useMemo(() => {
    return [
      {
        id: 'srv-tank-upper',
        title: 'تنظيف خزان علوي',
        price: '90.00 ر.س',
        subtitle: 'تنظيف وتعقيم شامل لمياه أكثر صحة',
        rating: '4.8',
        reviewsCount: '840',
        image: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
        badge: null,
        fallbackService: services.find(s => s.id === 'srv-tank-upper') || services[0]
      },
      {
        id: 'srv-sofa-3',
        title: 'غسيل كنب (3 مقاعد)',
        price: '120.00 ر.س',
        subtitle: 'تنظيف وتعقيم وإزالة البقع مع رائحة منعشة',
        rating: '4.8',
        reviewsCount: '980',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
        badge: null,
        fallbackService: services.find(s => s.id === 'srv-sofa-3') || services[0]
      },
      {
        id: 'srv-carpet-m2',
        title: 'غسيل سجاد (متر مربع)',
        price: '12.00 ر.س',
        subtitle: 'تنظيف عميق وإزالة البقع مع التجفيف السريع',
        rating: '4.7',
        reviewsCount: '760',
        image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
        badge: null,
        fallbackService: services.find(s => s.id === 'srv-carpet-m2') || services[0]
      },
      {
        id: 'srv-ext',
        title: 'غسيل خارجي للسيارة',
        price: '29.00 ر.س',
        subtitle: 'غسيل شامل للهيكل الخارجي مع تلميع وإزالة الأتربة',
        rating: '4.9',
        reviewsCount: '3200',
        image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
        badge: 'الأكثر طلباً',
        fallbackService: services.find(s => s.id === 'srv-ext') || services[0]
      }
    ];
  }, [services]);

  // Customer Reviews Carousel state & data
  const [reviewsSlideIndex, setReviewsSlideIndex] = useState<number>(0);
  const [isHoveredReviews, setIsHoveredReviews] = useState<boolean>(false);
  const [reviewsTouchStartX, setReviewsTouchStartX] = useState<number | null>(null);

  const customerReviewsData = useMemo(() => [
    {
      id: 'rev-1',
      name: 'فهد الشريف',
      location: 'جدة - حي الشاطئ',
      avatarBg: 'bg-blue-100 text-blue-700',
      initial: 'ف',
      service: 'غسيل متنقل شامل للسيارة',
      rating: 5,
      date: 'منذ يومين',
      review: 'ما شاء الله خدمة ممتازة جداً، الكابتن وصل بالموعد المحدد والسيارة رجعت كأنها وكالة وتلميع الكفرات والواكس ممتاز.'
    },
    {
      id: 'rev-2',
      name: 'عبدالله الحربي',
      location: 'جدة - حي الروضة',
      avatarBg: 'bg-emerald-100 text-emerald-700',
      initial: 'ع',
      service: 'تلميع داخلي وتعقيم بالبخار',
      rating: 5,
      date: 'منذ 3 أيام',
      review: 'أفضل تطبيق وموقع غسيل متنقل جربته في جدة، الفان مجهزة بالكامل ومناشف المايكروفايبر جديدة ونظيفة والتعامل راقي جداً.'
    },
    {
      id: 'rev-3',
      name: 'سارة القحطاني',
      location: 'الرياض - حي الملقا',
      avatarBg: 'bg-purple-100 text-purple-700',
      initial: 'س',
      service: 'غسيل سجاد وكنب بالبخار',
      rating: 5,
      date: 'منذ 5 أيام',
      review: 'غسيل السجاد والكنب بالبخار أرجع طقم الكنب مثل الجديد، وأزال بقع قديمة صعبة، وسهولة الحجز واختيار الموعد عبر الموقع رائعة.'
    },
    {
      id: 'rev-4',
      name: 'م. خالد الغامدي',
      location: 'الدمام - حي الشاطئ',
      avatarBg: 'bg-sky-100 text-sky-700',
      initial: 'خ',
      service: 'تنظيف وتعقيم خزان علوي',
      rating: 5,
      date: 'منذ أسبوع',
      review: 'فريق عمل محترف ودقة في المواعيد، قاموا بتفريغ الرواسب وتطهير الخزان بمواد مصرحة وآمنة، وأرسلوا تقرير صور قبل وبعد العمل.'
    },
    {
      id: 'rev-5',
      name: 'ريم الدوسري',
      location: 'الرياض - حي النرجس',
      avatarBg: 'bg-amber-100 text-amber-700',
      initial: 'ر',
      service: 'مكافحة حشرات ورش مبيدات',
      rating: 5,
      date: 'منذ أسبوعين',
      review: 'المبيدات ممتازة جداً بدون أي رائحة ومصرحة وآمنة للأطفال، التزموا بالضمان، والخدمة سريعة ومتقنة وأسعارهم تنافسية.'
    },
    {
      id: 'rev-6',
      name: 'محمد المنصور',
      location: 'مكة المكرمة - حي العوالي',
      avatarBg: 'bg-indigo-100 text-indigo-700',
      initial: 'م',
      service: 'باقة غسيل شهري للسيارات',
      rating: 5,
      date: 'منذ أسبوعين',
      review: 'مشترك في الباقة الشهرية من شهرين ومرتاح جداً، سيارتي دائماً نظيفة وبدون ما أتعنى للمغاسل وزحمتها، أنصح بهم بشدة.'
    }
  ], []);

  const maxReviewsSlideIndex = useMemo(() => {
    return Math.max(0, customerReviewsData.length - cardsPerView);
  }, [customerReviewsData.length, cardsPerView]);

  useEffect(() => {
    if (reviewsSlideIndex > maxReviewsSlideIndex) {
      setReviewsSlideIndex(maxReviewsSlideIndex);
    }
  }, [maxReviewsSlideIndex, reviewsSlideIndex]);

  // Auto-play for reviews slider (5 seconds with pause on hover)
  useEffect(() => {
    if (isHoveredReviews) return;
    const interval = setInterval(() => {
      setReviewsSlideIndex(prev => (prev >= maxReviewsSlideIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [isHoveredReviews, maxReviewsSlideIndex]);

  const nextReviewsSlide = () => {
    setReviewsSlideIndex(prev => (prev >= maxReviewsSlideIndex ? 0 : prev + 1));
  };
  const prevReviewsSlide = () => {
    setReviewsSlideIndex(prev => (prev <= 0 ? maxReviewsSlideIndex : prev - 1));
  };

  const handleReviewsTouchStart = (e: React.TouchEvent) => {
    setReviewsTouchStartX(e.touches[0].clientX);
    setIsHoveredReviews(true);
  };

  const handleReviewsTouchEnd = (e: React.TouchEvent) => {
    if (reviewsTouchStartX === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = reviewsTouchStartX - endX;
    if (diff > 45) {
      nextReviewsSlide();
    } else if (diff < -45) {
      prevReviewsSlide();
    }
    setReviewsTouchStartX(null);
    setIsHoveredReviews(false);
  };

  return (
    <div className="animate-in fade-in duration-300 pb-16 space-y-8 text-right" dir="rtl">
      
      {/* 1. Full-Width Promotional Hero Banner with rounded corners */}
      <div className="w-full px-3 sm:px-5 lg:px-8 pt-3 sm:pt-4">
        <div
          onMouseEnter={() => setIsHoveredBanner(true)}
          onMouseLeave={() => setIsHoveredBanner(false)}
          className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-950 text-white border border-slate-800/80 shadow-xl group"
        >
          {/* Background Image with Lighter, Clearer Gradient Overlay */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={heroBannerImg}
              alt="Car Wash Hero Banner"
              className="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-1000 opacity-95"
            />
            {/* Lighter Gradient Overlay: Clearer image on left, smooth readable contrast on right for text */}
            <div className="absolute inset-0 bg-gradient-to-l from-slate-950/85 via-slate-950/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30" />
          </div>

          {/* Floating Bubble Particles Animation */}
          <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ y: [0, -35, 0], x: [0, 15, 0], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/4 right-1/3 w-8 h-8 rounded-full border border-sky-300/40 bg-sky-200/10 backdrop-blur-xs shadow-inner"
            />
            <motion.div
              animate={{ y: [0, -45, 0], x: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-1/3 right-1/2 w-12 h-12 rounded-full border border-sky-300/30 bg-sky-100/10 backdrop-blur-xs shadow-inner"
            />
            <motion.div
              animate={{ y: [0, -25, 0], x: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute bottom-1/4 right-1/4 w-6 h-6 rounded-full border border-amber-300/40 bg-amber-200/10 backdrop-blur-xs shadow-inner"
            />
            <motion.div
              animate={{ y: [0, -40, 0], x: [0, -15, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="absolute top-12 left-1/4 w-10 h-10 rounded-full border border-white/30 bg-white/5 backdrop-blur-xs"
            />
          </div>

          {/* Inner Content Layer aligned with page layout */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 min-h-[260px] sm:min-h-[300px] md:min-h-[330px] flex flex-col justify-between">
            {/* Banner Carousel Content with Animated Transitions */}
            <div className="my-auto py-2 sm:py-4 w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={bannerIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-3 text-right max-w-2xl lg:max-w-3xl"
                >
                  {/* Limited Time Badge */}
                  <div className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-amber-300 text-xs font-semibold px-3.5 py-1 rounded-full border border-amber-400/30 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>{banners[bannerIndex].badge}</span>
                  </div>

                  {/* Headline & Discount Code Badge */}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2.5 leading-snug">
                    <span>{banners[bannerIndex].title}</span>
                    {banners[bannerIndex].code && (
                      <span className="bg-amber-400 text-slate-950 px-3 py-0.5 rounded-xl font-bold text-xl sm:text-2xl shadow-lg tracking-wider border border-amber-300 transform hover:scale-105 transition-transform">
                        {banners[bannerIndex].code}
                      </span>
                    )}
                  </h2>

                  {/* Subtitle Description */}
                  <p className="text-xs sm:text-sm md:text-base text-white/90 font-normal leading-relaxed max-w-2xl drop-shadow-xs">
                    {banners[bannerIndex].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Bar: Action Button + Pagination Dots */}
            <div className="flex items-center justify-between gap-4 pt-2 w-full">
              {/* Action CTA Button */}
              <button
                onClick={() => {
                  const current = banners[bannerIndex];
                  if (current.actionCode) {
                    handleApplyBannerCode(current.actionCode);
                  } else if (current.category) {
                    setActiveCategory(current.category as any);
                    setShowExplorer(true);
                  } else if (current.tab) {
                    setActiveServiceTab(current.tab as any);
                    setShowExplorer(true);
                  } else {
                    const s = services[0];
                    handleServiceClick(s);
                  }
                }}
                className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-semibold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-xl hover:shadow-amber-400/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{banners[bannerIndex].btnText}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Pagination Dots */}
              <div className="flex items-center gap-2">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setBannerIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      bannerIndex === idx ? 'w-7 bg-amber-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container with generous, balanced spacing between sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 lg:space-y-20 pt-6 sm:pt-10 pb-16">

        {/* ========================================================================= */}
        {/* SECTION 1: "اختر الخدمة التي تحتاجها" + 6 SERVICE CARDS GRID (FULL PAGE OPEN) */}
        {/* ========================================================================= */}
        <section className="space-y-6 sm:space-y-7">
          {/* Header: 2 Tabs (الخدمات / المتجر) + Section Title & Action Button */}
          <div className="space-y-4 sm:space-y-5 pb-1">
            {/* 1. Main Platform Tabs: Services vs Store - Equal size and enlarged */}
            <div className="flex items-center justify-center">
              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-100/90 rounded-2xl border border-slate-200/90 shadow-2xs w-full max-w-sm sm:max-w-md">
                {/* Services Tab (Active by default on Home) */}
                <button
                  type="button"
                  id="tab-services"
                  className="w-full flex items-center justify-center gap-2 sm:gap-2.5 py-3 sm:py-3.5 px-3 sm:px-5 rounded-xl font-bold text-sm sm:text-base bg-blue-600 text-white shadow-xs transition-all cursor-default"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <span className="whitespace-nowrap">الخدمات</span>
                </button>

                {/* Store Tab (Navigates to Store Screen) - Distinctive yet clean & simple */}
                <button
                  type="button"
                  id="tab-store"
                  onClick={() => setCurrentScreen('store')}
                  className="w-full flex items-center justify-center gap-2 sm:gap-2.5 py-3 sm:py-3.5 px-3 sm:px-5 rounded-xl font-bold text-sm sm:text-base bg-white hover:bg-slate-50 text-slate-800 hover:text-blue-600 border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer group active:scale-[0.98]"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="whitespace-nowrap">المتجر</span>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 px-1.5 sm:px-2 py-0.5 rounded-full group-hover:bg-amber-100 transition-colors whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>منتجات</span>
                  </span>
                </button>
              </div>
            </div>

            {/* 2. Section Header: Title & "عرض جميع الخدمات" Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  اختر الخدمة التي تحتاجها
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  خدماتنا بين يديك بكل سهولة
                </p>
              </div>

              <div>
                <button
                  id="btn-view-all-services"
                  onClick={() => navigateToCategoryServices('cars')}
                  className="text-blue-600 hover:text-blue-700 bg-blue-50/90 hover:bg-blue-100 border border-blue-200/80 px-4 py-2 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1.5 group cursor-pointer transition-all shadow-2xs"
                >
                  <span>عرض جميع الخدمات</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* 6 Category Cards: 6 columns on desktop, 3 on tablet, 2 on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categoryItems.map((cat) => {
              const isSelected = selectedCatId === cat.id;
              const IconComp = cat.icon;

              return (
                <button
                  key={cat.id}
                  id={cat.id}
                  onClick={() => handleCategoryCardClick(cat)}
                  className={`group relative flex flex-col justify-between items-center p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border transition-all duration-300 cursor-pointer h-[205px] sm:h-[225px] text-center shadow-2xs hover:shadow-md ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-300/40 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-blue-300'
                  }`}
                >
                  {/* Inner Image Frame Container with Border & Eye-Comfortable Soft Transparency */}
                  <div className="relative w-full h-24 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50 group-hover:border-blue-200 transition-all duration-300 shadow-2xs shrink-0">
                    {cat.image && (
                      <img
                        src={cat.image}
                        alt={cat.title}
                        className="w-full h-full object-cover object-center opacity-75 group-hover:opacity-95 group-hover:scale-108 transition-all duration-500 ease-out"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* Subtle soft tint for gentle, eye-friendly contrast */}
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-300" />

                    {/* Corner Icon Badge with Frosted Glass Effect */}
                    <div className="absolute top-1.5 right-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/90 backdrop-blur-md text-blue-600 shadow-2xs border border-white/80 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </div>

                  {/* Text Information on crisp comfortable white card background */}
                  <div className="space-y-0.5 w-full my-auto px-1">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                      {cat.title}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium line-clamp-1 leading-relaxed">
                      {cat.subtitle}
                    </p>
                  </div>

                  {/* Bottom Action Icon with Arrow */}
                  <div className="self-start mt-0.5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-500 flex items-center justify-center transition-all duration-200 shadow-2xs">
                      <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 2: "خدمات عليها عروض 🔥" CAROUSEL */}
        {/* ========================================================================= */}
        <section className="space-y-6 sm:space-y-7">
          {/* Header: Centered Text with Action Button on Left in RTL */}
          <div className="relative flex flex-col sm:flex-row items-center justify-center text-center pb-1">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
                <span>خدمات عليها عروض</span>
                <span className="text-amber-500">🔥</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                لا تفوت أفضل الأسعار لفترة محدودة
              </p>
            </div>

            <div className="sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2 mt-2 sm:mt-0">
              <button
                onClick={() => {
                  setCurrentScreen('offers');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-blue-600 hover:text-blue-700 bg-blue-50/90 hover:bg-blue-100 border border-blue-200/80 px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1.5 group cursor-pointer transition-all shadow-2xs"
              >
                <span>عرض جميع العروض</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Offer Cards Slider Container with Navigation Arrows */}
          <div
            className="relative group select-none"
            onMouseEnter={() => setIsHoveredOffers(true)}
            onMouseLeave={() => setIsHoveredOffers(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Carousel Navigation Arrow Right (Previous in RTL) */}
            <button
              onClick={prevOfferSlide}
              className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-slate-700 shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:text-blue-600 active:scale-95 transition-all cursor-pointer"
              aria-label="Previous Offer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Carousel Navigation Arrow Left (Next in RTL) */}
            <button
              onClick={nextOfferSlide}
              className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-slate-700 shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:text-blue-600 active:scale-95 transition-all cursor-pointer"
              aria-label="Next Offer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Viewport with overflow hidden */}
            <div className="overflow-hidden py-1 px-0.5">
              {/* Sliding Flex Track */}
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(${offerSlideIndex * (100 / cardsPerView)}%)`
                }}
              >
                {offerCards.map((offer) => (
                  <div
                    key={offer.id}
                    className="w-full sm:w-1/2 lg:w-1/3 min-w-full sm:min-w-[50%] lg:min-w-[33.333333%] shrink-0 px-2 sm:px-2.5"
                  >
                    <div
                      onClick={() => handleOfferClick(offer)}
                      className={`relative overflow-hidden rounded-3xl border ${offer.borderColor} bg-gradient-to-l ${offer.bgGradient} p-4 sm:p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex items-center justify-between min-h-[185px] sm:min-h-[195px] cursor-pointer group/card`}
                    >
                      {/* Right Content (Text & Action Button) */}
                      <div className="z-10 space-y-2 max-w-[62%]">
                        {/* Badges row */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`${offer.badgeColor} text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs`}>
                            {offer.badge}
                          </span>
                          {offer.couponCode && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-slate-700 border border-slate-200/80 shadow-2xs">
                              كود: {offer.couponCode}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug group-hover/card:text-blue-600 transition-colors line-clamp-1">
                          {offer.title}
                        </h4>

                        {/* Subtitle */}
                        <p className="text-[11px] sm:text-xs text-slate-500 font-medium line-clamp-1">
                          {offer.subtitle}
                        </p>

                        {/* Price Display */}
                        <div className="flex items-baseline gap-1.5 pt-0.5">
                          <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                            {offer.price}
                          </span>
                          {offer.originalPrice && (
                            <span className="text-xs text-slate-400 line-through font-medium">
                              {offer.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOfferClick(offer);
                            }}
                            className="bg-blue-600 group-hover/card:bg-blue-700 active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <span>اطلب الخدمة الآن</span>
                            <ArrowLeft className="w-3.5 h-3.5 group-hover/card:-translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>

                      {/* Left Content (Service Image) */}
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-xs shrink-0 bg-white border border-white/90 group-hover/card:scale-105 transition-transform duration-300">
                        <img
                          src={offer.image}
                          alt={offer.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: maxOfferSlideIndex + 1 }).map((_, dotIndex) => (
                <button
                  key={dotIndex}
                  onClick={() => setOfferSlideIndex(dotIndex)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    offerSlideIndex === dotIndex
                      ? 'w-7 bg-blue-600'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Slide ${dotIndex + 1}`}
                />
              ))}
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 3: "أشهر الخدمات" (4 Popular Service Cards) */}
        {/* ========================================================================= */}
        <section className="space-y-6 sm:space-y-7">
          {/* Header: Centered Text with Action Button on Left in RTL */}
          <div className="relative flex flex-col sm:flex-row items-center justify-center text-center pb-1">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                أشهر الخدمات
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                الخدمات الأكثر طلباً من عملائنا
              </p>
            </div>

            <div className="sm:absolute sm:left-0 sm:top-1/2 sm:-translate-y-1/2 mt-2 sm:mt-0">
              <button
                onClick={() => {
                  navigateToCategoryServices('cars');
                }}
                className="text-blue-600 hover:text-blue-700 bg-blue-50/90 hover:bg-blue-100 border border-blue-200/80 px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-1.5 group cursor-pointer transition-all shadow-2xs"
              >
                <span>عرض الكل</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* 4 Cards Grid (Right to Left in RTL matching image) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {popularServicesData.map((item) => {
              const isFav = favoriteServiceIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  {/* Top Image & Floating Icons */}
                  <div className="relative h-44 sm:h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />

                    {/* Favorite Heart Button (Top Right in RTL) */}
                    <button
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-xs text-slate-500 hover:text-red-500 shadow-sm flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      aria-label="Add to favorites"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFav ? 'text-red-500 fill-red-500' : 'text-slate-400'
                        }`}
                      />
                    </button>

                    {/* Badge if present (e.g. الأكثر طلباً on Exterior Car Wash) */}
                    {item.badge && (
                      <div className="absolute top-3 left-3 bg-blue-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-xs">
                        {item.badge}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      {/* Title */}
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                        {item.title}
                      </h4>

                      {/* Subtitle */}
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-1 leading-relaxed">
                          {item.subtitle}
                        </p>
                      )}

                      {/* Rating & Count */}
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-800">{item.rating}</span>
                        <span className="text-slate-400">({item.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="pt-1">
                      <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        {item.price}
                      </span>
                    </div>

                    {/* Action Button: "📄 إنشاء طلب" (White with blue border & blue text) */}
                    <button
                      onClick={() => handleServiceClick(item.fallbackService)}
                      className="w-full bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-600 font-bold text-xs sm:text-sm py-2.5 rounded-xl border border-blue-600 shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>إنشاء طلب</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 4: "الباقات والاشتراكات والعروض" (3 Wide Cards) */}
        {/* ========================================================================= */}
        <section className="space-y-6 sm:space-y-7">
          {/* Header: Centered Text */}
          <div className="space-y-1 text-center mx-auto pb-1">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight text-center">
              الباقات والاشتراكات والعروض
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium text-center">
              وفّر أكثر مع باقاتنا وعروضنا المميزة
            </p>
          </div>

          {/* 3 Cards Grid (Right to Left in RTL matching image) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">

            {/* Card 1: الباقات (Warm Orange / Peach Theme with 3D Gift Box) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setCurrentScreen('packages');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setCurrentScreen('packages');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="relative overflow-hidden rounded-3xl border border-orange-200/80 bg-gradient-to-l from-orange-50/90 via-amber-50/50 to-white p-5 sm:p-6 shadow-xs hover:shadow-md active:scale-[0.99] transition-all duration-300 flex items-center justify-between group cursor-pointer"
            >
              {/* Text & Action */}
              <div className="z-10 space-y-2 max-w-[65%]">
                <h4 className="text-lg sm:text-xl font-black text-orange-500">
                  الباقات
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  باقات متكاملة تناسب احتياجاتك
                </p>
                <div className="pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentScreen('packages');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white hover:bg-slate-50 active:scale-95 text-slate-800 font-bold text-xs px-4 py-2 rounded-full border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>عرض الباقات</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 3D Gift Box Illustration */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 group-hover:scale-108 transition-transform duration-300">
                <img
                  src={cardPackagesGift}
                  alt="الباقات"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Card 2: الاشتراكات (Fresh Mint / Green Theme with 3D Calendar / Clipboard) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setCurrentScreen('subscriptions');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setCurrentScreen('subscriptions');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-l from-emerald-50/90 via-teal-50/50 to-white p-5 sm:p-6 shadow-xs hover:shadow-md active:scale-[0.99] transition-all duration-300 flex items-center justify-between group cursor-pointer"
            >
              {/* Text & Action */}
              <div className="z-10 space-y-2 max-w-[65%]">
                <h4 className="text-lg sm:text-xl font-black text-emerald-600">
                  الاشتراكات
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  اشترك ووفر أكثر مع باقاتنا المميزة
                </p>
                <div className="pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentScreen('subscriptions');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white hover:bg-slate-50 active:scale-95 text-slate-800 font-bold text-xs px-4 py-2 rounded-full border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>عرض الاشتراكات</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 3D Clipboard Illustration */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 group-hover:scale-108 transition-transform duration-300">
                <img
                  src={cardSubscriptionsClipboard}
                  alt="الاشتراكات"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Card 3: العروض (Soft Purple Theme with 3D Voucher Ticket) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setCurrentScreen('offers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setCurrentScreen('offers');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="relative overflow-hidden rounded-3xl border border-purple-200/80 bg-gradient-to-l from-purple-50/90 via-indigo-50/50 to-white p-5 sm:p-6 shadow-xs hover:shadow-md active:scale-[0.99] transition-all duration-300 flex items-center justify-between group cursor-pointer"
            >
              {/* Text & Action */}
              <div className="z-10 space-y-2 max-w-[65%]">
                <h4 className="text-lg sm:text-xl font-black text-purple-600">
                  العروض
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  عروض وخصومات لفترة محدودة
                </p>
                <div className="pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentScreen('offers');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white hover:bg-slate-50 active:scale-95 text-slate-800 font-bold text-xs px-4 py-2 rounded-full border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>عرض العروض</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 3D Coupon Ticket Illustration */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 group-hover:scale-108 transition-transform duration-300">
                <img
                  src={cardDiscountsCoupon}
                  alt="العروض"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </section>





        {/* ========================================================================= */}
        {/* CUSTOMER REVIEWS & TESTIMONIALS SLIDER */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs text-right space-y-6">
          {/* Header with Navigation Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-1">
            <div className="space-y-1 text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  آراء وتقييمات العملاء
                </h4>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/70 shadow-2xs">
                  4.9 ★ أكثر من 1,420 تقييم معتمد
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                تجارب وآراء حقيقية لعملائنا في مختلف مدن ومناطق المملكة
              </p>
            </div>

            {/* Carousel Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevReviewsSlide}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
                aria-label="Previous review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={nextReviewsSlide}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
                aria-label="Next review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Slider Container with Touch & Hover controls */}
          <div
            className="relative select-none overflow-hidden py-1 px-0.5"
            onMouseEnter={() => setIsHoveredReviews(true)}
            onMouseLeave={() => setIsHoveredReviews(false)}
            onTouchStart={handleReviewsTouchStart}
            onTouchEnd={handleReviewsTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(${reviewsSlideIndex * (100 / cardsPerView)}%)`
              }}
            >
              {customerReviewsData.map((item) => (
                <div
                  key={item.id}
                  className="w-full sm:w-1/2 lg:w-1/3 min-w-full sm:min-w-[50%] lg:min-w-[33.333333%] shrink-0 px-2 sm:px-2.5"
                >
                  <div className="h-full p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-50/90 via-white to-blue-50/20 border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Card Header: Avatar, Name, Location & Stars */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-10 h-10 rounded-full ${item.avatarBg} flex items-center justify-center font-black text-sm shadow-2xs shrink-0`}>
                            {item.initial}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-sm font-bold text-slate-900">{item.name}</h5>
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded">
                                موثق
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">{item.location}</span>
                          </div>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex text-amber-400 text-xs shrink-0">
                          {'★'.repeat(item.rating)}
                        </div>
                      </div>

                      {/* Review Quote */}
                      <div className="relative pt-1">
                        <Quote className="w-6 h-6 text-blue-100 absolute -top-2 left-0 -scale-x-100 pointer-events-none" />
                        <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-relaxed relative z-10 line-clamp-3">
                          "{item.review}"
                        </p>
                      </div>
                    </div>

                    {/* Card Footer: Service tag and Date */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span className="text-blue-600 font-bold bg-blue-50/70 px-2 py-0.5 rounded-md">
                        {item.service}
                      </span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {Array.from({ length: maxReviewsSlideIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setReviewsSlideIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  reviewsSlideIndex === idx ? 'w-7 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to review slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

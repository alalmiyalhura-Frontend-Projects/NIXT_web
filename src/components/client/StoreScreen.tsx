import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StoreProduct } from '../../types';
import {
  Search,
  ShoppingBag,
  Star,
  Plus,
  Minus,
  Truck,
  Sparkles,
  Check,
  CheckCircle2,
  Tag,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
  Car,
  Layers,
  Armchair,
  Flame,
  Grid,
  Store,
  X,
  PackageCheck,
  HelpCircle
} from 'lucide-react';

interface SubCategoryDef {
  id: string;
  label: string;
}

interface MainCategoryDef {
  id: string;
  label: string;
  subCategories?: SubCategoryDef[];
}

export const StoreScreen: React.FC = () => {
  const {
    storeProducts,
    addToCart,
    cart,
    updateCartQty,
    setCurrentScreen,
    serviceBookingContext,
    returnToServiceBooking,
    exitServiceBookingStoreContext,
    addStoreProductToBooking,
    updateStoreProductBookingQuantity,
    bookingAddons
  } = useApp();

  const isBookingMode = Boolean(serviceBookingContext?.isActive);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<StoreProduct | null>(null);
  const [addedPopup, setAddedPopup] = useState<string | null>(null);

  // Exact categories requested by user
  const mainCategories: MainCategoryDef[] = [
    { id: 'all', label: 'الكل' },
    {
      id: 'cars',
      label: 'السيارات',
      subCategories: [
        { id: 'all_cars', label: 'الكل في السيارات' },
        { id: 'interior_acc', label: 'اكسسوارات داخلية' },
        { id: 'exterior_acc', label: 'اكسسوارات خارجية' },
        { id: 'car_care', label: 'العناية بالسيارة' },
        { id: 'camping_trips', label: 'لوازم الرحلات والتخييم' },
        { id: 'steam_polishing', label: 'تلميع بخار' }
      ]
    },
    {
      id: 'carpets',
      label: 'السجاد',
      subCategories: [
        { id: 'all_carpets', label: 'الكل في السجاد' },
        { id: 'carpet_packaging', label: 'تغليف السجاد' },
        { id: 'blankets_quilts', label: 'غسيل بطانيات ولحافات' },
        { id: 'sofa_polishing', label: 'تلميع الكنب' }
      ]
    },
    { id: 'furniture', label: 'متجر الكنب' },
    { id: 'wash_offers', label: 'عروض الغسيل' }
  ];

  const currentMainCat = mainCategories.find(c => c.id === selectedCategory);

  const handleMainCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const cat = mainCategories.find(c => c.id === catId);
    if (cat?.subCategories && cat.subCategories.length > 0) {
      setSelectedSubCategory(cat.subCategories[0].id);
    } else {
      setSelectedSubCategory('all');
    }
  };

  // Switch category if opened for service booking with a preferred category
  useEffect(() => {
    if (isBookingMode && serviceBookingContext?.preferredCategory) {
      const pref = serviceBookingContext.preferredCategory;
      if (mainCategories.some(c => c.id === pref)) {
        handleMainCategoryChange(pref);
      }
    }
  }, [isBookingMode, serviceBookingContext?.preferredCategory]);

  // Calculate items added to booking
  const bookingStoreAddons = bookingAddons.filter(a => a.id.startsWith('store-'));
  const bookingStoreItemsCount = bookingStoreAddons.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const bookingStoreItemsTotal = bookingStoreAddons.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  const filteredProducts = storeProducts.filter(p => {
    // 1. Main Category filter
    let matchesCat = true;
    if (selectedCategory === 'all') {
      matchesCat = true;
    } else if (selectedCategory === 'cars') {
      const isCarProduct = p.mainCategory === 'cars' || ['interior_acc', 'exterior_acc', 'car_care', 'camping_trips', 'steam_polishing', 'cars', 'cleaning'].includes(p.category);
      if (!isCarProduct) {
        matchesCat = false;
      } else if (selectedSubCategory && selectedSubCategory !== 'all_cars' && selectedSubCategory !== 'all') {
        matchesCat = p.subCategory === selectedSubCategory || p.category === selectedSubCategory;
      }
    } else if (selectedCategory === 'carpets') {
      const isCarpetProduct = p.mainCategory === 'carpets' || ['carpet_packaging', 'blankets_quilts', 'sofa_polishing', 'carpets'].includes(p.category);
      if (!isCarpetProduct) {
        matchesCat = false;
      } else if (selectedSubCategory && selectedSubCategory !== 'all_carpets' && selectedSubCategory !== 'all') {
        matchesCat = p.subCategory === selectedSubCategory || p.category === selectedSubCategory;
      }
    } else if (selectedCategory === 'furniture') {
      matchesCat = p.mainCategory === 'furniture' || p.category === 'furniture';
    } else if (selectedCategory === 'wash_offers') {
      matchesCat = p.mainCategory === 'wash_offers' || p.category === 'wash_offers';
    }

    // 2. Search Query filter
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q)) ||
      (p.subCategoryLabel && p.subCategoryLabel.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });

  const handleAddToCart = (product: StoreProduct, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart(product, 1);
    setAddedPopup(product.id);
    setTimeout(() => setAddedPopup(null), 1500);
  };

  const handleAddToOrder = (product: StoreProduct, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addStoreProductToBooking(product, 1);
    setAddedPopup(product.id);
    setTimeout(() => setAddedPopup(null), 1500);
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* SERVICE BOOKING BANNER (Only visible when user enters store from a booking flow) */}
      {isBookingMode && (
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-amber-400/40 relative overflow-hidden text-right">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>تخصيص وإضافة منتجات للخدمة</span>
                </span>
                <span className="text-xs text-amber-300 font-bold bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/20">
                  المرحلة {serviceBookingContext?.bookingStep || 3}: الإضافات ومنتجات العناية
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black font-['Cairo'] text-white">
                أنت الآن تتصفح المتجر لإضافة منتجات إلى: <span className="text-amber-300 font-black">{serviceBookingContext?.serviceName || 'طلب الخدمة'}</span>
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed">
                أي منتج تقوم بالضغط على <strong>&quot;أضف للطلب&quot;</strong> سيتم إلحاقه بحجز خدمتك مباشرة بدون رسوم شحن إضافية، وسيقوم الكابتن بإحضاره معه عند تنفيذ الخدمة.
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={returnToServiceBooking}
                className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-amber-400/30 transition-all flex items-center gap-2 cursor-pointer border border-amber-300"
              >
                <span>العودة لاستكمال حجز الخدمة</span>
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={exitServiceBookingStoreContext}
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold px-3.5 py-3 rounded-2xl border border-white/20 transition-all cursor-pointer"
                title="تصفح المتجر كطلب منفصل للشراء العادي عبر السلة"
              >
                <span>تصفح كمتجر عادي</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Store Hero Banner (Standard) */}
      {!isBookingMode && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white rounded-3xl p-6 shadow-md relative overflow-hidden text-right">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-0.5 rounded-full text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>متجر نيكست الأصلي</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-['Cairo']">
              اكسسوارات وعناية فائقة لمركبتك ومنزلك
            </h2>
            <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
              جميع منتجات العناية الأصلية، لوازم الرحلات، تغليف السجاد وعروض الغسيل مع توصيل سريع حتى باب بيتك!
            </p>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={isBookingMode ? `ابحث عن منتج لإضافته لطلبك (${serviceBookingContext?.serviceName || 'الخدمة'})...` : "البحث في منتجات وتصنيفات المتجر..."}
          className="w-full pl-4 pr-11 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs text-right"
        />
        <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5" />
      </div>

      {/* Main Categories Row */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black text-slate-800 font-['Cairo'] flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-amber-500" />
            الأقسام الرئيسية
          </span>
          <span className="text-[11px] font-bold text-slate-400">
            {filteredProducts.length} منتج متاح
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          {mainCategories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleMainCategoryChange(cat.id)}
                className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap shadow-xs flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-black shadow-amber-500/20 scale-[1.02]'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.id === 'cars' && <Car className="w-3.5 h-3.5" />}
                {cat.id === 'carpets' && <Layers className="w-3.5 h-3.5" />}
                {cat.id === 'furniture' && <Armchair className="w-3.5 h-3.5" />}
                {cat.id === 'wash_offers' && <Flame className="w-3.5 h-3.5 text-red-500" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Subcategories Secondary Bar (if current main category has subcategories) */}
        {currentMainCat?.subCategories && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px] font-bold">
              {currentMainCat.subCategories.map(sub => {
                const isSubSelected = selectedSubCategory === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubCategory(sub.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      isSubSelected
                        ? 'bg-blue-600 text-white font-black shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-black text-slate-800">لا توجد منتجات مطابقة</h4>
          <p className="text-xs text-slate-500">جرب اختيار تصنيف آخر أو مسح حقل البحث</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSubCategory('all');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-xl cursor-pointer"
          >
            عرض كافة المنتجات
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {filteredProducts.map(prod => {
            const inCartCount = cart.find(c => c.product.id === prod.id)?.quantity || 0;
            const addonId = `store-${prod.id}`;
            const bookingItem = bookingAddons.find(a => a.id === addonId);
            const inBookingCount = bookingItem?.quantity || 0;

            return (
              <div
                key={prod.id}
                onClick={() => setSelectedProductForDetail(prod)}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group cursor-pointer text-right relative"
              >
                {/* Product Image & Badges */}
                <div className="relative h-36 sm:h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {prod.isNew && (
                    <span className="absolute top-2.5 right-2.5 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                      جديد
                    </span>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{prod.rating || '4.5'}</span>
                    <span className="text-slate-300 text-[9px]">({prod.reviewsCount || '4K'})</span>
                  </div>

                  {/* Added to Booking indicator pill */}
                  {isBookingMode && inBookingCount > 0 && (
                    <div className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 animate-in zoom-in-95">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>مضاف للطلب ({inBookingCount})</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    {prod.subCategoryLabel && (
                      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1">
                        {prod.subCategoryLabel}
                      </span>
                    )}
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-2 leading-snug font-['Cairo']">
                      {prod.name}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <Truck className="w-3 h-3 text-blue-600 shrink-0" />
                      <span>{isBookingMode ? 'يصلك مع كابتن الخدمة 🚚' : (prod.deliveryEstimate || 'التوصيل: 1 - 3 أيام')}</span>
                    </div>
                  </div>

                  {/* Price & Action Button (Add to Cart vs Add to Order) */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-right">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-base sm:text-lg font-black text-blue-700 font-['Cairo']">
                          {prod.price.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600">ر.س</span>
                      </div>
                      {prod.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through block -mt-1 font-['Cairo']">
                          {prod.originalPrice.toFixed(2)} ر.س
                        </span>
                      )}
                    </div>

                    {/* DYNAMIC BUTTON LOGIC:
                        When in Booking Mode -> Show "أضف للطلب" & Stepper
                        When in Normal Store Mode -> Show "أضف للسلة" & Stepper */}
                    {isBookingMode ? (
                      inBookingCount > 0 ? (
                        <div
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl p-1 shadow-2xs h-[34px]"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStoreProductBookingQuantity(prod.id, inBookingCount - 1);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white hover:bg-amber-100 text-amber-950 font-black text-xs transition-colors cursor-pointer"
                            aria-label="تقليل الكمية"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-black text-xs min-w-4 text-center text-amber-950">{inBookingCount}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStoreProductBookingQuantity(prod.id, inBookingCount + 1);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors cursor-pointer"
                            aria-label="زيادة الكمية"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={e => handleAddToOrder(prod, e)}
                          className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-black px-3.5 py-1.5 rounded-xl shadow-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 h-[34px] cursor-pointer border border-amber-500/40"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>أضف للطلب</span>
                        </button>
                      )
                    ) : (
                      inCartCount > 0 ? (
                        <div
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm h-[34px]"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateCartQty(prod.id, inCartCount - 1);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-black text-xs min-w-4 text-center">{inCartCount}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateCartQty(prod.id, inCartCount + 1);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={e => handleAddToCart(prod, e)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-4 py-1.5 rounded-xl shadow-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1 shrink-0 h-[34px] cursor-pointer"
                        >
                          <span>أضف للسلة</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FLOATING RETURN BAR (Only when in booking flow mode - guarantees user can return to their booking step anytime) */}
      {isBookingMode && (
        <div className="fixed bottom-16 sm:bottom-6 left-4 right-4 z-40 max-w-xl mx-auto animate-in slide-in-from-bottom-3 duration-300">
          <div className="bg-slate-950/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-3xl shadow-2xl border border-amber-400/40 flex items-center justify-between gap-3 text-right">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                {bookingStoreItemsCount}
              </div>
              <div>
                <span className="text-xs font-black text-white block">
                  {bookingStoreItemsCount > 0
                    ? `${bookingStoreItemsCount} منتج مضاف لطلب الخدمة`
                    : 'استكمال حجز الخدمة'}
                </span>
                <span className="text-[11px] text-amber-300 font-bold">
                  {bookingStoreItemsCount > 0
                    ? `إجمالي المنتجات: ${bookingStoreItemsTotal.toFixed(2)} ر.س`
                    : (serviceBookingContext?.serviceName || 'الخدمة الحالية')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={returnToServiceBooking}
              className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm px-4 sm:px-6 py-2.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer border border-amber-300"
            >
              <span>العودة للخدمة</span>
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar if cart has items (Only in regular store mode) */}
      {!isBookingMode && cart.length > 0 && (
        <div className="fixed bottom-16 sm:bottom-6 left-4 right-4 z-30 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setCurrentScreen('cart')}
            className="w-full bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-center justify-between hover:bg-slate-900 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">
                {cart.reduce((a, c) => a + c.quantity, 0)}
              </div>
              <span className="text-xs font-bold">عناصر في سلة الشراء</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400">
                عرض السلة والدفع
              </span>
              <ArrowLeft className="w-4 h-4 text-amber-400" />
            </div>
          </button>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProductForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 text-right space-y-4 animate-in zoom-in-95">
            <div className="relative h-52 rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={selectedProductForDetail.image}
                alt={selectedProductForDetail.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                  منتج أصلي مضمون
                </span>
                {selectedProductForDetail.subCategoryLabel && (
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
                    {selectedProductForDetail.subCategoryLabel}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1.5 font-['Cairo']">
                {selectedProductForDetail.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {selectedProductForDetail.description}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-500">طريقة الاستلام:</span>
              <span className="font-bold text-blue-700">
                {isBookingMode ? '🚚 يصلك مع كابتن الخدمة في موعد حجزك' : 'متوفر في المستودع (شحن فوري)'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="text-xl font-black text-blue-700 font-['Cairo']">
                {selectedProductForDetail.price.toFixed(2)} <span className="text-xs">ر.س</span>
              </div>
              <div className="flex gap-2">
                {(() => {
                  if (isBookingMode) {
                    const addonId = `store-${selectedProductForDetail.id}`;
                    const bookingItem = bookingAddons.find(a => a.id === addonId);
                    const inBookingCount = bookingItem?.quantity || 0;

                    return inBookingCount > 0 ? (
                      <div className="flex items-center gap-3 bg-amber-50 border border-amber-300 rounded-xl p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateStoreProductBookingQuantity(selectedProductForDetail.id, inBookingCount - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-amber-100 text-amber-950 font-black cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-black text-sm w-6 text-center text-amber-950">{inBookingCount}</span>
                        <button
                          type="button"
                          onClick={() => updateStoreProductBookingQuantity(selectedProductForDetail.id, inBookingCount + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          addStoreProductToBooking(selectedProductForDetail, 1);
                        }}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer border border-amber-500/40"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>أضف للطلب</span>
                      </button>
                    );
                  }

                  const selectedInCartCount = cart.find(c => c.product.id === selectedProductForDetail.id)?.quantity || 0;
                  return selectedInCartCount > 0 ? (
                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                      <button
                        type="button"
                        onClick={() => updateCartQty(selectedProductForDetail.id, selectedInCartCount - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-black text-sm w-6 text-center">{selectedInCartCount}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(selectedProductForDetail.id, selectedInCartCount + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        handleAddToCart(selectedProductForDetail);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>أضف إلى السلة</span>
                    </button>
                  );
                })()}
                <button
                  type="button"
                  onClick={() => setSelectedProductForDetail(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


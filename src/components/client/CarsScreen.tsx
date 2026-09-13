import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Car, CarCategory } from '../../types';
import { CAR_BRANDS_DATA, searchCarCatalogue, SearchCarResult } from '../../data/carData';
import {
  Car as CarIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  Check,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Calendar,
  Layers,
  Info
} from 'lucide-react';

export const CarsScreen: React.FC = () => {
  const {
    cars,
    addCar,
    deleteCar,
    setDefaultCar,
    setSelectedCar,
    setCurrentScreen,
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Form fields
  const [brandName, setBrandName] = useState('تويوتا');
  const [modelName, setModelName] = useState('كامري');
  const [trimName, setTrimName] = useState('LE ستاندرد');
  const [year, setYear] = useState('2024');
  const [plateNumber, setPlateNumber] = useState('');
  const [color, setColor] = useState('أبيض');
  const [category, setCategory] = useState<CarCategory>('sedan');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const years = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012'];
  const colors = ['أبيض', 'أسود', 'فضي', 'رمادي', 'كحلي', 'أحمر', 'لؤلؤي', 'أزرق', 'بني', 'ذهبي'];

  // Current active brand object
  const currentBrand = useMemo(() => {
    return CAR_BRANDS_DATA.find(b => b.name === brandName) || CAR_BRANDS_DATA[0];
  }, [brandName]);

  // Current active model object
  const currentModel = useMemo(() => {
    return currentBrand.models.find(m => m.name === modelName) || currentBrand.models[0];
  }, [currentBrand, modelName]);

  // Available trims for current model
  const availableTrims = useMemo(() => {
    return currentModel?.trims || ['ستاندرد', 'فل كامل'];
  }, [currentModel]);

  // Handle brand dropdown change
  const handleBrandChange = (newBrandName: string) => {
    setBrandName(newBrandName);
    const brandObj = CAR_BRANDS_DATA.find(b => b.name === newBrandName) || CAR_BRANDS_DATA[0];
    const defaultModel = brandObj.models[0];
    if (defaultModel) {
      setModelName(defaultModel.name);
      setCategory(defaultModel.category);
      setTrimName(defaultModel.trims[0] || 'ستاندرد');
    }
  };

  // Handle model dropdown change
  const handleModelChange = (newModelName: string) => {
    setModelName(newModelName);
    const modelObj = currentBrand.models.find(m => m.name === newModelName);
    if (modelObj) {
      setCategory(modelObj.category);
      setTrimName(modelObj.trims[0] || 'ستاندرد');
    }
  };

  // Search results
  const searchResults = useMemo(() => {
    return searchCarCatalogue(searchQuery);
  }, [searchQuery]);

  // Quick select from search
  const handleSelectFromSearch = (item: SearchCarResult) => {
    setBrandName(item.brand);
    setModelName(item.model);
    setCategory(item.category);
    setTrimName(item.defaultTrim);
    setSearchQuery('');
  };

  const handleCreateCar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim()) {
      alert('يرجى كتابة رقم اللوحة');
      return;
    }

    const created = addCar({
      brand: brandName,
      model: `${modelName} (${trimName})`,
      category,
      plateNumber: plateNumber.trim(),
      color,
      isDefault: cars.length === 0,
    });

    setSelectedCar(created);
    setShowAddForm(false);
    setPlateNumber('');
    setSearchQuery('');
    setSuccessToast(`تمت إضافة سيارة ${brandName} ${modelName} بنجاح!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const getCategoryBadge = (cat: CarCategory) => {
    switch (cat) {
      case 'luxury':
        return { label: 'فاخرة VIP', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'suv':
        return { label: 'جيب / دفع رباعي SUV', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'small':
        return { label: 'صغيرة اقتصادية', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'sedan':
      default:
        return { label: 'سيدان', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
    }
  };

  return (
    <div className="w-full space-y-6 text-right animate-in fade-in duration-300">
      {/* Breadcrumb navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-2">
          <button
            onClick={() => setCurrentScreen('home')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            الرئيسية
          </button>
          <span>/</span>
          <span className="text-slate-800 font-bold">إدارة سياراتي والمركبات</span>
        </div>

        {/* Page Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                <CarIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">سياراتي والمركبات المسجلة</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  أضف سياراتك لتسهيل الحجز الفوري وتطبيق أسعار الفئة المخصصة بدقة
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (showAddForm) setSearchQuery('');
              }}
              className={`font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                showAddForm
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {showAddForm ? <ArrowRight className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showAddForm ? 'الرجوع للسيارات المسجلة' : 'إضافة سيارة جديدة'}</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {successToast && (
          <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-md text-xs sm:text-sm font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{successToast}</span>
            </div>
          </div>
        )}

        {/* Main Content Area: Show Add Form in place of saved cars or show saved cars */}
        {showAddForm ? (
          /* Add New Vehicle Form View (Appears in place of saved cars) */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in">
            {/* Form Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">إضافة سيارة جديدة</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    أدخل بيانات سيارتك لتسهيل الحجز الفوري واختيار باقات الغسيل المناسبة
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
              >
                <ArrowRight className="w-4 h-4" />
                <span>الرجوع للسيارات المسجلة</span>
              </button>
            </div>

            {/* Fast Autocomplete Search */}
            <div className="relative bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>البحث السريع في كتالوج السيارات السعودية:</span>
                <span className="text-[11px] text-blue-600 font-normal">اختياري لملء الحقول تلقائياً</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم السيارة، مثلاً: كامري، لاندكروزر، تاهو، سوناتا..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-10 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right shadow-2xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    مسح
                  </button>
                )}
              </div>

              {/* Search Dropdown Results */}
              {searchQuery.trim().length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-h-48 overflow-y-auto p-1 divide-y divide-slate-100 text-right">
                  {searchResults.length === 0 ? (
                    <p className="p-3 text-xs text-slate-500 text-center">لا توجد نتائج مطابقة، يرجى الاختيار من القوائم أدناه</p>
                  ) : (
                    searchResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectFromSearch(item)}
                        className="p-2.5 hover:bg-blue-50 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{item.brand} {item.model}</span>
                          <span className="text-[11px] text-slate-500 block">فئة: {item.defaultTrim}</span>
                        </div>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {item.category === 'suv' ? 'جيب SUV' : item.category === 'luxury' ? 'فاخرة VIP' : item.category === 'small' ? 'صغيرة' : 'سيدان'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Form Manual Fields */}
            <form onSubmit={handleCreateCar} className="space-y-5 text-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Brand select */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">ماركة السيارة (الشركة المصنعة) *</label>
                  <div className="relative">
                    <select
                      value={brandName}
                      onChange={(e) => handleBrandChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-right cursor-pointer"
                    >
                      {CAR_BRANDS_DATA.map(b => (
                        <option key={b.name} value={b.name}>{b.name} ({b.enName})</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Model */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">الموديل *</label>
                  <div className="relative">
                    <select
                      value={modelName}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-right cursor-pointer"
                    >
                      {currentBrand.models.map(m => (
                        <option key={m.name} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Trim */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">الفئة / المواصفة *</label>
                  <div className="relative">
                    <select
                      value={trimName}
                      onChange={(e) => setTrimName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-right cursor-pointer"
                    >
                      {availableTrims.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Year */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">سنة الصنع</label>
                  <div className="relative">
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-right cursor-pointer"
                    >
                      {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">لون المركبة</label>
                  <div className="relative">
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-right cursor-pointer"
                    >
                      {colors.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Saudi Plate Number */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    رقم اللوحة السعودية (مثال: أ ب ج 1234) *
                  </label>
                  <input
                    type="text"
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="أ ب ج 1234"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  />
                </div>
              </div>

              {/* Category selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">تصنيف حجم السيارة للغسيل والتسعير:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { id: 'sedan', label: 'سيدان', desc: 'كامري، النترا، سوناتا' },
                    { id: 'suv', label: 'جيب SUV / عائلية', desc: 'لاندكروزر، برادو، تاهو' },
                    { id: 'small', label: 'صغيرة هاتشباك', desc: 'يارس، اكسنت، سبارك' },
                    { id: 'luxury', label: 'فاخرة VIP', desc: 'مرسيدس، بي ام، لكزس' },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setCategory(item.id as CarCategory)}
                      className={`p-3 rounded-2xl border text-right cursor-pointer transition-all ${
                        category === item.id
                          ? 'border-blue-600 bg-blue-50/80 shadow-2xs ring-1 ring-blue-600/30'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{item.label}</span>
                        {category === item.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-1">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setSearchQuery('');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  إلغاء والعودة
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ وإضافة السيارة لحسابي</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Saved Vehicles Section (Shown when not adding a car) */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">قائمة المركبات المسجلة ({cars.length})</h2>
            </div>

            {cars.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <CarIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">لم تقم بإضافة أي سيارة حتى الآن</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    أضف سيارتك الأولى الآن لتتمكن من حجز خدمات الغسيل والتلميع المتنقل بضغطة زر واحدة.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة سيارتي الأولى</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cars.map((car) => {
                  const badge = getCategoryBadge(car.category);
                  const isDefault = car.isDefault;

                  return (
                    <div
                      key={car.id}
                      className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between gap-4 shadow-2xs ${
                        isDefault
                          ? 'border-blue-600 ring-2 ring-blue-600/15 bg-blue-50/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top row: Brand/Model + Plate number + Delete */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-900">{car.brand}</h3>
                            <span className="text-xs font-bold text-slate-700">{car.model}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                              {badge.label}
                            </span>
                            <span className="text-[11px] text-slate-500">اللون: {car.color || 'غير محدد'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Saudi Authentic License Plate Graphic */}
                          <div className="border-2 border-slate-800 bg-white rounded-lg px-2.5 py-1 text-center shadow-xs shrink-0">
                            <span className="text-[9px] font-black text-slate-400 block tracking-widest leading-none">
                              KSA • السعودية
                            </span>
                            <span className="text-xs font-black text-slate-900 tracking-wider font-mono">
                              {car.plateNumber}
                            </span>
                          </div>

                          {cars.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`هل أنت متأكد من حذف سيارة ${car.brand} ${car.model}؟`)) {
                                  deleteCar(car.id);
                                }
                              }}
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                              title="حذف السيارة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Set Default Car Action Button */}
                      <div className="pt-3 border-t border-slate-100">
                        {isDefault ? (
                          <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black flex items-center justify-center gap-2 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>السيارة الافتراضية</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDefaultCar(car.id)}
                            className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white border border-slate-200 hover:border-blue-600 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
                          >
                            <CheckCircle2 className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                            <span>تعيين كافتراضية</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
  );
};

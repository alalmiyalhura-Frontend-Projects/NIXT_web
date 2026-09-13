import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Car, CarCategory } from '../../types';
import { CAR_BRANDS_DATA, searchCarCatalogue, SearchCarResult } from '../../data/carData';
import {
  Car as CarIcon,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Search,
  Check,
  ShieldCheck,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface CarsModalProps {
  onClose: () => void;
}

export const CarsModal: React.FC<CarsModalProps> = ({ onClose }) => {
  const { cars, addCar, deleteCar, setDefaultCar, selectedCar, setSelectedCar } = useApp();
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-right animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <CarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-['Cairo']">إدارة سياراتي</h3>
              <span className="text-xs text-slate-400">حدد سيارتك أو أضف سيارة جديدة بالبحث المباشر</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {showAddForm ? (
            /* Add Car Form with Search & Linked Dropdowns (Replaces list during addition) */
            <form onSubmit={handleCreateCar} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>بيانات وتفاصيل السيارة</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setSearchQuery('');
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  إلغاء والعودة للقائمة
                </button>
              </div>

              {/* Quick Search Box */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                  <span>بحث سريع عن السيارة (الموديل أو الشركة)</span>
                  <span className="text-[10px] text-blue-600 font-normal">اختياري للتسهيل</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="اكتب اسم السيارة (مثال: كامري، تورس، سوناتا، باترول، يوكن)..."
                    className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Instant Search Results Chips */}
                {searchQuery.trim().length > 0 && (
                  <div className="p-2 bg-white rounded-xl border border-blue-200 shadow-xs space-y-1 max-h-40 overflow-y-auto">
                    <span className="text-[10px] font-bold text-slate-500 block px-1">النتائج المطابقة:</span>
                    {searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 gap-1">
                        {searchResults.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectFromSearch(item)}
                            className="w-full p-2 text-right rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all flex items-center justify-between text-xs cursor-pointer"
                          >
                            <div>
                              <span className="font-black text-slate-900">{item.brand} {item.model}</span>
                              <span className="text-[10px] text-slate-500 mr-2">({item.categoryLabel})</span>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-full">
                              اختيار
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 p-2 text-center">لا توجد نتائج مطابقة لـ "{searchQuery}"، يمكنك الاختيار من القوائم بالأسفل.</p>
                    )}
                  </div>
                )}
              </div>

              {/* 1. Dropdown: Brand (الشركة الصانعة) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  1. الشركة الصانعة (الماركة) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={brandName}
                    onChange={e => handleBrandChange(e.target.value)}
                    className="w-full p-2.5 pr-3 pl-8 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    {CAR_BRANDS_DATA.map(b => (
                      <option key={b.name} value={b.name}>
                        {b.name} ({b.enName})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* 2. Dropdown: Model (الموديل) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  2. الموديل <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={modelName}
                    onChange={e => handleModelChange(e.target.value)}
                    className="w-full p-2.5 pr-3 pl-8 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    {currentBrand.models.map(m => (
                      <option key={m.name} value={m.name}>
                        {m.name} - {m.categoryLabel}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* 3. Dropdown: Trim / Variant (الطراز / الفئة) & Year */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    3. الطراز / الفئة <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={trimName}
                      onChange={e => setTrimName(e.target.value)}
                      className="w-full p-2.5 pr-2.5 pl-7 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                      {availableTrims.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    سنة الصنع
                  </label>
                  <div className="relative">
                    <select
                      value={year}
                      onChange={e => setYear(e.target.value)}
                      className="w-full p-2.5 pr-2.5 pl-7 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                      {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Inferred Category Badge */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-bold">تصنيف حجم السيارة للغسيل والتسعير:</span>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${getCategoryBadge(category).bg}`}>
                  {getCategoryBadge(category).label}
                </span>
              </div>

              {/* Plate Number & Color */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    رقم اللوحة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={e => setPlateNumber(e.target.value)}
                    placeholder="مثال: أ ب ج 1234"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs text-center font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">اللون</label>
                  <div className="relative">
                    <select
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      className="w-full p-2.5 pr-2.5 pl-7 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                      {colors.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setSearchQuery('');
                  }}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ السيارة في حسابي</span>
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Add Car Toggle Button */}
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سيارة جديدة</span>
              </button>

              {/* Existing Cars List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black text-slate-900 flex items-center justify-between">
                  <span>السيارات المسجلة ({cars.length})</span>
                  <span className="text-[10px] text-slate-400 font-normal">انقر لاختيار السيارة الحالية</span>
                </h4>
                {cars.map(c => {
                  const badge = getCategoryBadge(c.category);
                  const isCurrent = selectedCar?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCar(c)}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <CarIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900">
                              {c.brand} {c.model}
                            </h4>
                            {c.isDefault && (
                              <span className="text-[9px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                الافتراضية
                              </span>
                            )}
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                            <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                              {c.plateNumber}
                            </span>
                            <span>• اللون: {c.color}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!c.isDefault && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setDefaultCar(c.id);
                            }}
                            className="text-[10px] font-bold text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            تعيين كافتراضية
                          </button>
                        )}
                        {cars.length > 1 && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              deleteCar(c.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Address } from '../../types';
import {
  MapPin,
  Plus,
  ArrowRight,
  X,
  Trash2,
  CheckCircle2,
  Navigation,
  Crosshair,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Building,
  Home,
  Briefcase,
  Layers,
  Compass,
  Info,
  ChevronDown,
  Edit3,
  Map as MapIcon,
  Check
} from 'lucide-react';

export const AddressesScreen: React.FC = () => {
  const {
    addresses,
    addAddress,
    deleteAddress,
    setDefaultAddress,
    selectedAddress,
    setSelectedAddress,
    setCurrentScreen
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);

  // Common address fields
  const [name, setName] = useState('المنزل');
  const [city, setCity] = useState('جدة');
  const [district, setDistrict] = useState('حي الروضة');
  const [street, setStreet] = useState('شارع الأمير سلطان');
  const [shortAddress, setShortAddress] = useState('JEDD4512');
  const [notes, setNotes] = useState('');

  // Manual specific fields
  const [buildingNumber, setBuildingNumber] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [landmark, setLandmark] = useState('');

  // Map / GPS specific fields
  const [lat, setLat] = useState<number>(21.5714);
  const [lng, setLng] = useState<number>(39.1554);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const cities = ['جدة', 'الرياض', 'مكة المكرمة', 'الدمام', 'الخبر', 'المدينة المنورة', 'الطائف'];

  // Generator for National Short Address based on City and Lat/Lng
  const generateShortAddressFromCity = (c: string, latVal: number, lngVal: number) => {
    let prefix = 'RRHA';
    if (c === 'جدة') prefix = 'JEDD';
    else if (c === 'الرياض') prefix = 'RIYD';
    else if (c === 'مكة المكرمة') prefix = 'MAKK';
    else if (c === 'الدمام') prefix = 'DAMM';
    else if (c === 'الخبر') prefix = 'KHOB';
    else if (c === 'المدينة المنورة') prefix = 'MDNA';
    else if (c === 'الطائف') prefix = 'TAIF';

    const num = Math.abs(Math.floor((latVal * 100 + lngVal * 100) % 9000) + 1000);
    return `${prefix}${num}`;
  };

  // GPS Current Location Detection
  const handleDetectGPSLocation = () => {
    setIsLocatingGPS(true);
    setGpsMessage('جاري الاتصال بالأقمار الصناعية GPS لتحديد موقعك بدقة...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const newLat = Number(position.coords.latitude.toFixed(5));
          const newLng = Number(position.coords.longitude.toFixed(5));
          setLat(newLat);
          setLng(newLng);

          // Infer nearest Saudi city if possible
          let detectedCity = city;
          if (newLat > 24.0 && newLat < 25.5) {
            detectedCity = 'الرياض';
          } else if (newLat > 21.0 && newLat < 22.0) {
            detectedCity = 'جدة';
          }
          setCity(detectedCity);

          const generatedShort = generateShortAddressFromCity(detectedCity, newLat, newLng);
          setShortAddress(generatedShort);

          setIsLocatingGPS(false);
          setGpsMessage(`تم التقاط إحداثيات موقعك بنجاح (${newLat}°, ${newLng}°) وتوليد العنوان الوطني المختصر`);
          setTimeout(() => setGpsMessage(null), 4500);
        },
        error => {
          setIsLocatingGPS(false);
          setGpsMessage('تعذر الوصول التلقائي للـ GPS. يمكنك تحريك الدبوس على الخريطة لتحديد موقعك بدقة');
          setTimeout(() => setGpsMessage(null), 4000);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocatingGPS(false);
      setGpsMessage('المتصفح لا يدعم تحديد الموقع المباشر');
      setTimeout(() => setGpsMessage(null), 3000);
    }
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    if (newCity === 'الرياض') {
      setLat(24.7136);
      setLng(46.6753);
      setDistrict('حي النرجس');
      setStreet('طريق الملك فهد');
    } else if (newCity === 'جدة') {
      setLat(21.5714);
      setLng(39.1554);
      setDistrict('حي الروضة');
      setStreet('شارع الأمير سلطان');
    } else if (newCity === 'مكة المكرمة') {
      setLat(21.3891);
      setLng(39.8579);
      setDistrict('حي العزيزية');
      setStreet('طريق المسجد الحرام');
    } else if (newCity === 'الدمام' || newCity === 'الخبر') {
      setLat(26.4207);
      setLng(50.0888);
      setDistrict('حي الشاطئ');
      setStreet('طريق الملك عبد العزيز');
    }
    const generatedShort = generateShortAddressFromCity(newCity, lat, lng);
    setShortAddress(generatedShort);
  };

  const resetForm = () => {
    setName('المنزل');
    setCity('جدة');
    setDistrict('حي الروضة');
    setStreet('شارع الأمير سلطان');
    setShortAddress('JEDD4512');
    setNotes('');
    setBuildingNumber('');
    setFlatNumber('');
    setLandmark('');
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim() || !district.trim()) {
      alert('يرجى إكمال الحقول الإلزامية: تسمية العنوان، المدينة، والحي');
      return;
    }

    const created = addAddress({
      name: name.trim(),
      city: city.trim(),
      district: district.trim(),
      street: street.trim() || 'شارع رئيسي',
      shortAddress: shortAddress.trim() || generateShortAddressFromCity(city, lat, lng),
      buildingNumber: buildingNumber.trim() || undefined,
      flatNumber: flatNumber.trim() || undefined,
      landmark: landmark.trim() || undefined,
      latitude: lat,
      longitude: lng,
      notes: notes.trim() || undefined,
      isDefault: addresses.length === 0,
    });

    setSelectedAddress(created);
    setShowAddForm(false);
    resetForm();
    setSuccessToast(`تمت إضافة وتأكيد العنوان "${name}" بنجاح وتعيينه كموقع خدمة!`);
    setTimeout(() => setSuccessToast(null), 3500);
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
          <span className="text-slate-800 font-bold">عناويني ومواقع الخدمة</span>
        </div>

        {/* Page Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-black">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">عناويني ومواقع تقديم الخدمة</h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  حدد موقع منزلك أو مقر عملك لوصول كابتن الخدمة والمغاسل المتنقلة بدقة متناهية
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (showAddForm) {
                  setShowAddForm(false);
                  resetForm();
                } else {
                  resetForm();
                  setShowAddForm(true);
                }
              }}
              className={`font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                showAddForm
                  ? 'bg-slate-800 hover:bg-slate-900 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {showAddForm ? (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>الرجوع للعناوين المحفوظة</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>إضافة عنوان جديد</span>
                </>
              )}
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

        {/* Main Content: Add Address Form OR Saved Addresses List */}
        {showAddForm ? (
          /* Add New Address Panel (Replaces Saved Addresses) */
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header outside card matching Saved Addresses layout */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">إضافة موقع وعنوان جديد</h2>
                  <p className="text-xs text-slate-500">أدخل بيانات الموقع بالتفصيل أو حدده مباشرة عبر الخريطة والـ GPS</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="text-xs text-slate-600 hover:text-red-600 font-bold px-3.5 py-2 rounded-xl hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                <span>الرجوع للعناوين المحفوظة</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">

            {/* Form Content: 2 Columns on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Map Simulator & GPS */}
              <div className="lg:col-span-5 space-y-3">
                <div className="relative h-64 bg-slate-200 rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
                  {/* Simulated Satellite/Street Map Texture */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')`,
                      filter: 'brightness(0.9) contrast(1.1)'
                    }}
                  />

                  {/* Overlay Grid lines */}
                  <div className="absolute inset-0 bg-blue-900/15 backdrop-blur-[0.5px]" />

                  {/* Center Animated Pin */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                    <div className="relative -mt-6 animate-bounce">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl border-2 border-white">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="w-2.5 h-2.5 bg-red-800 rotate-45 mx-auto -mt-1 shadow-sm" />
                    </div>
                    <span className="bg-slate-900/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md mt-1 backdrop-blur-xs">
                      موقع تقديم الخدمة
                    </span>
                  </div>

                  {/* Floating Map Controls */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
                    <button
                      type="button"
                      onClick={() => setZoomLevel(prev => Math.min(prev + 1, 4))}
                      className="w-8 h-8 rounded-lg bg-white/90 text-slate-800 hover:bg-white flex items-center justify-center shadow-md cursor-pointer transition-colors"
                      title="تكبير الخريطة"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(prev => Math.max(prev - 1, 1))}
                      className="w-8 h-8 rounded-lg bg-white/90 text-slate-800 hover:bg-white flex items-center justify-center shadow-md cursor-pointer transition-colors"
                      title="تصغير الخريطة"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Coordinates Badge */}
                  <div className="absolute bottom-3 right-3 bg-slate-950/80 text-white text-[10px] px-2.5 py-1 rounded-lg backdrop-blur-xs z-20 font-mono" dir="ltr">
                    {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                  </div>
                </div>

                {/* GPS Detect CTA Button */}
                <button
                  type="button"
                  onClick={handleDetectGPSLocation}
                  disabled={isLocatingGPS}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <Crosshair className={`w-4 h-4 ${isLocatingGPS ? 'animate-spin' : ''}`} />
                  <span>{isLocatingGPS ? 'جاري الاتصال بالقمر الصناعي GPS...' : 'تحديد موقعي الحالي بدقة عبر الأقمار الصناعية GPS'}</span>
                </button>

                {gpsMessage && (
                  <p className="text-[11px] font-bold text-slate-600 bg-slate-100 p-2 rounded-lg text-center animate-in fade-in">
                    {gpsMessage}
                  </p>
                )}
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSaveAddress} className="lg:col-span-7 space-y-4 text-right">
                {/* Address Label (Home, Work, Other) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">اسم / تصنيف العنوان:</label>
                  <div className="flex gap-2">
                    {['المنزل', 'العمل', 'بيت الأهل', 'موقع آخر'].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setName(lbl)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          name === lbl
                            ? 'bg-red-50 border-red-500 text-red-700 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* City and District */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">المدينة (المملكة):</label>
                    <div className="relative">
                      <select
                        value={city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none text-right cursor-pointer font-medium"
                      >
                        {cities.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">الحي السكني:</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="مثال: حي الروضة"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-right font-medium"
                    />
                  </div>
                </div>

                {/* Street & National Short Address */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">الشارع:</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="شارع الأمير سلطان"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-right font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      العنوان الوطني المختصر:
                    </label>
                    <input
                      type="text"
                      value={shortAddress}
                      onChange={(e) => setShortAddress(e.target.value)}
                      placeholder="JEDD4512"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-right uppercase font-mono font-medium"
                    />
                  </div>
                </div>

                {/* Building, Flat, Landmark */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">رقم المبنى:</label>
                    <input
                      type="text"
                      value={buildingNumber}
                      onChange={(e) => setBuildingNumber(e.target.value)}
                      placeholder="12"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-right"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">رقم الشقة/الدور:</label>
                    <input
                      type="text"
                      value={flatNumber}
                      onChange={(e) => setFlatNumber(e.target.value)}
                      placeholder="شقة 4"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-right"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">معلم بارز:</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="بجوار المسجد"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-right"
                    />
                  </div>
                </div>

                {/* Notes for Captain */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">تعليمات وتوجيهات للكابتن والمندوب:</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثال: السيارة متوقفة في الموقف المظلل خلف البوابة رقم 2"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-right font-medium"
                  />
                </div>

                {/* Action Buttons: Confirm & Cancel */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد وحفظ العنوان</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                  >
                    إلغاء والعودة
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
          /* Saved Addresses List View */
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">العناوين المحفوظة ({addresses.length})</h2>
            </div>

            {addresses.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-full bg-red-50 text-red-400 mx-auto flex items-center justify-center">
                  <MapPin className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">لم تسجل أي عنوان بعد</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    أضف موقع منزلك أو موقع وقوف سيارتك لتسهيل توجيه الكابتن وتنفيذ الغسيل فوراً.
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetForm();
                    setShowAddForm(true);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة عنوان جديد الآن</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddress?.id === addr.id;

                  return (
                    <div
                      key={addr.id}
                      className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between gap-4 shadow-2xs ${
                        isSelected
                          ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Top row: Name, City & Default Tag */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-black">
                              {addr.name.includes('عمل') ? <Briefcase className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                            </div>
                            <div>
                              <h3 className="text-base font-black text-slate-900">{addr.name}</h3>
                              <span className="text-xs text-slate-500">{addr.city} - {addr.district}</span>
                            </div>
                          </div>

                          {addr.isDefault ? (
                            <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                              الموقع الافتراضي
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDefaultAddress(addr.id)}
                              className="text-[10px] font-bold text-slate-500 hover:text-red-600 hover:underline cursor-pointer"
                            >
                              تعيين كافتراضي
                            </button>
                          )}
                        </div>

                        {/* Middle Details: Street, National Short Code, Building */}
                        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                          <p className="flex items-center gap-1.5 text-slate-700">
                            <Navigation className="w-3.5 h-3.5 text-slate-400" />
                            <span>{addr.street} {addr.buildingNumber ? `، مبنى ${addr.buildingNumber}` : ''}</span>
                          </p>

                          {addr.shortAddress && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                                العنوان الوطني: {addr.shortAddress}
                              </span>
                            </div>
                          )}

                          {addr.landmark && (
                            <p className="text-[11px] text-slate-500">معلم قريب: {addr.landmark}</p>
                          )}

                          {addr.notes && (
                            <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 mt-1">
                              ملاحظة للكابتن: {addr.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setSelectedAddress(addr)}
                          className={`flex-1 text-xs font-bold py-2 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ الموقع النشط حالياً' : 'اختيار كموقع خدمة'}
                        </button>

                        {addresses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`هل أنت متأكد من حذف عنوان "${addr.name}"؟`)) {
                                deleteAddress(addr.id);
                              }
                            }}
                            className="w-8 h-8 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                            title="حذف العنوان"
                          >
                            <Trash2 className="w-4 h-4" />
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

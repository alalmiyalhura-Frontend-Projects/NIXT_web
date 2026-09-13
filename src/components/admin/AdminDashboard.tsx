import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus, ServiceItem, StoreProduct, Captain, Coupon, CoverageZone, TimeSlotCapacity } from '../../types';
import {
  LayoutDashboard,
  Calendar,
  Users,
  ShoppingBag,
  Clock,
  Tag,
  MapPin,
  Bell,
  FileText,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  Eye,
  Settings,
  Send,
  Download,
  Car as CarIcon
} from 'lucide-react';

type AdminTab =
  | 'overview'
  | 'orders'
  | 'captains'
  | 'services'
  | 'store'
  | 'capacity'
  | 'coupons'
  | 'zones'
  | 'notifications'
  | 'cms';

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    modifyOrderAdmin,
    captains,
    addCaptain,
    updateCaptain,
    deleteCaptain,
    services,
    packages,
    subscriptions,
    addService,
    updateService,
    toggleServiceActive,
    deleteService,
    storeProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    capacitySlots,
    updateCapacitySlots,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    zones,
    addZone,
    updateZone,
    deleteZone,
    sendNotification,
    staticContent,
    updateStaticContent,
    setIsAdmin,
    setCurrentScreen
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [searchOrder, setSearchOrder] = useState<string>('');

  // Modals inside Admin
  const [showAddCaptainModal, setShowAddCaptainModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [showSendNotifModal, setShowSendNotifModal] = useState(false);

  // New Captain Form State
  const [newCapName, setNewCapName] = useState('');
  const [newCapPhone, setNewCapPhone] = useState('');
  const [newCapZone, setNewCapZone] = useState('جدة');

  // New Coupon Form State
  const [newCoupCode, setNewCoupCode] = useState('');
  const [newCoupTitle, setNewCoupTitle] = useState('');
  const [newCoupType, setNewCoupType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCoupValue, setNewCoupValue] = useState<number>(20);

  // Notification Broadcast Form State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifTarget, setNotifTarget] = useState<'all' | 'customers' | 'captains'>('customers');

  // Computed KPI Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.totalAmount : 0), 0);
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const activeCaptainsCount = captains.filter(c => c.status === 'active').length;
  const pendingOrdersCount = orders.filter(o => ['created', 'confirmed', 'assigned', 'on_the_way'].includes(o.status)).length;

  const filteredOrders = orders.filter(o => {
    const matchesFilter = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchOrder.toLowerCase()) || o.customerName.toLowerCase().includes(searchOrder.toLowerCase()) || o.customerPhone.includes(searchOrder);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 text-right pb-16">
      {/* Top Admin Header */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
              N
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                لوحة تحكم إدارة نيكست NIXT Admin
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">
                  صلاحيات مدير النظام
                </span>
              </h2>
              <p className="text-xs text-slate-400">إدارة العمليات، الحجوزات، الكباتن، السعة التشغيلية والأسعار</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsAdmin(false);
                setCurrentScreen('home');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              الذهاب إلى واجهة العميل ←
            </button>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs Bar */}
      <div className="bg-slate-800/80 border-b border-slate-700/80 sticky top-0 z-30 px-4 sm:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-2 py-2.5">
          {[
            { id: 'overview', label: 'المؤشرات العامة', icon: LayoutDashboard },
            { id: 'orders', label: 'الطلبات والحجوزات', icon: Calendar, badge: orders.length },
            { id: 'captains', label: 'الكباتن والفانات', icon: Users, badge: captains.length },
            { id: 'services', label: 'كتالوج الخدمات والباقات', icon: CarIcon },
            { id: 'store', label: 'المتجر والمخزون', icon: ShoppingBag, badge: storeProducts.length },
            { id: 'capacity', label: 'السعة التشغيلية والمواعيد', icon: Clock },
            { id: 'coupons', label: 'كوبونات الخصم', icon: Tag, badge: coupons.length },
            { id: 'zones', label: 'مناطق التغطية', icon: MapPin },
            { id: 'notifications', label: 'إرسال الإشعارات', icon: Bell },
            { id: 'cms', label: 'المحتوى الثابت والصفحات', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-102'
                    : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === tab.id ? 'bg-slate-900 text-amber-400' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-semibold">إجمالي الإيرادات</span>
                  <h3 className="text-2xl font-bold text-emerald-400">
                    {totalRevenue.toFixed(2)} <span className="text-xs">ر.س</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-normal">+18% مقارنة بالأسبوع الماضي</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-semibold">إجمالي الطلبات</span>
                  <h3 className="text-2xl font-bold text-blue-400">
                    {orders.length} <span className="text-xs">طلب</span>
                  </h3>
                  <span className="text-[10px] text-blue-300 font-normal">منها {completedOrdersCount} طلب مكتمل</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-semibold">الطلبات النشطة وقيد التنفيذ</span>
                  <h3 className="text-2xl font-bold text-amber-400">
                    {pendingOrdersCount} <span className="text-xs">طلب نشط</span>
                  </h3>
                  <span className="text-[10px] text-amber-300 font-normal">تحتاج متابعة الكباتن</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-semibold">الكباتن المتاحين للخدمة</span>
                  <h3 className="text-2xl font-bold text-purple-400">
                    {activeCaptainsCount} <span className="text-xs">من أصل {captains.length}</span>
                  </h3>
                  <span className="text-[10px] text-purple-300 font-normal">تغطية فانات جدة والرياض</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Live Orders Queue in Overview */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>طابور الطلبات الحية الأحدث</span>
                </h4>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-amber-400 font-bold hover:underline"
                >
                  عرض جميع الطلبات ({orders.length}) ←
                </button>
              </div>

              <div className="divide-y divide-slate-700">
                {orders.slice(0, 4).map((o, idx) => (
                  <div key={o.id || `live-ord-${idx}`} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-amber-400">#{o.orderNumber}</span>
                      <span className="text-slate-200 font-bold">{o.service?.title || 'طلب متجر'}</span>
                      <span className="text-slate-400">({o.customerName})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-bold">{o.totalAmount.toFixed(2)} ر.س</span>
                      <span className="bg-slate-700 text-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. ORDERS MANAGEMENT TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Filters bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800 p-4 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchOrder}
                  onChange={e => setSearchOrder(e.target.value)}
                  placeholder="بحث برقم الطلب، اسم العميل أو الجوال..."
                  className="p-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 w-64"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'created', label: 'جديد' },
                  { id: 'assigned', label: 'مسند' },
                  { id: 'on_the_way', label: 'في الطريق' },
                  { id: 'in_progress', label: 'قيد التنفيذ' },
                  { id: 'completed', label: 'مكتمل' },
                  { id: 'cancelled', label: 'ملغي' },
                ].map(st => (
                  <button
                    key={st.id}
                    onClick={() => setOrderStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      orderStatusFilter === st.id
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <table className="w-full text-right text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-700">
                  <tr>
                    <th className="p-3.5">رقم الطلب</th>
                    <th className="p-3.5">العميل والجوال</th>
                    <th className="p-3.5">الخدمة والسيارة</th>
                    <th className="p-3.5">الموعد</th>
                    <th className="p-3.5">الكابتن المكلف</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5">المبلغ</th>
                    <th className="p-3.5 text-center">إجراءات المدير</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {filteredOrders.map((order, idx) => (
                    <tr key={order.id || `order-${idx}`} className="hover:bg-slate-700/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-amber-400">#{order.orderNumber}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{order.customerName}</div>
                        <div className="text-[11px] text-slate-400" dir="ltr">+{order.customerPhone}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-200">{order.service?.title || 'طلب متجر'}</div>
                        {order.car && (
                          <div className="text-[11px] text-slate-400">{order.car.brand} {order.car.model} ({order.car.plateNumber})</div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div>{order.date}</div>
                        <div className="text-[11px] text-slate-400">{order.timeSlot}</div>
                      </td>
                      <td className="p-3.5">
                        {order.type === 'store' ? (
                          <span className="text-[11px] text-amber-400 font-bold inline-flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                            🚚 شحن وتوصيل
                          </span>
                        ) : (
                          <select
                            value={order.captainId || ''}
                            onChange={e => {
                              const capId = e.target.value;
                              updateOrderStatus(order.id, order.status, capId);
                            }}
                            className="bg-slate-900 border border-slate-700 text-xs text-white p-1 rounded-lg focus:outline-none"
                          >
                            <option value="">-- بدون كابتن --</option>
                            {captains.map((c, idx) => (
                              <option key={c.id || `cap-opt-${idx}`} value={c.id}>
                                {c.name} ({c.city || (c as any).zone || (Array.isArray(c.assignedZones) ? c.assignedZones[0] : 'جدة')})
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="p-3.5">
                        <select
                          value={order.status}
                          onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="bg-slate-900 border border-slate-700 text-xs text-amber-400 font-bold p-1 rounded-lg focus:outline-none"
                        >
                          {order.type === 'store' ? (
                            <>
                              <option value="confirmed">تم تأكيد الطلب</option>
                              <option value="in_progress">جاري تجهيز الشحنة</option>
                              <option value="on_the_way">في طريق التوصيل 🚚</option>
                              <option value="completed">تم التوصيل بنجاح ✓</option>
                              <option value="cancelled">ملغي ومسترد</option>
                            </>
                          ) : order.isCarpetService ? (
                            <>
                              <option value="confirmed">تم تأكيد الطلب</option>
                              <option value="on_the_way">في الطريق</option>
                              <option value="arrived">تم وصول المندوب</option>
                              <option value="carpet_received_from_client">تم الاستلام من العميل</option>
                              <option value="carpet_delivered_to_laundry" disabled={order.paymentStatus !== 'paid'}>
                                تم تسليم لمغسلة {order.paymentStatus !== 'paid' ? '🔒 (يتطلب السداد)' : ''}
                              </option>
                              <option value="carpet_received_from_laundry" disabled={order.paymentStatus !== 'paid'}>
                                تم الاستلام من المغسلة {order.paymentStatus !== 'paid' ? '🔒 (يتطلب السداد)' : ''}
                              </option>
                              <option value="carpet_on_the_way_delivery" disabled={order.paymentStatus !== 'paid'}>
                                في الطريق للعميل للتسليم {order.paymentStatus !== 'paid' ? '🔒 (يتطلب السداد)' : ''}
                              </option>
                              <option value="completed" disabled={order.paymentStatus !== 'paid'}>
                                مكتمل {order.paymentStatus !== 'paid' ? '🔒 (يتطلب السداد)' : ''}
                              </option>
                              <option value="cancelled">ملغي</option>
                            </>
                          ) : (
                            <>
                              <option value="created">تم الإنشاء</option>
                              <option value="confirmed">تم التأكيد</option>
                              <option value="assigned">مسند لكابتن</option>
                              <option value="on_the_way">الكابتن في الطريق</option>
                              <option value="arrived">وصل الموقع</option>
                              <option value="in_progress">جاري التنفيذ</option>
                              <option value="completed">مكتمل</option>
                              <option value="cancelled">ملغي</option>
                            </>
                          )}
                        </select>
                      </td>
                      <td className="p-3.5 font-bold text-emerald-400">{order.totalAmount.toFixed(2)} ر.س</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => {
                            const newNotes = prompt('تعديل ملاحظات الطلب:', order.notes || '');
                            if (newNotes !== null) modifyOrderAdmin(order.id, { notes: newNotes });
                          }}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs"
                          title="تعديل"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. CAPTAINS TAB */}
        {activeTab === 'captains' && (
          <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {captains.map((cap, idx) => (
                <div key={cap.id || `cap-${idx}`} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base">
                        {cap.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-white">{cap.name}</h5>
                        <span className="text-xs text-slate-400" dir="ltr">+{cap.phone}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      cap.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {cap.status === 'active' ? 'جاهز ونشط' : 'مشغول / غير متاح'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">المنطقة:</span>
                      <span className="font-bold text-slate-200">{cap.city || (cap as any).zone || (Array.isArray(cap.assignedZones) ? cap.assignedZones.join('، ') : 'جدة')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">الطلبات المنجزة:</span>
                      <span className="font-bold text-amber-400">{cap.completedOrdersCount} طلب</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700 text-xs">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <span>★ {(cap.rating || 5.0).toFixed(1)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newStatus = cap.status === 'active' ? 'busy' : 'active';
                          updateCaptain(cap.id, { status: newStatus as any });
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-xs px-2.5 py-1 rounded-lg text-slate-200"
                      >
                        تبديل الحالة
                      </button>
                      <button
                        onClick={() => deleteCaptain(cap.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SERVICES & PACKAGES TAB */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl border border-slate-700">
              <div>
                <h4 className="text-sm font-black text-white">كتالوج الخدمات والباقات والاشتراكات</h4>
                <p className="text-xs text-slate-400">تعديل الأسعار حسب حجم السيارة، وتفعيل أو إيقاف الخدمات</p>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-black text-amber-400">الخدمات الفردية ({services.length})</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((s, idx) => (
                  <div key={s.id || `srv-${idx}`} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={s.image} alt={s.title} className="w-14 h-14 rounded-xl object-cover" />
                      <div>
                        <h6 className="text-xs font-black text-white">{s.title}</h6>
                        <span className="text-xs font-bold text-amber-400">{s.price.toFixed(2)} ر.س</span>
                        <div className="text-[10px] text-slate-400">سيدان: {s.pricingByCarCategory?.sedan || s.price} | SUV: {s.pricingByCarCategory?.suv || s.price}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleServiceActive(s.id)}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                          s.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {s.isActive ? 'مفعلة' : 'معطلة'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h5 className="text-xs font-black text-amber-400">باقات التوفير والاشتراكات ({packages.length + subscriptions.length})</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...packages, ...subscriptions].map((p, idx) => (
                  <div key={p.id ? `${p.id}-${idx}` : `pkg-sub-${idx}`} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.title} className="w-14 h-14 rounded-xl object-cover" />
                      <div>
                        <h6 className="text-xs font-black text-white">{p.title}</h6>
                        <span className="text-xs font-bold text-amber-400">{p.price.toFixed(2)} ر.س</span>
                        <p className="text-[10px] text-slate-400">{p.tag || 'باقة حصرية'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleServiceActive(p.id)}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                        p.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {p.isActive ? 'مفعلة' : 'معطلة'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. STORE & INVENTORY TAB */}
        {activeTab === 'store' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl border border-slate-700">
              <div>
                <h4 className="text-sm font-black text-white">إدارة منتجات ومخزون المتجر الإلكتروني</h4>
                <p className="text-xs text-slate-400">إضافة معطرات، مناديل، تماثيل، واكسسوارات السيارات</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {storeProducts.map((prod, idx) => (
                <div key={prod.id || `prod-${idx}`} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={prod.image} alt={prod.name} className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <h6 className="text-xs font-black text-white line-clamp-1">{prod.name}</h6>
                      <span className="text-xs font-bold text-amber-400">{prod.price.toFixed(2)} ر.س</span>
                      <span className="text-[10px] text-slate-400 block">المخزون: {prod.stock} قطعة</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteProduct(prod.id)}
                    className="text-red-400 hover:text-red-300 p-1.5"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. CAPACITY & TIME SLOTS TAB */}
        {activeTab === 'capacity' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
              <h4 className="text-sm font-black text-white">السعة التشغيلية الذكية وإدارة المواعيد</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                تتحكم هذه الشاشة بالحد الأقصى لعدد الفانات والحجوزات المتاحة لكل فترة زمنية لمنع التكدس وضمان دقة المواعيد.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {capacitySlots.map((slot, idx) => {
                const booked = (slot as any).currentBookingsCount !== undefined ? (slot as any).currentBookingsCount : (slot.bookedMinutes || 0);
                const total = (slot as any).maxCapacity !== undefined ? (slot as any).maxCapacity : (slot.totalCapacityMinutes || 240);
                const percentage = total > 0 ? Math.min(100, Math.round((booked / total) * 100)) : 0;
                const slotLabel = slot.slot || (slot as any).timeSlot || `الفترة ${idx + 1}`;
                return (
                  <div key={slot.slot || (slot as any).id || `slot-${idx}`} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-black text-white">{slotLabel}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        slot.isAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {slot.isAvailable ? 'متاح للحجز' : 'مكتمل / مغلق'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>نسبة الإشغال:</span>
                        <span className="font-bold text-white">{booked} / {total} {slot.totalCapacityMinutes ? 'دقيقة' : 'فان'}</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. COUPONS & DISCOUNTS TAB */}
        {activeTab === 'coupons' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl border border-slate-700">
              <div>
                <h4 className="text-sm font-black text-white">إدارة كوبونات الخصم والعروض الترويجية</h4>
                <p className="text-xs text-slate-400">إنشاء أكواد خصم بنسب مئوية أو مبالغ ثابتة</p>
              </div>
              <button
                onClick={() => setShowAddCouponModal(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة كود خصم</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((c, idx) => (
                <div key={c.id || `coup-${idx}`} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-amber-400 font-mono bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
                      {c.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {c.isActive ? 'فعّال' : 'معطل'}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-white">{c.title}</h5>
                    <span className="text-xs font-black text-emerald-400">
                      خصم {c.discountValue} {c.discountType === 'percentage' ? '%' : 'ر.س'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700 text-[11px] text-slate-400">
                    <span>مرات الاستخدام: {c.usedCount || 0}</span>
                    <button
                      onClick={() => deleteCoupon(c.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. COVERAGE ZONES TAB */}
        {activeTab === 'zones' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
              <h4 className="text-sm font-black text-white">مناطق ومدن التغطية للغسيل المتنقل</h4>
              <p className="text-xs text-slate-400 mt-1">
                تحديد الأحياء والمدن المشمولة ورسوم التوصيل والحد الأدنى للطلب.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {zones.map((z, idx) => {
                const cityName = z.city || (z as any).cityName || 'المملكة';
                const districtText = z.district || (Array.isArray((z as any).districts) ? (z as any).districts.join('، ') : 'جميع الأحياء');
                const feeAmount = z.fee !== undefined ? z.fee : ((z as any).deliveryFee || 0);
                return (
                  <div key={z.id || `zone-${idx}`} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-black text-white">{cityName}</h5>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        z.isActive !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {z.isActive !== false ? 'مغطاة بالكامل' : 'غير مفعلة'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      الأحياء المشمولة: {districtText}
                    </div>
                    <div className="text-xs text-amber-400 font-bold">
                      رسوم التوصيل: {feeAmount === 0 ? 'مجاناً' : `${feeAmount} ر.س`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 9. BROADCAST NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 animate-in fade-in max-w-xl">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-4">
              <h4 className="text-sm font-bold text-white">
                إرسال إشعار جماعي فوري (Push Notification)
              </h4>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">عنوان الإشعار</label>
                  <input
                    type="text"
                    value={notifTitle}
                    onChange={e => setNotifTitle(e.target.value)}
                    placeholder="مثال: خصم 30% لنهاية الأسبوع..."
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">نص الرسالة</label>
                  <textarea
                    value={notifMsg}
                    onChange={e => setNotifMsg(e.target.value)}
                    placeholder="اكتب تفاصيل العرض أو التنبيه هنا..."
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 h-24 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">الجمهور المستهدف</label>
                  <select
                    value={notifTarget}
                    onChange={e => setNotifTarget(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="customers">جميع العملاء</option>
                    <option value="captains">كافة الكباتن والمناديب</option>
                    <option value="all">الجميع</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    if (!notifTitle.trim() || !notifMsg.trim()) {
                      alert('يرجى كتابة العنوان والرسالة');
                      return;
                    }
                    sendNotification({
                      title: notifTitle,
                      message: notifMsg,
                      target: notifTarget,
                      channel: 'in_app'
                    });
                    setNotifTitle('');
                    setNotifMsg('');
                    alert('تم بث الإشعار بنجاح لجميع المستخدمين!');
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال الإشعار الآن</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 10. CMS & STATIC PAGES TAB */}
        {activeTab === 'cms' && (
          <div className="space-y-6 animate-in fade-in max-w-2xl">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-4">
              <h4 className="text-sm font-black text-white font-['Cairo']">
                إدارة المحتوى التعريفي والشروط والسياسات (CMS)
              </h4>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">من نحن (عن منصة نيكست)</label>
                  <textarea
                    value={staticContent.aboutUs}
                    onChange={e => updateStaticContent({ aboutUs: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 h-24"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">الشروط والأحكام وسياسة الإلغاء</label>
                  <textarea
                    value={staticContent.termsAndConditions}
                    onChange={e => updateStaticContent({ termsAndConditions: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 h-24"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">سياسة الخصوصية وأمان البيانات</label>
                  <textarea
                    value={staticContent.privacyPolicy}
                    onChange={e => updateStaticContent({ privacyPolicy: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 h-24"
                  />
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>يتم حفظ جميع التعديلات تلقائياً في النظام وتحديثها في واجهة العميل.</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add Captain Modal */}
      {showAddCaptainModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl p-6 max-w-sm w-full border border-slate-700 text-right space-y-4">
            <h4 className="text-base font-black text-white">إضافة كابتن جديد</h4>
            <div className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="اسم الكابتن"
                value={newCapName}
                onChange={e => setNewCapName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
              <input
                type="tel"
                placeholder="رقم الجوال (مثال: 966501112233)"
                value={newCapPhone}
                onChange={e => setNewCapPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                dir="ltr"
              />
              <select
                value={newCapZone}
                onChange={e => setNewCapZone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
              >
                <option value="جدة">جدة</option>
                <option value="الرياض">الرياض</option>
                <option value="مكة المكرمة">مكة المكرمة</option>
                <option value="الدمام">الدمام</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (!newCapName) return;
                  addCaptain({
                    name: newCapName,
                    phone: newCapPhone || '0500000000',
                    city: newCapZone,
                    assignedZones: [newCapZone],
                    timeSlots: ['14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00'],
                    status: 'active'
                  });
                  setShowAddCaptainModal(false);
                  setNewCapName('');
                  setNewCapPhone('');
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 rounded-xl"
              >
                إضافة الكابتن
              </button>
              <button
                onClick={() => setShowAddCaptainModal(false)}
                className="px-4 py-2.5 bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl p-6 max-w-sm w-full border border-slate-700 text-right space-y-4">
            <h4 className="text-base font-black text-white">إضافة كوبون خصم جديد</h4>
            <div className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="كود الخصم (مثل: VIP30)"
                value={newCoupCode}
                onChange={e => setNewCoupCode(e.target.value.toUpperCase())}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono uppercase"
              />
              <input
                type="text"
                placeholder="عنوان أو وصف الكود"
                value={newCoupTitle}
                onChange={e => setNewCoupTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newCoupType}
                  onChange={e => setNewCoupType(e.target.value as any)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (ر.س)</option>
                </select>
                <input
                  type="number"
                  placeholder="القيمة"
                  value={newCoupValue}
                  onChange={e => setNewCoupValue(parseFloat(e.target.value) || 0)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (!newCoupCode) return;
                  addCoupon({
                    code: newCoupCode,
                    title: newCoupTitle || `خصم ${newCoupValue}`,
                    discountType: newCoupType,
                    discountValue: newCoupValue,
                    isActive: true,
                    expiresAt: '2026-12-31'
                  });
                  setShowAddCouponModal(false);
                  setNewCoupCode('');
                  setNewCoupTitle('');
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 rounded-xl"
              >
                تأكيد الكوبون
              </button>
              <button
                onClick={() => setShowAddCouponModal(false)}
                className="px-4 py-2.5 bg-slate-700 text-slate-300 text-xs rounded-xl"
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

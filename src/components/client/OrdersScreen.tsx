import React, { useState } from 'react';
import { useApp, CARPET_ORDER_STAGES } from '../../context/AppContext';
import { ServiceOrder, OrderStatus, AddonProduct } from '../../types';
import { INITIAL_CARPET_ITEMS } from '../../data/initialData';
import confetti from 'canvas-confetti';
import {
  Calendar,
  ShoppingBag,
  Car as CarIcon,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Phone,
  User,
  Star,
  X,
  Printer,
  ChevronLeft,
  ChevronDown,
  Navigation,
  Sparkles,
  ShieldCheck,
  Lock,
  CreditCard,
  AlertTriangle,
  Ruler,
  Truck,
  Info,
  Plus,
  Minus,
  Check,
  Wallet,
  Layers,
  ArrowRight,
  Package
} from 'lucide-react';

export const OrdersScreen: React.FC = () => {
  const {
    orders,
    openOrderDetail,
    selectedOrderForTracking,
    setSelectedOrderForTracking,
    cancelOrder,
    rateOrder,
    setCurrentScreen,
    confirmCarpetInspection,
    adjustCarpetInspection,
    payCarpetOrder,
    updateCarpetOrderStatus,
    setCaptainOnDelivery,
    walletBalance,
    requestStoreOrderReturn
  } = useApp();

  const [activeTab, setActiveTab] = useState<'services' | 'store'>('services');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<ServiceOrder | null>(null);
  const [ratingOrder, setRatingOrder] = useState<ServiceOrder | null>(null);
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [cancelModalOrder, setCancelModalOrder] = useState<ServiceOrder | null>(null);
  const [returnModalOrder, setReturnModalOrder] = useState<ServiceOrder | null>(null);
  const [returnReason, setReturnReason] = useState<string>('');
  const [actionAlert, setActionAlert] = useState<{ message: string; isError: boolean } | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const expandAllOrders = () => {
    const all: Record<string, boolean> = {};
    filteredOrders.forEach(o => {
      all[o.id] = true;
    });
    setExpandedOrders(all);
  };

  const collapseAllOrders = () => {
    setExpandedOrders({});
  };

  // Carpet payment & inspection states
  const [carpetPayModalOrder, setCarpetPayModalOrder] = useState<ServiceOrder | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'moyasar_card' | 'wallet' | 'tabby' | 'tamara'>('moyasar_card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Captain simulation modal states
  const [captainModalOrderId, setCaptainModalOrderId] = useState<string | null>(null);
  const [captainAdjustMode, setCaptainAdjustMode] = useState(false);
  const [tempAdjustAddons, setTempAdjustAddons] = useState<AddonProduct[]>([]);
  const [adjustNotes, setAdjustNotes] = useState('');

  const activeCaptainOrder = captainModalOrderId ? orders.find(o => o.id === captainModalOrderId) || null : null;

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'services') return o.type === 'service' || o.type === 'package';
    return o.type === 'store';
  });

  const getStatusBadge = (status: OrderStatus, order?: ServiceOrder) => {
    if (order?.type === 'store') {
      switch (status) {
        case 'created':
        case 'confirmed':
          return (
            <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-600" />
              تم تأكيد الطلب
            </span>
          );
        case 'in_progress':
          return (
            <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1">
              <Package className="w-3 h-3 text-amber-600" />
              جاري تجهيز الشحنة
            </span>
          );
        case 'on_the_way':
          return (
            <span className="bg-purple-100 text-purple-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1">
              <Truck className="w-3 h-3 text-purple-600" />
              في طريق التوصيل 🚚
            </span>
          );
        case 'completed':
          return (
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              تم التوصيل بنجاح ✓
            </span>
          );
        case 'return_requested':
          return (
            <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              طلب استرجاع قيد المعالجة
            </span>
          );
        case 'returned':
          return (
            <span className="bg-teal-100 text-teal-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-teal-600" />
              تم استرجاع المبلغ للمحفظة
            </span>
          );
        case 'cancelled':
          return (
            <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              ملغي ومسترد
            </span>
          );
        default:
          break;
      }
    }

    if (order?.isCarpetService) {
      switch (status) {
        case 'confirmed':
        case 'created':
          return (
            <span className="bg-blue-100 text-blue-900 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-600" />
              تم تأكيد الطلب
            </span>
          );
        case 'on_the_way':
          return (
            <span className="bg-amber-100 text-amber-900 text-[11px] font-black px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1">
              <Truck className="w-3 h-3 text-amber-600" />
              في الطريق
            </span>
          );
        case 'arrived':
          return (
            <span className="bg-purple-100 text-purple-900 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <MapPin className="w-3 h-3 text-purple-600" />
              تم وصول المندوب
            </span>
          );
        case 'carpet_received_from_client':
          if (order.paymentStatus === 'pending') {
            if (order.inspectionStatus === 'adjusted') {
              return (
                <span className="bg-purple-100 text-purple-950 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-purple-600" />
                  تم الاستلام من العميل (تعديل مقاسات - بانتظار الدفع)
                </span>
              );
            }
            return (
              <span className="bg-indigo-100 text-indigo-900 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                تم الاستلام من العميل (بانتظار الدفع)
              </span>
            );
          }
          return (
            <span className="bg-indigo-100 text-indigo-900 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-indigo-600" />
              تم الاستلام من العميل (مدفوع)
            </span>
          );
        case 'carpet_delivered_to_laundry':
          return (
            <span className="bg-sky-100 text-sky-900 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-600" />
              تم تسليم لمغسلة
            </span>
          );
        case 'carpet_received_from_laundry':
          return (
            <span className="bg-teal-100 text-teal-900 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-600" />
              تم الاستلام من المغسلة
            </span>
          );
        case 'carpet_on_the_way_delivery':
          return (
            <span className="bg-emerald-100 text-emerald-900 text-[11px] font-black px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1">
              <Truck className="w-3 h-3 text-emerald-600" />
              في الطريق للعميل للتسليم
            </span>
          );
        case 'completed':
          return (
            <span className="bg-emerald-100 text-emerald-900 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              مكتمل
            </span>
          );
        case 'cancelled':
          return (
            <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              ملغي ومسترد
            </span>
          );
        default:
          break;
      }
    }

    switch (status) {
      case 'created':
      case 'confirmed':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">تم التأكيد</span>;
      case 'assigned':
        return <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">مسند لكابتن</span>;
      case 'on_the_way':
        return <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">في الطريق</span>;
      case 'arrived':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">وصل الموقع</span>;
      case 'in_progress':
        return <span className="bg-yellow-100 text-yellow-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">جاري التنفيذ والغسيل</span>;
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">مكتمل</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">ملغي ومسترد</span>;
      default:
        return null;
    }
  };

  const handleConfirmCancel = () => {
    if (!cancelModalOrder) return;
    const res = cancelOrder(cancelModalOrder.id);
    setActionAlert({ message: res.message, isError: !res.success });
    setCancelModalOrder(null);
    setTimeout(() => setActionAlert(null), 4000);
  };

  const handleSubmitRating = () => {
    if (!ratingOrder) return;
    rateOrder(ratingOrder.id, ratingStars, ratingComment);
    setRatingOrder(null);
    setRatingComment('');
    setActionAlert({ message: 'شكراً لك! تم تسجيل تقييمك بنجاح.', isError: false });
    setTimeout(() => setActionAlert(null), 3000);
  };

  const openCaptainModal = (order: ServiceOrder) => {
    setCaptainModalOrderId(order.id);
    setCaptainAdjustMode(false);
    setTempAdjustAddons(order.addons && order.addons.length > 0 ? JSON.parse(JSON.stringify(order.addons)) : []);
    setAdjustNotes(order.inspectionNotes || '');
  };

  const handleAdvanceStatus = (targetStatus: OrderStatus) => {
    if (!activeCaptainOrder) return;
    const stagesRequiringPayment: OrderStatus[] = [
      'carpet_delivered_to_laundry',
      'carpet_received_from_laundry',
      'carpet_on_the_way_delivery',
      'completed'
    ];
    if (stagesRequiringPayment.includes(targetStatus) && activeCaptainOrder.paymentStatus !== 'paid') {
      setActionAlert({
        message: '🔒 تنبيه أمني: لا يمكن تحويل الحالة إلى (في الطريق للعميل للتسليم) أو تسليم المغسلة حتى يتم تأكيد سداد العميل وإتمام الدفع أولاً.',
        isError: true
      });
      setTimeout(() => setActionAlert(null), 5000);
      return;
    }

    updateCarpetOrderStatus(activeCaptainOrder.id, targetStatus);
    const stageLabel = CARPET_ORDER_STAGES.find(s => s.status === targetStatus)?.label || targetStatus;
    setActionAlert({ message: `✅ تم تغيير حالة الطلب إلى: "${stageLabel}"`, isError: false });
    setTimeout(() => setActionAlert(null), 4000);
  };

  const handleCaptainConfirmSizes = () => {
    if (!activeCaptainOrder) return;
    confirmCarpetInspection(activeCaptainOrder.id);
    setActionAlert({ message: '✅ تم تأكيد المقاسات وتغيير الحالة إلى "تم الاستلام من العميل" وتفعيل زر الدفع للعميل.', isError: false });
    setTimeout(() => setActionAlert(null), 4000);
  };

  const handleCaptainSaveAdjustments = () => {
    if (!activeCaptainOrder) return;
    if (!adjustNotes.trim()) {
      alert('يرجى كتابة سبب أو وصف لتعديل المقاسات والسعر لإشعار العميل به');
      return;
    }
    adjustCarpetInspection(activeCaptainOrder.id, tempAdjustAddons, adjustNotes);
    setActionAlert({ message: '⚠️ تم تعديل المقاسات وإعادة احتساب السعر وإشعار العميل لإتمام الدفع.', isError: false });
    setCaptainAdjustMode(false);
    setTimeout(() => setActionAlert(null), 4000);
  };

  const handleExecutePayment = () => {
    if (!carpetPayModalOrder) return;
    setIsProcessingPayment(true);
    setTimeout(() => {
      payCarpetOrder(carpetPayModalOrder.id, selectedPaymentMethod);
      setIsProcessingPayment(false);
      setCarpetPayModalOrder(null);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
      setActionAlert({
        message: '🎉 تم تأكيد الدفع بنجاح! تم إصدار الفاتورة الضريبية وجاري نقل السجاد للمغسلة.',
        isError: false
      });
      setTimeout(() => setActionAlert(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-24 text-right animate-in fade-in duration-300">
      {/* Alert toast */}
      {actionAlert && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between animate-in fade-in ${
            actionAlert.isError
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm'
          }`}
        >
          <span>{actionAlert.message}</span>
          <button onClick={() => setActionAlert(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs matching Screenshot 18: الخدمات vs المتجر */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
            activeTab === 'services'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>طلبات الخدمات ({orders.filter(o => o.type !== 'store').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
            activeTab === 'store'
              ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>طلبات المتجر ({orders.filter(o => o.type === 'store').length})</span>
        </button>
      </div>

      {/* Quick summary & navigation hint */}
      {filteredOrders.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500 font-semibold">
          <span>
            اضغط على زر "تفاصيل الطلب" أو على بطاقة الطلب لاستعراض صفحة تفاصيل الطلب الكاملة ومتابعة كافة الإجراءات.
          </span>
        </div>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
            <CarIcon className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">
            لا توجد طلبات في الوقت الحالي
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto font-normal">
            ابدأ بحجز أول خدمة غسيل سيارات أو غسيل سجاد ومفروشات مع نيكست.
          </p>
          <button
            onClick={() => setCurrentScreen('home')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5"
          >
            <span>احجز خدمة الآن</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Orders list cards */
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const isCarpet = order.isCarpetService || order.service?.category === 'carpets' || order.service?.category === 'carpets_furniture' || order.service?.category === 'furniture';
            const isUnpaidCarpet = isCarpet && order.paymentStatus === 'pending';
            const canPayCarpet = isUnpaidCarpet && (order.inspectionStatus === 'confirmed' || order.inspectionStatus === 'adjusted');
            const isInspectionPending = isUnpaidCarpet && order.inspectionStatus === 'pending_inspection';
            const isExpanded = !!expandedOrders[order.id];

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border transition-all text-right relative overflow-hidden ${
                  isExpanded
                    ? 'border-blue-200 shadow-md ring-1 ring-blue-500/10'
                    : 'border-slate-200 shadow-2xs hover:shadow-sm hover:border-slate-300'
                }`}
              >
                {/* Carpet Service indicator stripe */}
                {isCarpet && (
                  <div className="h-1 bg-gradient-to-r from-amber-500 via-blue-600 to-indigo-600 w-full" />
                )}

                {/* Order Header / Card Click */}
                <div
                  onClick={() => openOrderDetail(order)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 cursor-pointer select-none transition-colors hover:bg-slate-50/70"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openOrderDetail(order);
                    }
                  }}
                  aria-expanded={isExpanded}
                >
                  {/* Basic Data: Order Number, Badge, Title, Car, Date */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm sm:text-base font-extrabold text-slate-900">
                        طلب #{order.orderNumber}
                      </span>
                      {isCarpet && (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          غسيل سجاد ومفروشات
                        </span>
                      )}
                      {order.type === 'store' && (
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          طلب متجر
                        </span>
                      )}
                      {getStatusBadge(order.status, order)}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                      <span className="font-bold text-slate-900">
                        {order.service?.title || (order.storeItems && `${order.storeItems.length} منتجات من المتجر`)}
                      </span>
                      {order.car && (
                        <span className="text-slate-600 font-semibold inline-flex items-center gap-1">
                          <CarIcon className="w-3 h-3 text-blue-600 shrink-0" />
                          {order.car.brand} {order.car.model} ({order.car.plateNumber})
                        </span>
                      )}
                      <span className="text-slate-400 font-medium inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{order.date} | {order.timeSlot}</span>
                      </span>
                    </div>
                  </div>

                  {/* Price, Payment Status & View Order Details Action Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right sm:text-left">
                      <div className="text-base sm:text-lg font-black text-blue-700 leading-tight">
                        {order.totalAmount.toFixed(2)} ر.س
                      </div>
                      <div className="text-[11px] font-bold mt-0.5">
                        {order.paymentStatus === 'paid' ? (
                          <span className="text-emerald-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            مدفوع
                          </span>
                        ) : (
                          <span className="text-amber-700 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            بانتظار السداد
                          </span>
                        )}
                      </div>
                    </div>

                    {/* View Order Details Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openOrderDetail(order);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 transition-all shadow-2xs group cursor-pointer shrink-0"
                      title="عرض تفاصيل الطلب الكاملة والإجراءات"
                      aria-label="تفاصيل الطلب"
                    >
                      <span>تفاصيل الطلب</span>
                      <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Remaining Details */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-3 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    {/* Carpet Status Notices (Rule 1, 2, 3) */}
                    {isCarpet && (
                      <div className="space-y-2">
                        {/* Status A: Pending Captain Inspection */}
                        {isInspectionPending && (
                          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-950 space-y-1.5">
                            <div className="flex items-center justify-between font-black">
                              <div className="flex items-center gap-2 text-amber-900">
                                <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                                <span>بانتظار معاينة ومراجعة المقاسات من قِبل الكابتن</span>
                              </div>
                              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                                الزر قيد التفعيل
                              </span>
                            </div>
                            <p className="text-[11px] text-amber-800 leading-relaxed">
                              📌 وفقاً لسياسة غسيل السجاد: زر إتمام الدفع سيكون غير مفعّل حتى يقوم الكابتن بمعاينة السجاد والتأكد من مطابقة المقاسات المدخلة. الفاتورة الضريبية تتاح فور إتمام السداد.
                            </p>
                          </div>
                        )}

                        {/* Status B: Confirmed Sizes by Captain */}
                        {isUnpaidCarpet && order.inspectionStatus === 'confirmed' && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-950 space-y-1.5">
                            <div className="flex items-center justify-between font-black">
                              <div className="flex items-center gap-2 text-emerald-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>تمت مراجعة المقاسات وتأكيد مطابقتها من قِبل الكابتن ✓</span>
                              </div>
                              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                                جاهز للدفع الآن
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-800 leading-relaxed">
                              ✨ تمت المعاينة الميدانية وتأكيد السعر. يرجى الضغط على زر <strong>"إتمام الدفع"</strong> أدناه لتأكيد الطلب وبدء عملية الغسيل والتعقيم الشامل.
                            </p>
                          </div>
                        )}

                        {/* Status C: Adjusted Sizes by Captain */}
                        {isUnpaidCarpet && order.inspectionStatus === 'adjusted' && (
                          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 text-xs text-purple-950 space-y-2">
                            <div className="flex items-center justify-between font-black">
                              <div className="flex items-center gap-2 text-purple-900">
                                <AlertTriangle className="w-4 h-4 text-purple-600" />
                                <span>تم تعديل المقاسات وإعادة احتساب السعر بواسطة الكابتن</span>
                              </div>
                              <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full font-bold">
                                تحديث السعر
                              </span>
                            </div>
                            <div className="bg-white/80 p-2.5 rounded-xl border border-purple-100 space-y-1 text-[11px]">
                              <p className="text-slate-800">
                                <strong>سبب التغيير الموضح من الكابتن:</strong> {order.inspectionNotes || 'اختلاف في مساحة السجاد عند القياس الميداني'}
                              </p>
                              <div className="flex items-center justify-between text-purple-900 font-black pt-1 border-t border-purple-100">
                                <span>المبلغ الإجمالي الجديد المطلوب:</span>
                                <span className="text-sm text-blue-700">{order.totalAmount.toFixed(2)} ر.س (شامل الضريبة)</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Status D: Paid & Ready for delivery */}
                        {isCarpet && order.paymentStatus === 'paid' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs text-blue-950 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-blue-600" />
                              <span className="font-bold">تم سداد الفاتورة بنجاح — الفاتورة الضريبية متاحة الآن</span>
                            </div>
                            <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                              مدفوع
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Order Content Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Service / Store item title */}
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-400 block font-bold">
                          {order.type === 'store' ? 'المنتجات المطلوبة:' : 'الخدمة المطلوبة:'}
                        </span>
                        <p className="font-black text-slate-900 text-sm">
                          {order.service?.title || (order.storeItems && `${order.storeItems.length} منتجات من المتجر`)}
                        </p>
                        {order.car && (
                          <span className="text-slate-600 font-semibold inline-flex items-center gap-1">
                            <CarIcon className="w-3 h-3 text-blue-600" />
                            {order.car.brand} {order.car.model} ({order.car.plateNumber})
                          </span>
                        )}

                        {/* Store items list preview */}
                        {order.type === 'store' && order.storeItems && order.storeItems.length > 0 && (
                          <div className="pt-1.5 space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {order.storeItems.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"
                                >
                                  <ShoppingBag className="w-2.5 h-2.5 text-amber-600" />
                                  <span>{item.name} × {item.quantity || 1}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Carpet items list preview */}
                        {isCarpet && order.addons && order.addons.length > 0 && (
                          <div className="pt-1.5 space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold block">قطع السجاد المختارة:</span>
                            <div className="flex flex-wrap gap-1">
                              {order.addons.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"
                                >
                                  <Ruler className="w-2.5 h-2.5 text-blue-600" />
                                  <span>{item.name} × {item.quantity || 1}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Location & Captain / Delivery info */}
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-400 block font-bold">
                          {order.type === 'store' ? 'عنوان التوصيل:' : 'الموقع والكابتن:'}
                        </span>
                        <p className="text-slate-700 font-semibold truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                          {order.address.name} - {order.address.city}
                        </p>
                        {order.type === 'store' ? (
                          <span className="text-[11px] text-slate-600 font-bold flex items-center gap-1">
                            <Truck className="w-3 h-3 text-amber-600" />
                            توصيل سريع إلى باب المنزل
                          </span>
                        ) : (
                          order.captainName ? (
                            <div className="flex items-center justify-between">
                              <span className="text-indigo-700 font-bold inline-flex items-center gap-1">
                                <User className="w-3 h-3" />
                                الكابتن: {order.captainName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">جاري تعيين الكابتن...</span>
                          )
                        )}
                      </div>

                      {/* Price & Payment */}
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-400 block font-medium">المبلغ الإجمالي وحالة السداد:</span>
                        <div className="text-base font-bold text-blue-700">
                          {order.totalAmount.toFixed(2)} ر.س
                        </div>
                        <div>
                          {order.paymentStatus === 'paid' ? (
                            <span className="text-[11px] text-emerald-700 font-black inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {order.paymentMethod === 'wallet' && 'مدفوع بالكامل من المحفظة'}
                              {order.paymentMethod === 'mixed' && `محفظة (${order.walletDeductedAmount.toFixed(2)}) + بطاقة`}
                              {order.paymentMethod === 'moyasar_card' && 'مدفوع عبر بطاقة مدى / ائتمان'}
                              {order.paymentMethod === 'tabby' && 'مدفوع بأقساط تابي'}
                              {order.paymentMethod === 'tamara' && 'مدفوع بأقساط تمارا'}
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-700 font-black inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              بانتظار سداد المبلغ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Live Tracking button */}
                        <button
                          onClick={() => setSelectedOrderForTracking(order)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>تتبع مسار الطلب</span>
                        </button>

                        {/* Rule 1 & Rule 5: INVOICE BUTTON ONLY APPEARS AFTER PAYMENT! */}
                        {order.paymentStatus === 'paid' ? (
                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span>الفاتورة الضريبية</span>
                          </button>
                        ) : (
                          <div
                            className="bg-slate-100 text-slate-400 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 border border-dashed border-slate-200 cursor-not-allowed select-none"
                            title="الفاتورة الضريبية تظهر حصرياً بعد إتمام الدفع"
                          >
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px]">الفاتورة (تتاح بعد الدفع)</span>
                          </div>
                        )}

                        {/* Rule 2 & 3: COMPLETE PAYMENT BUTTON */}
                        {isUnpaidCarpet && (
                          canPayCarpet ? (
                            <button
                              onClick={() => setCarpetPayModalOrder(order)}
                              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 animate-pulse"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>إتمام الدفع ({order.totalAmount.toFixed(2)} ر.س)</span>
                            </button>
                          ) : (
                            <button
                              disabled
                              className="bg-slate-100 text-slate-400 font-bold text-xs px-4 py-2 rounded-xl cursor-not-allowed flex items-center gap-1.5 border border-slate-200"
                              title="الزر غير مفعّل حالياً — بانتظار قيام الكابتن بمعاينة السجاد وتأكيد المقاسات"
                            >
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>إتمام الدفع (غير مفعّل حتى معاينة الكابتن)</span>
                            </button>
                          )
                        )}
                      </div>

                      {/* Captain Simulator / Testing Control & Actions */}
                      <div className="flex items-center gap-2">
                        {isCarpet && (
                          <button
                            onClick={() => openCaptainModal(order)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs px-3.5 py-2 rounded-xl border border-indigo-200 transition-all flex items-center gap-1 shadow-2xs"
                            title="لوحة تحكم وتجربة إجراءات الكابتن الميداني"
                          >
                            <User className="w-3.5 h-3.5 text-indigo-600" />
                            <span>إجراءات الكابتن 👨‍✈️</span>
                          </button>
                        )}

                        {/* Return button for store orders completed within 3 days */}
                        {order.type === 'store' && order.status === 'completed' && (
                          <button
                            onClick={() => {
                              setReturnModalOrder(order);
                              setReturnReason('');
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1"
                            title="طلب استرجاع المنتجات خلال 3 أيام من الاستلام"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-slate-600" />
                            <span>طلب استرجاع</span>
                          </button>
                        )}

                        {order.status === 'completed' && !order.rating && (
                          <button
                            onClick={() => setRatingOrder(order)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs px-3 py-2 rounded-xl border border-amber-200 transition-all flex items-center gap-1"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>تقييم الخدمة</span>
                          </button>
                        )}

                        {['created', 'confirmed', 'assigned'].includes(order.status) && (
                          <button
                            onClick={() => setCancelModalOrder(order)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                          >
                            إلغاء الطلب
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CARPET PAYMENT MODAL (Rule 2 & 3) */}
      {/* ========================================================================= */}
      {carpetPayModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right space-y-5 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    إتمام سداد طلب السجاد
                  </h4>
                  <span className="text-[11px] text-slate-400 font-normal">
                    طلب رقم #{carpetPayModalOrder.orderNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCarpetPayModalOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inspection Status Banner in Payment Modal */}
            {carpetPayModalOrder.inspectionStatus === 'adjusted' && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 space-y-1 text-xs text-purple-950">
                <div className="flex items-center gap-1.5 font-black text-purple-900">
                  <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>تنبيه: تم تعديل السعر بعد المعاينة الميدانية</span>
                </div>
                <p className="text-[11px] text-purple-800">
                  <strong>ملاحظة الكابتن:</strong> {carpetPayModalOrder.inspectionNotes}
                </p>
              </div>
            )}

            {/* Carpet Items Summary */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <span className="font-black text-slate-800 block pb-1 border-b border-slate-200">
                تفاصيل السجاد المعتمد للغسيل:
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {carpetPayModalOrder.addons.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-700">
                    <span className="font-semibold">{item.name} × {item.quantity || 1}</span>
                    <span className="font-black text-slate-900">{(item.price * (item.quantity || 1)).toFixed(2)} ر.س</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{carpetPayModalOrder.subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span>{carpetPayModalOrder.vatAmount.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between font-black text-base text-blue-700 pt-1 border-t border-slate-200">
                  <span>الإجمالي المطلوب سداده:</span>
                  <span>{carpetPayModalOrder.totalAmount.toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 text-xs">
              <span className="font-black text-slate-800 block">اختر وسيلة الدفع:</span>
              <div className="grid grid-cols-1 gap-2">
                {/* Mada / Card */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('moyasar_card')}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    selectedPaymentMethod === 'moyasar_card'
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      💳
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 block">بطاقة مدى / ائتمان / Apple Pay</span>
                      <span className="text-[10px] text-slate-500">دفع إلكتروني فوري وآمن عبر بوابة ميسر</span>
                    </div>
                  </div>
                  {selectedPaymentMethod === 'moyasar_card' && <Check className="w-4 h-4 text-blue-600" />}
                </button>

                {/* Wallet Balance */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('wallet')}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    selectedPaymentMethod === 'wallet'
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 block">محفظة نيكست الرقمية</span>
                      <span className="text-[10px] text-slate-500">
                        رصيدك الحالي: {walletBalance.toFixed(2)} ر.س
                      </span>
                    </div>
                  </div>
                  {selectedPaymentMethod === 'wallet' && <Check className="w-4 h-4 text-blue-600" />}
                </button>

                {/* Tabby */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('tabby')}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    selectedPaymentMethod === 'tabby'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-[10px]">
                      tabby
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 block">أقساط تابي (4 دفعات)</span>
                      <span className="text-[10px] text-slate-500">
                        ادفع {(carpetPayModalOrder.totalAmount / 4).toFixed(2)} ر.س اليوم والباقي لاحقاً
                      </span>
                    </div>
                  </div>
                  {selectedPaymentMethod === 'tabby' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>

                {/* Tamara */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('tamara')}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    selectedPaymentMethod === 'tamara'
                      ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
                      tamara
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 block">أقساط تمارا (4 دفعات)</span>
                      <span className="text-[10px] text-slate-500">
                        قسمها على 4 دفعات بدون فوائد
                      </span>
                    </div>
                  </div>
                  {selectedPaymentMethod === 'tamara' && <Check className="w-4 h-4 text-amber-600" />}
                </button>
              </div>
            </div>

            {/* Confirm Payment Action Button */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleExecutePayment}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>جاري معالجة السداد...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تأكيد ودفع {carpetPayModalOrder.totalAmount.toFixed(2)} ر.س</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setCarpetPayModalOrder(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CAPTAIN INSPECTION & WORKFLOW SIMULATOR (Rules 2, 3, 4) */}
      {/* ========================================================================= */}
      {activeCaptainOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-right space-y-5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Captain Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    بوابة الكابتن الميداني للمعاينة وتحديث الحالة
                  </h4>
                  <span className="text-[11px] text-slate-400 font-normal">
                    طلب غسيل سجاد #{activeCaptainOrder.orderNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCaptainModalOrderId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Status Banner */}
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">الحالة الحالية للطلب:</span>
                <span className="text-sm font-bold text-amber-400">
                  {CARPET_ORDER_STAGES.find(s => s.status === activeCaptainOrder.status)?.label || activeCaptainOrder.status}
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-bold">حالة الدفع:</span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                  activeCaptainOrder.paymentStatus === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {activeCaptainOrder.paymentStatus === 'paid' ? 'مدفوع ✓' : 'بانتظار الدفع'}
                </span>
              </div>
            </div>

            {/* Stage Progress Indicator */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>مراحل طلب غسيل السجاد (8 مراحل):</span>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {CARPET_ORDER_STAGES.map((stg, i) => {
                  const isCurrent = activeCaptainOrder.status === stg.status;
                  const isDone = (activeCaptainOrder.timeline || []).some(t => t.stageKey === stg.status && t.completed);
                  const isPostPickup = ['carpet_delivered_to_laundry', 'carpet_received_from_laundry', 'carpet_on_the_way_delivery', 'completed'].includes(stg.status);
                  const isLocked = isPostPickup && activeCaptainOrder.paymentStatus !== 'paid';

                  return (
                    <button
                      key={stg.status}
                      type="button"
                      onClick={() => handleAdvanceStatus(stg.status)}
                      className={`p-2 rounded-xl text-[10px] font-bold text-center border transition-all flex flex-col items-center justify-center gap-0.5 relative ${
                        isCurrent
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : isLocked
                          ? 'bg-slate-100/80 text-slate-400 border-slate-200 cursor-not-allowed opacity-75'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] opacity-75">{i + 1}.</span>
                        {isLocked && <Lock className="w-2.5 h-2.5 text-amber-600" />}
                      </div>
                      <span className="truncate max-w-full">{stg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Items & Inspection Actions */}
            {!captainAdjustMode ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-black text-slate-800 border-b border-slate-200 pb-2">
                    <span>قطع السجاد المسجلة بالطلب:</span>
                    <span>الإجمالي الحالي: {activeCaptainOrder.totalAmount.toFixed(2)} ر.س</span>
                  </div>
                  <div className="space-y-2">
                    {activeCaptainOrder.addons.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-100">
                        <div>
                          <span className="font-bold text-slate-800">{item.name}</span>
                          <span className="text-[10px] text-slate-400 block">{item.price.toFixed(2)} ر.س للقطعة</span>
                        </div>
                        <span className="bg-blue-50 text-blue-800 font-black px-2.5 py-1 rounded-lg text-xs">
                          الكمية: {item.quantity || 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inspection Actions if pending payment */}
                {activeCaptainOrder.paymentStatus === 'pending' && (
                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-black">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>معاينة المقاسات عند الاستلام (مطلوبة لتفعيل دفع العميل):</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        زر الدفع معطل عند العميل حتى تقوم بمعاينة المقاسات وتأكيدها أو تعديلها.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        onClick={handleCaptainConfirmSizes}
                        className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-all flex flex-col items-center justify-center gap-1.5 text-center"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>تأكيد مطابقة المقاسات ✓</span>
                        <span className="text-[10px] text-emerald-100 font-normal">المقاسات كما أدخلها العميل</span>
                      </button>

                      <button
                        onClick={() => setCaptainAdjustMode(true)}
                        className="p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs transition-all flex flex-col items-center justify-center gap-1.5 text-center"
                      >
                        <Ruler className="w-5 h-5" />
                        <span>تعديل المقاسات الفعلية ✏️</span>
                        <span className="text-[10px] text-slate-800 font-normal">وجد الكابتن اختلافاً بالمقاسات</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Sequential Next Step CTA */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-500 block">الإجراء التالي المقترح:</span>
                  
                  {activeCaptainOrder.status === 'confirmed' && (
                    <button
                      onClick={() => handleAdvanceStatus('on_the_way')}
                      className="w-full p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      <span>الانتقال للحالة: في الطريق 🚚</span>
                    </button>
                  )}

                  {activeCaptainOrder.status === 'on_the_way' && (
                    <button
                      onClick={() => handleAdvanceStatus('arrived')}
                      className="w-full p-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>الانتقال للحالة: تم وصول المندوب 📍</span>
                    </button>
                  )}

                  {activeCaptainOrder.status === 'arrived' && (
                    <button
                      onClick={handleCaptainConfirmSizes}
                      className="w-full p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>استلام السجاد من العميل وتأكيد المعاينة</span>
                    </button>
                  )}

                  {activeCaptainOrder.status === 'carpet_received_from_client' && (
                    activeCaptainOrder.paymentStatus === 'paid' ? (
                      <button
                        onClick={() => handleAdvanceStatus('carpet_delivered_to_laundry')}
                        className="w-full p-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>الانتقال للحالة: تم تسليم لمغسلة ✨</span>
                      </button>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center text-xs font-bold text-amber-900">
                        ⏳ لا يمكن تحويل الحالة للمغسلة حتى يسدد العميل الفاتورة أولاً.
                      </div>
                    )
                  )}

                  {activeCaptainOrder.status === 'carpet_delivered_to_laundry' && (
                    <button
                      onClick={() => handleAdvanceStatus('carpet_received_from_laundry')}
                      className="w-full p-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>الانتقال للحالة: تم الاستلام من المغسلة 🧼</span>
                    </button>
                  )}

                  {activeCaptainOrder.status === 'carpet_received_from_laundry' && (
                    activeCaptainOrder.paymentStatus === 'paid' ? (
                      <button
                        onClick={() => handleAdvanceStatus('carpet_on_the_way_delivery')}
                        className="w-full p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <Truck className="w-4 h-4" />
                        <span>الانتقال للحالة: في الطريق للعميل للتسليم 🚚</span>
                      </button>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center text-xs font-bold text-amber-900 space-y-1">
                        <div className="flex items-center justify-center gap-1.5 font-black">
                          <Lock className="w-4 h-4 text-amber-600" />
                          <span>لا يمكن تحويل الحالة إلى (في الطريق للعميل) حتى يتم سداد العميل وإتمام الدفع</span>
                        </div>
                        <p className="text-[11px] text-amber-800">يتطلب النظام سداد الفاتورة إلكترونياً من العميل قبل الانطلاق للتوصيل.</p>
                      </div>
                    )
                  )}

                  {activeCaptainOrder.status === 'carpet_on_the_way_delivery' && (
                    activeCaptainOrder.paymentStatus === 'paid' ? (
                      <button
                        onClick={() => handleAdvanceStatus('completed')}
                        className="w-full p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>إكمال وتسليم الطلب للعميل نهائياً ✓</span>
                      </button>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center text-xs font-bold text-amber-900">
                        🔒 لا يمكن إكمال الطلب حتى يتم تأكيد سداد العميل أولاً.
                      </div>
                    )
                  )}

                  {activeCaptainOrder.status === 'completed' && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center text-xs font-bold text-emerald-900">
                      ✓ اكتمل الطلب بنجاح وتم تسليم السجاد للعميل.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Captain Edit / Adjust Sizes Sub-View */
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-xs text-slate-900">
                    تعديل المقاسات والكميات الفعلية بعد المعاينة:
                  </h5>
                  <button
                    onClick={() => setCaptainAdjustMode(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                  >
                    ← رجوع
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {tempAdjustAddons.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <span className="text-[11px] text-blue-700 font-bold">{item.price.toFixed(2)} ر.س / قطعة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTempAdjustAddons(prev =>
                              prev.map((it, i) => (i === idx ? { ...it, quantity: Math.max(1, (it.quantity || 1) - 1) } : it))
                            );
                          }}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-black text-slate-700 hover:bg-slate-100"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-black text-sm">{item.quantity || 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setTempAdjustAddons(prev =>
                              prev.map((it, i) => (i === idx ? { ...it, quantity: (it.quantity || 1) + 1 } : it))
                            );
                          }}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-black text-slate-700 hover:bg-slate-100"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Captain Reason/Description Input (Required by rule) */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-black text-slate-800 block">
                    سبب وتفاصيل تعديل السجاد / السعر (يصل كإشعار للعميل): <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={adjustNotes}
                    onChange={e => setAdjustNotes(e.target.value)}
                    placeholder="مثال: مقاس السجادة الكبيرة بالمعاينة الفعلية هو 3×4 وليس 2×3، تم احتساب فرق المقاسات والمبلغ الجديد."
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 h-20 resize-none"
                  />
                </div>

                {/* Recalculated Total Preview */}
                <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl flex items-center justify-between text-xs font-bold">
                  <span className="text-purple-950">السعر الجديد بعد إعادة الاحتساب:</span>
                  <span className="text-base text-blue-700 font-bold">
                    {tempAdjustAddons.reduce((sum, it) => sum + it.price * (it.quantity || 1), 0).toFixed(2)} ر.س
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleCaptainSaveAdjustments}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3 rounded-xl shadow-xs transition-all"
                  >
                    حفظ وإشعار العميل لتنفيذ الدفع
                  </button>
                  <button
                    onClick={() => setCaptainAdjustMode(false)}
                    className="px-4 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Live Order Tracking Modal */}
      {/* ========================================================================= */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-right animate-in zoom-in-95">
            {/* Tracker Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">
                    تتبع الطلب #{selectedOrderForTracking.orderNumber}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {selectedOrderForTracking.service?.title || 'طلب متجر'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tracker Body */}
            <div className="p-5 overflow-y-auto space-y-6">
              {/* Captain / Shipping Info Card */}
              {selectedOrderForTracking.type === 'store' ? (
                <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-slate-50 p-4 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-sm">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-800 font-black block">شحن منتجات المتجر</span>
                      <h5 className="text-sm font-black text-slate-900">توصيل سريع إلى باب المنزل</h5>
                      <span className="text-xs text-slate-500 font-semibold">{selectedOrderForTracking.address.name} - {selectedOrderForTracking.address.city}</span>
                    </div>
                  </div>
                  <div className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    <span>أسطول التوصيل</span>
                  </div>
                </div>
              ) : (
                selectedOrderForTracking.captainName && (
                  <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                        {selectedOrderForTracking.captainName.charAt(0)}
                      </div>
                      <div>
                        <span className="text-[10px] text-blue-600 font-black block">الكابتن المعتمد</span>
                        <h5 className="text-sm font-black text-slate-900">{selectedOrderForTracking.captainName}</h5>
                        <span className="text-xs text-slate-500 font-semibold">فان الخدمة المجهزة NIXT-40</span>
                      </div>
                    </div>

                    <a
                      href={`tel:${selectedOrderForTracking.captainPhone || '966500000000'}`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>اتصال</span>
                    </a>
                  </div>
                )
              )}

              {/* Live Timeline */}
              <div className="space-y-4">
                <h5 className="text-xs font-black text-slate-900 pb-1 border-b border-slate-100">
                  مراحل مسار الطلب
                </h5>

                <div className="relative pr-6 space-y-5 before:absolute before:right-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedOrderForTracking.timeline.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-3">
                      <div
                        className={`absolute -right-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                          step.done ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-300 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold ${step.done ? 'text-slate-900 font-black' : 'text-slate-400'}`}>
                            {step.label}
                          </p>
                          <span className="text-[10px] text-slate-400">{step.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedOrderForTracking(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Tax Invoice Modal (Only visible when order.paymentStatus === 'paid') */}
      {/* ========================================================================= */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="text-base font-bold">فاتورة ضريبية مبسطة</h4>
              </div>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 text-xs text-slate-500">
              <p><strong className="text-slate-800 font-semibold">الرقم الضريبي لنيكست:</strong> 310000000000003</p>
              <p><strong className="text-slate-800 font-semibold">رقم الفاتورة:</strong> INV-{selectedInvoiceOrder.orderNumber}</p>
              <p><strong className="text-slate-800 font-semibold">حالة الفاتورة:</strong> <span className="text-emerald-600 font-bold">مدفوعة ومسددة ✓</span></p>
              <p><strong className="text-slate-800 font-semibold">التاريخ:</strong> {selectedInvoiceOrder.createdAt.split('T')[0]}</p>
              <p><strong className="text-slate-800 font-semibold">اسم العميل:</strong> {selectedInvoiceOrder.customerName}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-slate-900 border-b border-slate-200 pb-1">
                <span>البيان</span>
                <span>المبلغ</span>
              </div>
              <div className="flex justify-between font-normal">
                <span>{selectedInvoiceOrder.service?.title || 'مشتريات المتجر'}</span>
                <span>{selectedInvoiceOrder.subtotal.toFixed(2)} ر.س</span>
              </div>
              {selectedInvoiceOrder.addons && selectedInvoiceOrder.addons.map((add, idx) => (
                <div key={idx} className="flex justify-between text-slate-600 text-[11px] font-normal">
                  <span>{add.name} × {add.quantity || 1}</span>
                  <span>{(add.price * (add.quantity || 1)).toFixed(2)} ر.س</span>
                </div>
              ))}
              <div className="flex justify-between text-slate-500 font-normal">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span>{selectedInvoiceOrder.vatAmount.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between font-bold text-blue-700 text-sm pt-1 border-t border-slate-200">
                <span>المجموع النهائي:</span>
                <span>{selectedInvoiceOrder.totalAmount.toFixed(2)} ر.س</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة / حفظ PDF</span>
              </button>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-medium text-xs rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-right space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                هل أنت متأكد من إلغاء الطلب؟
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                {cancelModalOrder.type === 'service' || cancelModalOrder.type === 'package'
                  ? 'وفقاً لسياسة الإلغاء، يمكنك الإلغاء مجاناً حتى ساعة واحدة قبل الموعد. سيتم إعادة المبلغ المدفوع بالكامل إلى محفظتك الإلكترونية فوراً (أو استعادة غسلة الباقة).'
                  : 'سيتم إلغاء الطلب وإعادة المبلغ المدفوع كاملاً إلى محفظتك الإلكترونية.'}
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-bold flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-600 shrink-0" />
              <span>المبلغ المسترد: {cancelModalOrder.totalAmount.toFixed(2)} ر.س إلى المحفظة</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmCancel}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs transition-all"
              >
                تأكيد الإلغاء
              </button>
              <button
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Modal for Store Orders */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-right space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                طلب استرجاع منتجات المتجر
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                وفقاً لسياسة الإرجاع، يتم استرجاع قيمة المنتجات ({returnModalOrder.subtotal.toFixed(2)} ر.س) إلى محفظتك الإلكترونية مع خصم رسوم التوصيل إن وجدت.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">سبب الاسترجاع:</label>
              <select
                value={returnReason}
                onChange={e => setReturnReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="">اختر سبب الاسترجاع...</option>
                <option value="المنتج تالف أو غير مطابق">المنتج تالف أو غير مطابق للمواصفات</option>
                <option value="تم استلام منتج خاطئ">تم استلام منتج خاطئ</option>
                <option value="لم أعد بحاجة للمنتج">لم أعد بحاجة للمنتج (غير مستخدم بالتغليف الأصلي)</option>
                <option value="أخرى">أسباب أخرى</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const res = requestStoreOrderReturn(returnModalOrder.id, returnReason || 'طلب استرجاع من العميل');
                  setActionAlert({ message: res.message, isError: !res.success });
                  setReturnModalOrder(null);
                  setTimeout(() => setActionAlert(null), 4000);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs transition-all"
              >
                إرسال واسترجاع للمحفظة
              </button>
              <button
                onClick={() => setReturnModalOrder(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Dialog */}
      {ratingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-right space-y-4 animate-in zoom-in-95">
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                تقييم خدمة الكابتن
              </h4>
              <p className="text-xs text-slate-500">
                رأيك يساعدنا في الحفاظ على أعلى معايير الجودة والنظافة
              </p>
            </div>

            {/* Stars Selector */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setRatingStars(s)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      s <= ratingStars ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={ratingComment}
              onChange={e => setRatingComment(e.target.value)}
              placeholder="اكتب تعليقك هنا (اختياري)..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none resize-none h-20 bg-slate-50"
            />

            <div className="flex gap-2">
              <button
                onClick={handleSubmitRating}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-xs"
              >
                إرسال التقييم
              </button>
              <button
                onClick={() => setRatingOrder(null)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
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

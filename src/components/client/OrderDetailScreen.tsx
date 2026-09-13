import React, { useState } from 'react';
import { useApp, CARPET_ORDER_STAGES } from '../../context/AppContext';
import { ServiceOrder, OrderStatus, AddonProduct } from '../../types';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  ChevronLeft,
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
  Package,
  Share2,
  Copy,
  RotateCcw,
  MessageSquare,
  ExternalLink,
  Camera,
  CheckCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const OrderDetailScreen: React.FC = () => {
  const {
    orders,
    selectedOrderForDetail,
    setSelectedOrderForDetail,
    closeOrderDetail,
    setCurrentScreen,
    setSelectedOrderForTracking,
    cancelOrder,
    rateOrder,
    confirmCarpetInspection,
    adjustCarpetInspection,
    payCarpetOrder,
    updateCarpetOrderStatus,
    walletBalance,
    requestStoreOrderReturn,
    openBookingModal,
    setSelectedCar,
    setSelectedAddress
  } = useApp();

  // Find the live order object to ensure reactivity
  const currentOrder: ServiceOrder | null = selectedOrderForDetail
    ? orders.find(o => o.id === selectedOrderForDetail.id) || selectedOrderForDetail
    : orders[0] || null;

  // Local state for modals & actions
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [actionAlert, setActionAlert] = useState<{ message: string; isError: boolean } | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [showDetailedTimeline, setShowDetailedTimeline] = useState(false);

  // Carpet Payment Modal state
  const [showCarpetPayModal, setShowCarpetPayModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'moyasar_card' | 'wallet' | 'tabby' | 'tamara'>('moyasar_card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Captain Simulator Modal state (for testing and demoing carpet & order flows)
  const [showCaptainModal, setShowCaptainModal] = useState(false);
  const [captainAdjustMode, setCaptainAdjustMode] = useState(false);
  const [tempAdjustAddons, setTempAdjustAddons] = useState<AddonProduct[]>([]);
  const [adjustNotes, setAdjustNotes] = useState('');

  if (!currentOrder) {
    return (
      <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs text-right" dir="rtl">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h4 className="text-lg font-bold text-slate-900">لم يتم العثور على تفاصيل هذا الطلب</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          قد يكون الطلب قد تم حذفه أو أن المعرف غير متوفر حالياً.
        </p>
        <button
          onClick={closeOrderDetail}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع إلى قائمة الطلبات</span>
        </button>
      </div>
    );
  }

  const isCarpet =
    currentOrder.isCarpetService ||
    currentOrder.service?.category === 'carpets' ||
    currentOrder.service?.category === 'carpets_furniture' ||
    currentOrder.service?.category === 'furniture';
  const isUnpaidCarpet = isCarpet && currentOrder.paymentStatus === 'pending';
  const canPayCarpet = isUnpaidCarpet && (currentOrder.inspectionStatus === 'confirmed' || currentOrder.inspectionStatus === 'adjusted');
  const isInspectionPending = isUnpaidCarpet && currentOrder.inspectionStatus === 'pending_inspection';

  const handleCopyOrderNumber = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentOrder.orderNumber);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2500);
    }
  };

  const handleConfirmCancel = () => {
    const res = cancelOrder(currentOrder.id);
    setActionAlert({ message: res.message, isError: !res.success });
    setShowCancelModal(false);
    setTimeout(() => setActionAlert(null), 4000);
  };

  const handleSubmitRating = () => {
    rateOrder(currentOrder.id, ratingStars, ratingComment);
    setShowRatingModal(false);
    setRatingComment('');
    setActionAlert({ message: 'شكراً لك! تم تسجيل تقييمك بنجاح.', isError: false });
    setTimeout(() => setActionAlert(null), 3000);
  };

  const handleExecutePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      payCarpetOrder(currentOrder.id, selectedPaymentMethod);
      setIsProcessingPayment(false);
      setShowCarpetPayModal(false);
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

  const openCaptainSimulator = () => {
    setTempAdjustAddons(
      currentOrder.addons && currentOrder.addons.length > 0
        ? JSON.parse(JSON.stringify(currentOrder.addons))
        : []
    );
    setAdjustNotes(currentOrder.inspectionNotes || '');
    setCaptainAdjustMode(false);
    setShowCaptainModal(true);
  };

  const handleAdvanceCaptainStatus = (targetStatus: OrderStatus) => {
    const stagesRequiringPayment: OrderStatus[] = [
      'carpet_delivered_to_laundry',
      'carpet_received_from_laundry',
      'carpet_on_the_way_delivery',
      'completed'
    ];
    if (stagesRequiringPayment.includes(targetStatus) && currentOrder.paymentStatus !== 'paid') {
      setActionAlert({
        message: '🔒 تنبيه أمني: لا يمكن تحويل الحالة إلى (في الطريق للعميل للتسليم) أو تسليم المغسلة حتى يتم تأكيد سداد العميل وإتمام الدفع أولاً.',
        isError: true
      });
      setTimeout(() => setActionAlert(null), 5000);
      return;
    }

    updateCarpetOrderStatus(currentOrder.id, targetStatus);
    const stageLabel = CARPET_ORDER_STAGES.find(s => s.status === targetStatus)?.label || targetStatus;
    setActionAlert({ message: `✅ تم تغيير حالة الطلب إلى: "${stageLabel}"`, isError: false });
    setTimeout(() => setActionAlert(null), 4000);
  };

  const handleCaptainConfirmSizes = () => {
    confirmCarpetInspection(currentOrder.id);
    setActionAlert({
      message: '✅ تم تأكيد المقاسات وتغيير الحالة إلى "تم الاستلام من العميل" وتفعيل زر الدفع للعميل.',
      isError: false
    });
    setTimeout(() => setActionAlert(null), 4000);
  };

  const handleCaptainSaveAdjustments = () => {
    if (!adjustNotes.trim()) {
      alert('يرجى كتابة سبب أو وصف لتعديل المقاسات والسعر لإشعار العميل به');
      return;
    }
    adjustCarpetInspection(currentOrder.id, tempAdjustAddons, adjustNotes);
    setActionAlert({
      message: '⚠️ تم تعديل المقاسات وإعادة احتساب السعر وإشعار العميل لإتمام الدفع.',
      isError: false
    });
    setCaptainAdjustMode(false);
    setTimeout(() => setActionAlert(null), 4000);
  };

  const handleReorder = () => {
    if (currentOrder.type === 'service' && currentOrder.service) {
      if (currentOrder.car) setSelectedCar(currentOrder.car);
      if (currentOrder.address) setSelectedAddress(currentOrder.address);
      openBookingModal(currentOrder.service);
    } else if (currentOrder.type === 'store') {
      setCurrentScreen('store');
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    if (currentOrder.type === 'store') {
      switch (status) {
        case 'created':
        case 'confirmed':
          return (
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              تم تأكيد الطلب
            </span>
          );
        case 'in_progress':
          return (
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-600" />
              جاري تجهيز الشحنة
            </span>
          );
        case 'on_the_way':
          return (
            <span className="bg-purple-100 text-purple-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-purple-600" />
              في طريق التوصيل 🚚
            </span>
          );
        case 'completed':
          return (
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              تم التوصيل بنجاح ✓
            </span>
          );
        case 'return_requested':
          return (
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              طلب استرجاع قيد المعالجة
            </span>
          );
        case 'returned':
          return (
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              تم استرجاع المبلغ للمحفظة
            </span>
          );
        case 'cancelled':
          return (
            <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
              ملغي ومسترد
            </span>
          );
        default:
          break;
      }
    }

    if (isCarpet) {
      switch (status) {
        case 'confirmed':
        case 'created':
          return (
            <span className="bg-blue-100 text-blue-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              تم تأكيد الطلب
            </span>
          );
        case 'on_the_way':
          return (
            <span className="bg-amber-100 text-amber-900 text-xs font-black px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              في الطريق
            </span>
          );
        case 'arrived':
          return (
            <span className="bg-purple-100 text-purple-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-600" />
              تم وصول المندوب
            </span>
          );
        case 'carpet_received_from_client':
          if (currentOrder.paymentStatus === 'pending') {
            if (currentOrder.inspectionStatus === 'adjusted') {
              return (
                <span className="bg-purple-100 text-purple-950 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
                  تم الاستلام من العميل (تعديل مقاسات - بانتظار الدفع)
                </span>
              );
            }
            return (
              <span className="bg-indigo-100 text-indigo-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                تم الاستلام من العميل (بانتظار الدفع)
              </span>
            );
          }
          return (
            <span className="bg-indigo-100 text-indigo-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              تم الاستلام من العميل (مدفوع)
            </span>
          );
        case 'carpet_delivered_to_laundry':
          return (
            <span className="bg-sky-100 text-sky-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              تم تسليم لمغسلة
            </span>
          );
        case 'carpet_received_from_laundry':
          return (
            <span className="bg-teal-100 text-teal-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              تم الاستلام من المغسلة
            </span>
          );
        case 'carpet_on_the_way_delivery':
          return (
            <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              في الطريق للعميل للتسليم
            </span>
          );
        case 'completed':
          return (
            <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              مكتمل ✓
            </span>
          );
        case 'cancelled':
          return (
            <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
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
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">تم التأكيد</span>;
      case 'assigned':
        return <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">مسند لكابتن</span>;
      case 'on_the_way':
        return <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse">الكابتن في الطريق</span>;
      case 'arrived':
        return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">وصل الموقع</span>;
      case 'in_progress':
        return <span className="bg-yellow-100 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse">جاري التنفيذ والغسيل</span>;
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">مكتمل</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">ملغي ومسترد</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-24 text-right animate-in fade-in duration-300" dir="rtl">
      {/* Alert toast notification */}
      {actionAlert && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in ${
            actionAlert.isError
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <span>{actionAlert.message}</span>
          <button onClick={() => setActionAlert(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Navigation Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={closeOrderDetail}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-2xs group cursor-pointer"
              title="الرجوع لقائمة الطلبات"
            >
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              <span>الرجوع لجميع الطلبات</span>
            </button>

            <span className="text-xs text-slate-400 font-medium hidden sm:inline">|</span>
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
              سجل الطلبات / تفاصيل الطلب
            </span>
          </div>

          {currentOrder.paymentStatus === 'paid' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all"
                title="عرض الفاتورة الضريبية"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الفاتورة</span>
              </button>
            </div>
          )}

        </div>

        {/* Order Main Header Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900">
                طلب #{currentOrder.orderNumber}
              </h1>

              {isCarpet && (
                <span className="bg-amber-100 text-amber-950 text-xs font-black px-3 py-1 rounded-full">
                  غسيل سجاد ومفروشات
                </span>
              )}

              {currentOrder.type === 'store' && (
                <span className="bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">
                  طلب متجر
                </span>
              )}

              {getStatusBadge(currentOrder.status)}
            </div>

            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-3 pt-0.5">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                تاريخ التنفيذ: {currentOrder.date}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                الوقت: {currentOrder.timeSlot}
              </span>
              <span className="text-slate-400">
                تاريخ الإنشاء: {currentOrder.createdAt ? currentOrder.createdAt.split('T')[0] : '--'}
              </span>
            </p>
          </div>

          {/* Amount & Payment Status Pill */}
          <div className="bg-slate-50 sm:bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between sm:justify-end gap-5 shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block font-medium">المبلغ الإجمالي:</span>
              <div className="text-xl font-black text-blue-700 leading-tight">
                {currentOrder.totalAmount.toFixed(2)} ر.س
              </div>
            </div>

            <div className="border-r border-slate-200 pr-4 text-right">
              <span className="text-[11px] text-slate-500 block font-medium">حالة السداد:</span>
              {currentOrder.paymentStatus === 'paid' ? (
                <span className="text-xs font-black text-emerald-700 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  مدفوع بالكامل ✓
                </span>
              ) : (
                <span className="text-xs font-black text-amber-700 inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  بانتظار السداد
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Carpet Policy Status Banners (Rule 1, 2, 3) */}
      {isCarpet && (
        <div className="space-y-3">
          {/* A: Pending Captain Inspection */}
          {isInspectionPending && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-amber-950 space-y-2 shadow-xs">
              <div className="flex items-center justify-between font-black text-sm text-amber-900">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                  <span>بانتظار معاينة ومراجعة المقاسات من قِبل الكابتن الميداني</span>
                </div>
                <span className="text-[11px] bg-amber-200 text-amber-900 px-3 py-1 rounded-full font-bold">
                  زر الدفع قيد التفعيل
                </span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                📌 <strong>سياسة غسيل السجاد والمفروشات:</strong> زر إتمام الدفع يكون غير مفعّل حتى يقوم الكابتن بزيارة الموقع ومعاينة مساحات السجاد والتأكد من المقاسات المسجلة. الفاتورة الضريبية تتاح فور إتمام السداد.
              </p>
            </div>
          )}

          {/* B: Confirmed Sizes by Captain */}
          {isUnpaidCarpet && currentOrder.inspectionStatus === 'confirmed' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-emerald-950 space-y-3 shadow-xs">
              <div className="flex items-center justify-between font-black text-sm text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>تمت مراجعة المقاسات وتأكيد مطابقتها بواسطة الكابتن ✓</span>
                </div>
                <span className="text-[11px] bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full font-bold">
                  جاهز للدفع الآن
                </span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                ✨ تمت المعاينة الميدانية بنجاح وتأكيد السعر النهائي. يرجى الضغط على زر <strong>"إتمام الدفع"</strong> أدناه لتأكيد الفاتورة وبدء دورة الغسيل والتطهير الشامل.
              </p>
              <button
                onClick={() => setShowCarpetPayModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>إتمام الدفع الآن ({currentOrder.totalAmount.toFixed(2)} ر.س)</span>
              </button>
            </div>
          )}

          {/* C: Adjusted Sizes by Captain */}
          {isUnpaidCarpet && currentOrder.inspectionStatus === 'adjusted' && (
            <div className="bg-purple-50 border border-purple-200 rounded-3xl p-5 text-purple-950 space-y-3 shadow-xs">
              <div className="flex items-center justify-between font-black text-sm text-purple-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-purple-600" />
                  <span>تم تعديل المقاسات وإعادة احتساب السعر بواسطة الكابتن</span>
                </div>
                <span className="text-[11px] bg-purple-200 text-purple-900 px-3 py-1 rounded-full font-bold">
                  تحديث السعر
                </span>
              </div>
              <div className="bg-white/90 p-3.5 rounded-2xl border border-purple-100 space-y-2 text-xs">
                <p className="text-slate-800 leading-relaxed">
                  <strong>سبب التغيير الموضح من الكابتن:</strong> {currentOrder.inspectionNotes || 'اختلاف في مساحة السجاد عند القياس الميداني'}
                </p>
                <div className="flex items-center justify-between text-purple-900 font-black pt-2 border-t border-purple-100">
                  <span>المبلغ الإجمالي الجديد المطلوب:</span>
                  <span className="text-base text-blue-700 font-extrabold">{currentOrder.totalAmount.toFixed(2)} ر.س (شامل الضريبة)</span>
                </div>
              </div>
              <button
                onClick={() => setShowCarpetPayModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>سداد المبلغ المعدل ({currentOrder.totalAmount.toFixed(2)} ر.س)</span>
              </button>
            </div>
          )}

          {/* D: Paid Banner */}
          {isCarpet && currentOrder.paymentStatus === 'paid' && (
            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-4 text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 font-bold">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                <span>تم سداد الفاتورة بنجاح — الفاتورة الضريبية الرسمية متاحة الآن للتحميل والطباعة.</span>
              </div>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all inline-flex items-center justify-center gap-1.5 shrink-0"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>عرض الفاتورة الضريبية</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Visual Lifecycle Stepper / Progress Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                مراحل مسار وتتبع الطلب
              </h3>
              <p className="text-[11px] text-slate-400">
                تحديثات فورية خطوة بخطوة حتى اكتمال الخدمة وتسليمها بنجاح
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Milestone Tracker */}
        {currentOrder.timeline && currentOrder.timeline.length > 0 && (() => {
          const timelineSteps = currentOrder.timeline;
          const completedCount = timelineSteps.filter(s => s.done).length;
          const activeStepIndex = timelineSteps.findIndex(s => !s.done) !== -1
            ? timelineSteps.findIndex(s => !s.done)
            : timelineSteps.length - 1;

          return (
            <div className="space-y-4">
              <div className="overflow-x-auto pb-3 pt-2 -mx-2 px-2 scrollbar-none">
                <div className="flex items-start min-w-[580px] sm:min-w-0 justify-between relative">
                  {/* Background Track Line */}
                  <div className="absolute top-4 right-6 left-6 h-1 bg-slate-100 rounded-full -z-0" />
                  {/* Active Progress Fill */}
                  <div
                    className="absolute top-4 right-6 h-1 bg-emerald-500 rounded-full transition-all duration-500 -z-0"
                    style={{
                      width: `${
                        timelineSteps.length > 1
                          ? (Math.max(0, completedCount - 1) / (timelineSteps.length - 1)) * 100
                          : 0
                      }%`
                    }}
                  />

                  {timelineSteps.map((step, idx) => {
                    const isDone = step.done;
                    const isActive = idx === activeStepIndex && !isDone;

                    return (
                      <div key={idx} className="flex flex-col items-center text-center relative z-10 px-1 flex-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ring-4 ring-white ${
                            isDone
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : isActive
                              ? 'bg-blue-600 text-white ring-blue-100 animate-pulse'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          {isDone ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <span className="text-[11px]">{idx + 1}</span>
                          )}
                        </div>
                        <span
                          className={`text-xs mt-2 font-bold max-w-[100px] line-clamp-2 leading-tight ${
                            isDone
                              ? 'text-slate-800'
                              : isActive
                              ? 'text-blue-700 font-black'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        {step.time && step.time !== '--' && (
                          <span className="text-[10px] font-mono text-slate-400 mt-1">
                            {step.time}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status footer bar */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">المرحلة الحالية:</span>
                <span className="font-black text-blue-900 bg-blue-50 border border-blue-100 px-3 py-1 rounded-xl">
                  {timelineSteps[activeStepIndex]?.label || 'قيد المتابعة'}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Main Responsive Grid Layout (Main Content 8 cols + Sidebar 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* MAIN COLUMN (8 cols): Service Details + Unified Execution (Location & Captain) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Service / Ordered Items Information */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  {currentOrder.type === 'store' ? <ShoppingBag className="w-5 h-5" /> : <CarIcon className="w-5 h-5" />}
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  {currentOrder.type === 'store' ? 'المنتجات المطلوبة من المتجر' : 'تفاصيل الخدمة المطلوبة'}
                </h3>
              </div>
            </div>

            {/* Service details for car wash */}
            {currentOrder.service && (
              <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/70 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {currentOrder.service.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {currentOrder.service.description}
                    </p>
                  </div>
                  <div className="text-right sm:text-left shrink-0 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[11px] text-slate-400 block font-medium">سعر الخدمة:</span>
                    <span className="text-base font-black text-blue-700">
                      {currentOrder.service.price.toFixed(2)} ر.س
                    </span>
                  </div>
                </div>

                {currentOrder.service.includes && currentOrder.service.includes.length > 0 && (
                  <div className="pt-3 border-t border-slate-200/60 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 block">تشمل الخدمة:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      {currentOrder.service.includes.map((inc, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1.5 rounded-lg border border-slate-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-medium">{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Car Information Card if car service */}
            {currentOrder.car && (
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
                    <CarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-600 font-bold block">المركبة المسجلة للغسيل</span>
                    <h5 className="text-sm font-black text-slate-900">
                      {currentOrder.car.brand} {currentOrder.car.model}
                    </h5>
                    <span className="text-xs text-slate-500 font-semibold">
                      اللون: {currentOrder.car.color}
                    </span>
                  </div>
                </div>

                {/* Saudi License Plate Badge */}
                <div className="bg-white border-2 border-slate-800 rounded-xl px-4 py-1.5 flex items-center gap-3 shadow-2xs self-start sm:self-auto">
                  <div className="text-center font-black text-slate-900 text-sm tracking-widest font-mono" dir="ltr">
                    {currentOrder.car.plateNumber}
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">KSA</span>
                </div>
              </div>
            )}

            {/* Carpet Items Breakdown */}
            {isCarpet && currentOrder.addons && currentOrder.addons.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-black text-slate-800 block">
                  قطع السجاد والمفروشات المسجلة:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentOrder.addons.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                          <Ruler className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{item.name}</span>
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {item.price.toFixed(2)} ر.س للقطعة
                          </span>
                        </div>
                      </div>
                      <span className="bg-white font-black text-blue-700 px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
                        الكمية: {item.quantity || 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Store Products List */}
            {currentOrder.type === 'store' && currentOrder.storeItems && currentOrder.storeItems.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-black text-slate-800 block">
                  قائمة منتجات المتجر بالطلب:
                </span>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl px-3 bg-slate-50/50">
                  {currentOrder.storeItems.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          {item.product.image ? (
                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.product.name}</p>
                          <span className="text-[11px] text-slate-500">
                            {item.product.price.toFixed(2)} ر.س × {item.quantity || 1}
                          </span>
                        </div>
                      </div>
                      <span className="font-black text-slate-900 text-sm">
                        {((item.product.price || 0) * (item.quantity || 1)).toFixed(2)} ر.س
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Notes */}
            {currentOrder.notes && (
              <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl text-xs space-y-1">
                <span className="font-black text-amber-950 block">ملاحظات العميل الخاصة:</span>
                <p className="text-amber-900 leading-relaxed font-normal">{currentOrder.notes}</p>
              </div>
            )}
          </div>

          {/* Card 2: Unified Execution & Delivery Card (Location & Captain Side-by-Side) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    بيانات التنفيذ والتوصيل
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    موقع تقديم الخدمة وفريق العمل الميداني المعتمد
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Execution Sub-card 1: Location & Address */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>موقع تقديم الخدمة</span>
                  </span>
                  {currentOrder.address.shortAddress && (
                    <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg" dir="ltr">
                      {currentOrder.address.shortAddress}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    {currentOrder.address.name} ({currentOrder.address.city} - حي {currentOrder.address.district})
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    {currentOrder.address.fullAddress}
                  </p>
                </div>
              </div>

              {/* Execution Sub-card 2: Assigned Captain */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 flex flex-col justify-center">
                {currentOrder.captainName ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-indigo-600" />
                        <span>الكابتن المعتمد</span>
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>5.0 كابتن معتمد</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-black flex items-center justify-center text-base shadow-xs shrink-0">
                        {currentOrder.captainName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-900 truncate">{currentOrder.captainName}</h4>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                          فان الخدمة المتنقلة المجهزة NIXT-40
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-3 space-y-1.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-700">جاري تعيين الكابتن المناسب</h4>
                    <p className="text-[11px] text-slate-400">
                      سيتم إشعارك فور إسناد الطلب وتأكيد انطلاق الفان المتنقلة.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR COLUMN (4 cols): Financial Summary + Available Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 3: Financial Summary Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  الحساب المالي والفاتورة
                </h3>
              </div>
              {currentOrder.paymentStatus === 'paid' && (
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-slate-900">{currentOrder.subtotal.toFixed(2)} ر.س</span>
              </div>

              {currentOrder.deliveryFee > 0 && (
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>رسوم التوصيل:</span>
                  <span className="font-bold text-slate-900">{currentOrder.deliveryFee.toFixed(2)} ر.س</span>
                </div>
              )}

              {currentOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>خصم كوبون التوفير:</span>
                  <span>-{currentOrder.discountAmount.toFixed(2)} ر.س</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 font-medium">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span className="font-bold text-slate-900">{currentOrder.vatAmount.toFixed(2)} ر.س</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                <span className="text-slate-900">المبلغ الإجمالي:</span>
                <span className="text-xl text-blue-700 font-black">{currentOrder.totalAmount.toFixed(2)} ر.س</span>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 bg-slate-50/80 p-3 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span>طريقة السداد:</span>
                  <span className="font-bold text-slate-800">
                    {currentOrder.paymentMethod === 'wallet' && 'محفظة نيكست الرقمية'}
                    {currentOrder.paymentMethod === 'moyasar_card' && 'بطاقة مدى / ائتمان / Apple Pay'}
                    {currentOrder.paymentMethod === 'tabby' && 'أقساط تابي'}
                    {currentOrder.paymentMethod === 'tamara' && 'أقساط تمارا'}
                    {currentOrder.paymentMethod === 'mixed' && 'محفظة + بطاقة'}
                    {currentOrder.paymentMethod === 'package' && 'غسلة باقة اشتراك'}
                    {currentOrder.paymentMethod === 'cash' && 'دفع عند الاستلام'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>حالة الدفع:</span>
                  <span className={currentOrder.paymentStatus === 'paid' ? 'font-bold text-emerald-700' : 'font-bold text-amber-700'}>
                    {currentOrder.paymentStatus === 'paid' ? 'تم الدفع بنجاح ✓' : 'بانتظار السداد'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: ALL USER ACTIONS CARD */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                الإجراءات المتاحة للطلب
              </h3>
            </div>

            <div className="space-y-2.5">
              {/* Action 1: Complete Payment Button (Rule 2 & 3: Pay first) */}
              {isUnpaidCarpet && (
                canPayCarpet ? (
                  <button
                    onClick={() => setShowCarpetPayModal(true)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 animate-pulse cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>إتمام الدفع ({currentOrder.totalAmount.toFixed(2)} ر.س)</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-slate-100 text-slate-400 font-bold text-xs py-3 px-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 border border-slate-200"
                    title="الزر غير مفعّل حالياً — بانتظار قيام الكابتن بمعاينة السجاد وتأكيد المقاسات"
                  >
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>إتمام الدفع (غير مفعّل حتى معاينة الكابتن)</span>
                  </button>
                )
              )}

              {/* Action 2: Tax Invoice (Rule 1 & 5: Available after payment) */}
              {currentOrder.paymentStatus === 'paid' ? (
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>عرض وطباعة الفاتورة الضريبية</span>
                </button>
              ) : (
                <div
                  className="w-full bg-slate-100 text-slate-400 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-dashed border-slate-200 cursor-not-allowed select-none"
                  title="الفاتورة الضريبية تتاح فور إتمام السداد"
                >
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>الفاتورة الضريبية (تتاح بعد الدفع)</span>
                </div>
              )}

              {/* Action 4: Re-order / Book again */}
              <button
                onClick={handleReorder}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>إعادة حجز نفس الخدمة</span>
              </button>

              {/* Action 5: Rate Order */}
              {currentOrder.status === 'completed' && !currentOrder.rating && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs py-2.5 px-4 rounded-xl border border-amber-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>تقييم مستوى الخدمة</span>
                </button>
              )}

              {/* Action 6: Return request for completed store orders */}
              {currentOrder.type === 'store' && currentOrder.status === 'completed' && (
                <button
                  onClick={() => {
                    setReturnReason('');
                    setShowReturnModal(true);
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  title="طلب استرجاع المنتجات خلال 3 أيام"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-500" />
                  <span>طلب استرجاع المنتجات</span>
                </button>
              )}

              {/* Action 7: Cancel Order */}
              {['created', 'confirmed', 'assigned'].includes(currentOrder.status) && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-bold py-2.5 px-4 rounded-xl border border-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>إلغاء الطلب واسترداد المبلغ</span>
                </button>
              )}

              {/* Action 8: Captain Testing Simulator (for testing carpet rules) */}
              {isCarpet && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={openCaptainSimulator}
                    className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs py-2.5 px-4 rounded-xl border border-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    title="محاكاة إجراءات الكابتن ومعاينة السجاد لتجربة النظام"
                  >
                    <User className="w-4 h-4 text-indigo-600" />
                    <span>إجراءات الكابتن الميداني 👨‍✈️ (تجربة)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CARPET PAYMENT MODAL */}
      {/* ========================================================================= */}
      {showCarpetPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">إتمام سداد طلب السجاد</h4>
                  <span className="text-[11px] text-slate-400 font-normal">
                    طلب رقم #{currentOrder.orderNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowCarpetPayModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {currentOrder.inspectionStatus === 'adjusted' && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 space-y-1 text-xs text-purple-950">
                <div className="flex items-center gap-1.5 font-black text-purple-900">
                  <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>تنبيه: تم تعديل السعر بعد المعاينة الميدانية</span>
                </div>
                <p className="text-[11px] text-purple-800">
                  <strong>ملاحظة الكابتن:</strong> {currentOrder.inspectionNotes}
                </p>
              </div>
            )}

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <span className="font-black text-slate-800 block pb-1 border-b border-slate-200">
                تفاصيل السجاد المعتمد للغسيل:
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {currentOrder.addons.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-700">
                    <span className="font-semibold">{item.name} × {item.quantity || 1}</span>
                    <span className="font-black text-slate-900">{(item.price * (item.quantity || 1)).toFixed(2)} ر.س</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{currentOrder.subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span>{currentOrder.vatAmount.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between font-black text-base text-blue-700 pt-1 border-t border-slate-200">
                  <span>الإجمالي المطلوب سداده:</span>
                  <span>{currentOrder.totalAmount.toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 text-xs">
              <span className="font-black text-slate-800 block">اختر وسيلة الدفع:</span>
              <div className="grid grid-cols-1 gap-2">
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
                        ادفع {(currentOrder.totalAmount / 4).toFixed(2)} ر.س اليوم والباقي لاحقاً
                      </span>
                    </div>
                  </div>
                  {selectedPaymentMethod === 'tabby' && <Check className="w-4 h-4 text-emerald-600" />}
                </button>

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
                    <span>تأكيد ودفع {currentOrder.totalAmount.toFixed(2)} ر.س</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowCarpetPayModal(false)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CAPTAIN INSPECTION & WORKFLOW SIMULATOR */}
      {/* ========================================================================= */}
      {showCaptainModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-right space-y-5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
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
                    طلب غسيل سجاد #{currentOrder.orderNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowCaptainModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">الحالة الحالية للطلب:</span>
                <span className="text-sm font-bold text-amber-400">
                  {CARPET_ORDER_STAGES.find(s => s.status === currentOrder.status)?.label || currentOrder.status}
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-bold">حالة الدفع:</span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                  currentOrder.paymentStatus === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {currentOrder.paymentStatus === 'paid' ? 'مدفوع ✓' : 'بانتظار الدفع'}
                </span>
              </div>
            </div>

            {/* Stages Selector */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>مراحل طلب غسيل السجاد (8 مراحل):</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {CARPET_ORDER_STAGES.map((stg, i) => {
                  const isCurrent = currentOrder.status === stg.status;
                  const isDone = (currentOrder.timeline || []).some(t => t.status === stg.status && t.done);
                  const isPostPickup = ['carpet_delivered_to_laundry', 'carpet_received_from_laundry', 'carpet_on_the_way_delivery', 'completed'].includes(stg.status);
                  const isLocked = isPostPickup && currentOrder.paymentStatus !== 'paid';

                  return (
                    <button
                      key={stg.status}
                      type="button"
                      onClick={() => handleAdvanceCaptainStatus(stg.status)}
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

            {!captainAdjustMode ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-black text-slate-800 border-b border-slate-200 pb-2">
                    <span>قطع السجاد المسجلة بالطلب:</span>
                    <span>الإجمالي الحالي: {currentOrder.totalAmount.toFixed(2)} ر.س</span>
                  </div>
                  <div className="space-y-2">
                    {currentOrder.addons.map((item, idx) => (
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

                {currentOrder.paymentStatus === 'pending' && (
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
              </div>
            ) : (
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
      {/* MODAL 3: TAX INVOICE MODAL */}
      {/* ========================================================================= */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="text-base font-bold">فاتورة ضريبية مبسطة (معتمدة ZATCA)</h4>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 text-xs text-slate-500">
              <p><strong className="text-slate-800 font-semibold">الرقم الضريبي لنيكست:</strong> 310000000000003</p>
              <p><strong className="text-slate-800 font-semibold">رقم الفاتورة:</strong> INV-{currentOrder.orderNumber}</p>
              <p><strong className="text-slate-800 font-semibold">حالة الفاتورة:</strong> <span className="text-emerald-600 font-bold">مدفوعة ومسددة بالكامل ✓</span></p>
              <p><strong className="text-slate-800 font-semibold">تاريخ الإصدار:</strong> {currentOrder.createdAt ? currentOrder.createdAt.split('T')[0] : currentOrder.date}</p>
              <p><strong className="text-slate-800 font-semibold">اسم العميل:</strong> {currentOrder.customerName}</p>
              <p><strong className="text-slate-800 font-semibold">رقم الجوال:</strong> {currentOrder.customerPhone}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-slate-900 border-b border-slate-200 pb-1">
                <span>البيان</span>
                <span>المبلغ</span>
              </div>
              <div className="flex justify-between font-normal">
                <span>{currentOrder.service?.title || 'مشتريات المتجر'}</span>
                <span>{currentOrder.subtotal.toFixed(2)} ر.س</span>
              </div>
              {currentOrder.addons && currentOrder.addons.map((add, idx) => (
                <div key={idx} className="flex justify-between text-slate-600 text-[11px] font-normal">
                  <span>{add.name} × {add.quantity || 1}</span>
                  <span>{(add.price * (add.quantity || 1)).toFixed(2)} ر.س</span>
                </div>
              ))}
              <div className="flex justify-between text-slate-500 font-normal">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span>{currentOrder.vatAmount.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between font-bold text-blue-700 text-sm pt-1 border-t border-slate-200">
                <span>المجموع النهائي المسدد:</span>
                <span>{currentOrder.totalAmount.toFixed(2)} ر.س</span>
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
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-medium text-xs rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CANCELLATION CONFIRMATION */}
      {/* ========================================================================= */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-right space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                هل أنت متأكد من رغبتك في إلغاء الطلب؟
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                {currentOrder.type === 'service' || currentOrder.type === 'package'
                  ? 'يمكنك الإلغاء مجاناً قبل موعد الزيارة بساعة. سيتم استرداد المبلغ كاملاً إلى محفظتك الرقمية فوراً.'
                  : 'سيتم إلغاء طلب المتجر وإعادة المبلغ المدفوع كاملاً إلى محفظتك الإلكترونية.'}
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-bold flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-600 shrink-0" />
              <span>المبلغ المسترد: {currentOrder.totalAmount.toFixed(2)} ر.س إلى المحفظة فوراً</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmCancel}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs transition-all"
              >
                تأكيد الإلغاء
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: RETURN REQUEST MODAL FOR STORE ORDERS */}
      {/* ========================================================================= */}
      {showReturnModal && (
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
                وفقاً لسياسة الإرجاع، يتم استرجاع قيمة المنتجات ({currentOrder.subtotal.toFixed(2)} ر.س) إلى محفظتك الإلكترونية مع خصم رسوم التوصيل إن وجدت.
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
                  const res = requestStoreOrderReturn(currentOrder.id, returnReason || 'طلب استرجاع من العميل');
                  setActionAlert({ message: res.message, isError: !res.success });
                  setShowReturnModal(false);
                  setTimeout(() => setActionAlert(null), 4000);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-xs transition-all"
              >
                إرسال واسترجاع للمحفظة
              </button>
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: RATING MODAL */}
      {/* ========================================================================= */}
      {showRatingModal && (
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
                onClick={() => setShowRatingModal(false)}
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

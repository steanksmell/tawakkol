// pages/Checkout.jsx - ENTERPRISE PROFESSIONAL EDITION v2.0 with i18n
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Container, Grid, Typography, Button, Paper, TextField,
  Divider, IconButton, Avatar, Chip, Snackbar, Alert,
  Breadcrumbs, Link, alpha, CircularProgress, LinearProgress,
  Badge, Tooltip, Zoom, Fade, Collapse,
  useTheme, useMediaQuery
} from '@mui/material';
import {
  ArrowBack, Add, Remove, Delete, ShoppingBag,
  LocalShipping, Check, Send, Person, Email,
  Phone, LocationOn, Notes, ShoppingCartOutlined,
  Lock, VerifiedUser, Payment, Receipt, ArrowForward,
  Security, Speed, SupportAgent, Inventory2,
  CheckCircle, ChevronRight, TrendingUp, Shield,
  Star, LocalOffer, Error,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/api';

// ==================== DARK PREMIUM DESIGN SYSTEM ====================
const DesignSystem = {
  colors: {
    bg: '#ffffff',
    bgCard: '#141414',
    bgField: '#1A1A1A',
    bgFieldFocus: '#242424',
    border: '#2A2A2A',
    borderFocus: '#0080ff',
    borderError: '#FF4444',
    borderSuccess: '#22C55E',
    text: '#000000',
    textMuted: '#8A8A8A',
    textPlaceholder: '#4A4A4A',
    accent: '#0080ff',
    accentDark: '#007acc',
    error: '#FF4444',
    success: '#22C55E',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  typography: {
    display: '"Barlow Condensed", "Arial Black", sans-serif',
    body: '"DM Sans", "Inter", sans-serif',
    mono: '"JetBrains Mono", monospace',
    ar: '"Noto Kufi Arabic", "Tajawal", sans-serif',
  },
  borderRadius: { sm: 6, md: 10, lg: 14, xl: 20, full: 999 },
  shadows: {
    subtle: '0 1px 2px rgba(0,0,0,0.3)',
    card: '0 2px 8px rgba(0,0,0,0.4)',
    elevated: '0 4px 16px rgba(0,0,0,0.5)',
    floating: '0 8px 32px rgba(0,0,0,0.6)',
    glow: (color) => `0 0 20px ${color}20`,
  },
};

// ==================== SHIPPING CONSTANTS ====================
const SHIPPING_COST = 9;
const FREE_SHIPPING_THRESHOLD = 200;

// ==================== FORM CONFIGURATION ====================
const getFormFields = (t) => [
  { name: 'fullName', label: t('checkout.fullName', 'Full Name'), icon: Person, placeholder: 'John Doe', grid: { xs: 12, sm: 6 }, validation: { required: t('checkout.validation.nameRequired', 'Full name is required'), minLength: { value: 3, message: t('checkout.validation.nameMinLength', 'At least 3 characters') } } },
  { name: 'email', label: t('checkout.email', 'Email Address (Optional)'), icon: Email, type: 'email', placeholder: 'you@example.com', grid: { xs: 12, sm: 6 }, required: false, validation: { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('checkout.validation.emailInvalid', 'Invalid email format') } } },
  { name: 'phone', label: t('checkout.phone', 'Phone Number'), icon: Phone, type: 'tel', placeholder: '+216 XX XXX XXX', grid: { xs: 12, sm: 6 }, validation: { required: t('checkout.validation.phoneRequired', 'Phone is required'), pattern: { value: /^[+]?[\d\s()-]{8,15}$/, message: t('checkout.validation.phoneInvalid', '8-15 digits required') } } },
  { name: 'address', label: t('checkout.address', 'Delivery Address'), icon: LocationOn, placeholder: 'Street, City, Postal Code', multiline: true, rows: 2, grid: { xs: 12 }, validation: { required: t('checkout.validation.addressRequired', 'Address is required'), minLength: { value: 10, message: t('checkout.validation.addressMinLength', 'Complete address required') } } },
  { name: 'notes', label: t('checkout.notes', 'Delivery Notes'), icon: Notes, placeholder: t('checkout.notesPlaceholder', 'Special instructions (optional)...'), multiline: true, rows: 2, grid: { xs: 12 }, required: false, validation: {} },
];

// ==================== INJECT DARK THEME STYLES ====================
const injectDarkFormStyles = (isRTL) => {
  const existingStyle = document.getElementById('checkout-dark-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const style = document.createElement('style');
  style.id = 'checkout-dark-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap');
    
    .dark-field-wrap { 
      position: relative; 
      margin-bottom: 0; 
      width: 100%;
      max-width: 100%;
    }
    .dark-field-label { 
      position: absolute; 
      top: -10px; 
      ${isRTL ? 'right' : 'left'}: 14px; 
      font-family: 'Barlow Condensed', sans-serif; 
      font-size: 0.65rem; 
      font-weight: 800; 
      letter-spacing: 0.18em; 
      text-transform: uppercase; 
      color: #8A8A8A; 
      background: #1A1A1A; 
      padding: 0 8px; 
      z-index: 1; 
      transition: color 0.2s ease; 
      pointer-events: none; 
      white-space: nowrap;
    }
    ${isRTL ? `
    .dark-field-label {
      font-family: 'Noto Kufi Arabic', 'Tajawal', sans-serif;
      font-weight: 700;
      letter-spacing: 0;
      font-size: 0.7rem;
    }
    ` : ''}
    .dark-field-wrap.focused .dark-field-label { color: #0080ff; }
    .dark-field-wrap.has-error .dark-field-label { color: #FF4444; }
    .dark-field-wrap.is-valid .dark-field-label { color: #22C55E; }
    .dark-field-input { 
      width: 100%; 
      max-width: 100%;
      box-sizing: border-box;
      background: #1A1A1A; 
      border: 1.5px solid #2A2A2A; 
      border-radius: 10px; 
      color: #F2F2F0; 
      font-family: 'DM Sans', sans-serif; 
      font-size: 0.92rem; 
      font-weight: 400; 
      padding: ${isRTL ? '14px 42px 14px 44px' : '14px 44px 14px 42px'}; 
      outline: none; 
      transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease; 
      resize: none; 
      -webkit-appearance: none; 
      text-align: ${isRTL ? 'right' : 'left'};
      direction: ${isRTL ? 'rtl' : 'ltr'};
    }
    ${isRTL ? `
    .dark-field-input {
      font-family: 'Noto Kufi Arabic', 'Tajawal', sans-serif;
    }
    ` : ''}
    .dark-field-input::placeholder { color: #4A4A4A; }
    .dark-field-input:focus { border-color: #0080ff; background: #242424; box-shadow: 0 0 0 3px rgba(200, 255, 0, 0.08); }
    .dark-field-wrap.has-error .dark-field-input { border-color: #FF4444; }
    .dark-field-wrap.is-valid .dark-field-input { border-color: #22C55E; }
    .dark-field-icon { 
      position: absolute; 
      ${isRTL ? 'right' : 'left'}: 13px; 
      top: 50%; 
      transform: translateY(-50%); 
      color: #8A8A8A; 
      font-size: 17px !important; 
      transition: color 0.2s ease; 
      pointer-events: none; 
    }
    .dark-field-wrap.multiline .dark-field-icon { top: 18px; transform: none; }
    .dark-field-wrap.focused .dark-field-icon { color: #0080ff; }
    .dark-field-helper { 
      font-family: 'DM Sans', sans-serif; 
      font-size: 0.72rem; 
      font-weight: 500; 
      margin-top: 5px; 
      margin-${isRTL ? 'right' : 'left'}: 2px; 
      min-height: 18px; 
      text-align: ${isRTL ? 'right' : 'left'};
    }
    ${isRTL ? `
    .dark-field-helper {
      font-family: 'Noto Kufi Arabic', 'Tajawal', sans-serif;
    }
    ` : ''}
    .dark-submit-btn { 
      width: 100%; 
      background: #0080ff; 
      color: white; 
      border: none; 
      border-radius: 10px; 
      padding: 16px 24px; 
      font-family: 'Barlow Condensed', sans-serif; 
      font-weight: 900; 
      font-size: 0.9rem; 
      letter-spacing: 0.14em; 
      text-transform: uppercase; 
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      gap: 10px; 
      box-shadow: 0 4px 24px rgba(0, 128, 255, 0.2); 
      transition: all 0.3s ease; 
    }
    ${isRTL ? `
    .dark-submit-btn {
      font-family: 'Noto Kufi Arabic', 'Tajawal', sans-serif;
      font-weight: 800;
      letter-spacing: 0;
    }
    ` : ''}
    .dark-submit-btn:hover:not(:disabled) { background: #0058cc; transform: translateY(-2px); box-shadow: 0 6px 32px rgba(0, 128, 255, 0.3); }
    .dark-submit-btn:disabled { background: #2A2A2A; color: #4A4A4A; cursor: not-allowed; box-shadow: none; transform: none; }
    @keyframes spin-checkout { to { transform: rotate(360deg); } }
    .checkout-spinner { animation: spin-checkout 0.8s linear infinite; display: inline-flex; }
    .checkout-step-dot { width: 6px; height: 6px; border-radius: 50%; background: #2A2A2A; transition: all 0.3s ease; }
    .checkout-step-dot.active { background: #0080ff; transform: scale(1.4); box-shadow: 0 0 8px rgba(0, 128, 255, 0.4); }
    .checkout-step-dot.done { background: #22C55E; box-shadow: 0 0 8px rgba(34, 197, 94, 0.4); }
    .cart-item-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .cart-item-hover:hover { border-color: #0080ff !important; background: rgba(0, 128, 255, 0.02) !important; transform: translateX(${isRTL ? '-4px' : '4px'}); }
    .price-glow { text-shadow: 0 0 20px rgba(0, 128, 255, 0.15); }
    
    /* Form container to maintain width */
    .checkout-form-container {
      width: 100%;
      max-width: 100%;
    }
  `;
  document.head.appendChild(style);
};

// ==================== SUB-COMPONENTS ====================

const DarkField = ({ field, value, onChange, onBlur, error, touched: isTouched, isRTL }) => {
  const [focused, setFocused] = useState(false);
  const hasError = isTouched && !!error;
  const isValid = isTouched && !error && value?.trim().length > 0;
  const Icon = field.icon;
  
  const wrapperClasses = ['dark-field-wrap', field.multiline ? 'multiline' : '', focused ? 'focused' : '', hasError ? 'has-error' : '', isValid ? 'is-valid' : ''].filter(Boolean).join(' ');

  return (
    <Box sx={{ mb: 0, width: '100%' }}>
      <div className={wrapperClasses} style={{ position: 'relative', width: '100%' }}>
        <span className="dark-field-label">
          {field.label}
          {field.required !== false && <span style={{ color: '#0080ff', marginLeft: isRTL ? 0 : 2, marginRight: isRTL ? 2 : 0 }}>*</span>}
        </span>
        <Icon className="dark-field-icon" style={{ fontSize: 17 }} />
        {field.multiline ? (
          <textarea className="dark-field-input" name={field.name} value={value} placeholder={field.placeholder} rows={field.rows || 2} onChange={onChange} onFocus={() => setFocused(true)} onBlur={(e) => { setFocused(false); onBlur(e); }} style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} />
        ) : (
          <input className="dark-field-input" type={field.type || 'text'} name={field.name} value={value} placeholder={field.placeholder} onChange={onChange} onFocus={() => setFocused(true)} onBlur={(e) => { setFocused(false); onBlur(e); }} style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} />
        )}
      </div>
      <div className="dark-field-helper" style={{ color: hasError ? DesignSystem.colors.error : DesignSystem.colors.textMuted }}>{hasError ? error : '\u00A0'}</div>
    </Box>
  );
};

const OrderSuccessScreen = ({ orderResult, onContinue, t, isRTL }) => (
  <Box sx={{ minHeight: '100vh', bgcolor: DesignSystem.colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, direction: isRTL ? 'rtl' : 'ltr' }}>
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} style={{ width: '100%', maxWidth: 500 }}>
      <Box sx={{ background: DesignSystem.colors.bgCard, border: `1px solid ${DesignSystem.colors.border}`, borderRadius: '20px', p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}>
          <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${DesignSystem.colors.accent} 0%, ${DesignSystem.colors.accentDark} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, boxShadow: DesignSystem.shadows.glow(DesignSystem.colors.accent) }}>
            <Check sx={{ fontSize: 38, color: DesignSystem.colors.bg }} />
          </Box>
        </motion.div>
        <Typography sx={{ fontFamily: isRTL ? DesignSystem.typography.ar : DesignSystem.typography.display, fontWeight: 900, fontSize: '2rem', color: DesignSystem.colors.bg, mb: 1, textTransform: 'uppercase' }}>
          {t('checkout.orderConfirmed', 'Order Confirmed!')}
        </Typography>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(0,128,255,0.05)', border: '1px solid rgba(0,128,255,0.2)', borderRadius: '10px', px: 2.5, py: 1, mb: 3 }}>
          <Receipt sx={{ color: DesignSystem.colors.accent, fontSize: 18 }} />
          <Typography sx={{ fontFamily: DesignSystem.typography.mono, fontWeight: 700, fontSize: '1.1rem', color: DesignSystem.colors.accent, letterSpacing: '0.05em' }}>#{orderResult?.orderNumber}</Typography>
        </Box>
        <Typography sx={{ fontFamily: isRTL ? DesignSystem.typography.ar : DesignSystem.typography.body, color: DesignSystem.colors.textMuted, fontSize: '0.9rem', lineHeight: 1.6, mb: 2 }}>
          {t('checkout.thankYou', 'Thank you for your order! A confirmation email has been sent to')}{' '}
          <strong style={{ color: DesignSystem.colors.bg }}>{orderResult?.customer?.email}</strong>.
        </Typography>
        <Typography sx={{ fontFamily: isRTL ? DesignSystem.typography.ar : DesignSystem.typography.body, color: DesignSystem.colors.textPlaceholder, fontSize: '0.85rem', mb: 4 }}>
          {t('checkout.expectedDelivery', 'Expected delivery: 3-5 business days')}
        </Typography>
        <button className="dark-submit-btn" onClick={onContinue} type="button">
          <ShoppingBag sx={{ fontSize: 18 }} />
          {t('checkout.continueShopping', 'Continue Shopping')}
        </button>
      </Box>
    </motion.div>
  </Box>
);

const CartItem = ({ item, onUpdateQuantity, onRemove, isRTL, t }) => (
  <motion.div initial={{ opacity: 0, x: isRTL ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRTL ? -20 : 20, height: 0 }} transition={{ duration: 0.3 }}>
    <Box className="cart-item-hover" sx={{ display: 'flex', gap: 2.5, p: 2.5, mb: 2, borderRadius: `${DesignSystem.borderRadius.md}px`, border: `1.5px solid ${DesignSystem.colors.border}`, bgcolor: DesignSystem.colors.bgCard, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      <Avatar src={item.mainImage} variant="rounded" sx={{ width: 100, height: 100, borderRadius: `${DesignSystem.borderRadius.md}px`, bgcolor: DesignSystem.colors.bgField, border: `1px solid ${DesignSystem.colors.border}`, flexShrink: 0 }} imgProps={{ style: { objectFit: 'cover' } }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ fontFamily: isRTL ? DesignSystem.typography.ar : DesignSystem.typography.body, fontWeight: 600, color: DesignSystem.colors.bg, fontSize: '0.95rem', lineHeight: 1.4 }}>{item.name}</Typography>
          <Tooltip title={t('checkout.removeItem', 'Remove item')} arrow>
            <IconButton size="small" onClick={() => onRemove(item.productId, item.selectedSize)} sx={{ color: DesignSystem.colors.textPlaceholder, '&:hover': { color: DesignSystem.colors.error, bgcolor: 'rgba(255,68,68,0.1)' } }}>
              <Delete sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <Chip label={`${t('common:size', 'Size')}: ${item.selectedSize}`} size="small" sx={{ fontFamily: DesignSystem.typography.body, fontWeight: 600, fontSize: '0.7rem', height: 24, bgcolor: DesignSystem.colors.bgField, color: DesignSystem.colors.bg, border: `1px solid ${DesignSystem.colors.border}`, borderRadius: '6px' }} />
          {item.isOffer && <Chip icon={<LocalOffer sx={{ fontSize: 14 }} />} label={t('common:offers', 'Offer')} size="small" sx={{ fontFamily: DesignSystem.typography.body, fontWeight: 600, fontSize: '0.7rem', height: 24, bgcolor: 'rgba(0,128,255,0.05)', color: DesignSystem.colors.accent, border: '1px solid rgba(0,128,255,0.2)', borderRadius: '6px' }} />}
          {item.discount > 0 && <Chip label={`-${item.discount}%`} size="small" sx={{ fontFamily: DesignSystem.typography.body, fontWeight: 700, fontSize: '0.7rem', height: 24, bgcolor: 'rgba(34,197,94,0.05)', color: DesignSystem.colors.success, border: '1px solid rgba(34,197,94,0.2)', borderRadius: '6px' }} />}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <Box>
            <Typography className="price-glow" sx={{ fontFamily: DesignSystem.typography.display, fontWeight: 800, fontSize: '1.1rem', color: DesignSystem.colors.accent }}>{(item.price * item.quantity).toFixed(2)} TND</Typography>
            {item.quantity > 1 && <Typography sx={{ fontFamily: DesignSystem.typography.body, fontSize: '0.7rem', color: DesignSystem.colors.textMuted, mt: 0.25 }}>{item.price.toFixed(2)} TND {t('checkout.each', 'each')}</Typography>}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', borderRadius: '8px', border: `1.5px solid ${DesignSystem.colors.border}`, overflow: 'hidden', '&:hover': { borderColor: DesignSystem.colors.accent } }}>
            <IconButton size="small" onClick={() => onUpdateQuantity(item.productId, item.quantity - 1, item.selectedSize)} disabled={item.quantity <= 1} sx={{ color: DesignSystem.colors.textMuted, borderRadius: 0, p: 0.8, '&:hover': { bgcolor: 'rgba(0,128,255,0.05)', color: DesignSystem.colors.accent }, '&.Mui-disabled': { color: DesignSystem.colors.textPlaceholder } }}><Remove sx={{ fontSize: 16 }} /></IconButton>
            <Typography sx={{ fontFamily: DesignSystem.typography.mono, fontWeight: 700, minWidth: 36, textAlign: 'center', fontSize: '0.9rem', color: DesignSystem.colors.bg, userSelect: 'none' }}>{item.quantity}</Typography>
            <IconButton size="small" onClick={() => onUpdateQuantity(item.productId, item.quantity + 1, item.selectedSize)} sx={{ color: DesignSystem.colors.textMuted, borderRadius: 0, p: 0.8, '&:hover': { bgcolor: 'rgba(0,128,255,0.05)', color: DesignSystem.colors.accent } }}><Add sx={{ fontSize: 16 }} /></IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  </motion.div>
);

const formatCurrency = (amount) => `${parseFloat(amount).toFixed(2)} TND`;

// ==================== MAIN CHECKOUT COMPONENT ====================
const Checkout = () => {
  const { t, i18n } = useTranslation(['common']);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isRTL = i18n.language === 'ar';
  
  const FORM_FIELDS = useMemo(() => getFormFields(t), [t]);
  const validateFieldFn = useCallback((name, value) => {
    const field = FORM_FIELDS.find((f) => f.name === name);
    if (!field?.validation) return '';
    const rules = field.validation;
    const v = value?.trim() || '';
    if (rules.required && !v) return rules.required;
    if (v && rules.minLength && v.length < rules.minLength.value) return rules.minLength.message;
    if (v && rules.pattern && !rules.pattern.value.test(v)) return rules.pattern.message;
    return '';
  }, [FORM_FIELDS]);

  const {
    cart, cartCount, cartIsEmpty, subtotal,
    updateQuantity, removeFromCart, clearCart,
  } = useCart();

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => { injectDarkFormStyles(isRTL); return () => { const el = document.getElementById('checkout-dark-styles'); if (el) el.remove(); }; }, [isRTL]);
  useEffect(() => { document.documentElement.dir = isRTL ? 'rtl' : 'ltr'; document.documentElement.lang = i18n.language; }, [isRTL, i18n.language]);

  useEffect(() => {
    const initialData = {};
    FORM_FIELDS.forEach(field => { initialData[field.name] = ''; });
    setFormData(initialData);
  }, [FORM_FIELDS]);

  useEffect(() => { if (cartIsEmpty && !orderSuccess) navigate('/sport'); }, [cartIsEmpty, navigate, orderSuccess]);

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleChange = useCallback((name) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) setErrors(prev => ({ ...prev, [name]: validateFieldFn(name, value) }));
  }, [touched, validateFieldFn]);

  const handleBlur = useCallback((name) => () => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateFieldFn(name, formData[name]) }));
  }, [formData, validateFieldFn]);

  const handleSubmit = async () => {
    const newErrors = {};
    FORM_FIELDS.forEach((field) => { if (field.required !== false) { const err = validateFieldFn(field.name, formData[field.name]); if (err) newErrors[field.name] = err; } });
    setErrors(newErrors);
    setTouched(FORM_FIELDS.reduce((acc, f) => ({ ...acc, [f.name]: true }), {}));
    if (Object.keys(newErrors).length > 0) { showSnackbar(t('checkout.fillRequired', 'Please fill in all required fields correctly'), 'error'); return; }
    if (cart.length === 0) { showSnackbar(t('checkout.cartEmpty', 'Your cart is empty'), 'error'); return; }
    setIsSubmitting(true);
    try {
      const orderData = { customer: { fullName: formData.fullName, email: formData.email, phone: formData.phone, address: formData.address, notes: formData.notes || '' }, items: cart.map((item) => ({ productId: item.productId || item._id, itemType: item.isOffer ? 'Offer' : 'Product', quantity: item.quantity, size: item.selectedSize })), paymentMethod: 'cash_on_delivery', shippingCost: shippingCost };
      const response = await orderService.createOrder(orderData);
      if (response.data.success) { setOrderSuccess(response.data.data); clearCart(); showSnackbar(`${t('checkout.orderPlaced', 'Order #{{number}} placed successfully!', { number: response.data.data.orderNumber })}`, 'success'); }
    } catch (error) { showSnackbar(error.response?.data?.message || t('checkout.orderFailed', 'Failed to place order. Please try again.'), 'error'); }
    finally { setIsSubmitting(false); }
  };

  if (orderSuccess) return <OrderSuccessScreen orderResult={orderSuccess} onContinue={() => navigate('/sport')} t={t} isRTL={isRTL} />;

  const requiredFields = FORM_FIELDS.filter(f => f.required !== false);
  const filledCount = requiredFields.filter(f => formData[f.name]?.trim() && !errors[f.name]).length;

  return (
    <Box sx={{ bgcolor: DesignSystem.colors.bg, minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Box sx={{ mb: 5 }}>
            <Breadcrumbs sx={{ mb: 2 }}>
              <Link component="button" underline="hover" onClick={() => navigate('/')} sx={{ fontFamily: isRTL ? DesignSystem.typography.ar : DesignSystem.typography.body, fontWeight: 600, color: DesignSystem.colors.accent, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('nav.home', 'Home')}</Link>
              <Typography sx={{ fontFamily: isRTL ? DesignSystem.typography.ar : DesignSystem.typography.body, fontWeight: 700, color: DesignSystem.colors.text, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('checkout.title', 'Checkout')}</Typography>
            </Breadcrumbs>
            <Typography sx={{ fontFamily: isRTL ? DesignSystem.typography.ar : DesignSystem.typography.display, fontWeight: 900, fontSize: { xs: '2rem', md: '3rem' }, color: DesignSystem.colors.text, textTransform: 'uppercase', letterSpacing: '-0.02em', mb: 1, textAlign: isRTL ? 'right' : 'left' }}>
              {t('checkout.completeOrder', 'Complete Your Order')}
            </Typography>
            <Typography sx={{ fontFamily: isRTL ? DesignSystem.typography.ar : DesignSystem.typography.body, color: DesignSystem.colors.textMuted, fontSize: '1rem', fontWeight: 500, textAlign: isRTL ? 'right' : 'left' }}>
              {t('checkout.subtitle', 'Review your selections and provide delivery details')}
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={7}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Box sx={{ background: DesignSystem.colors.bgCard, border: `1px solid ${DesignSystem.colors.border}`, borderRadius: `${DesignSystem.borderRadius.xl}px`, overflow: 'hidden', mb: 4 }}>
                <Box sx={{ p: { xs: 3, md: 4 }, borderBottom: `1px solid ${DesignSystem.colors.border}`, background: 'linear-gradient(135deg, #161616 0%, #1A1A1A 100%)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge badgeContent={cartCount} sx={{ '& .MuiBadge-badge': { fontFamily: DesignSystem.typography.body, fontWeight: 700, fontSize: '0.7rem', bgcolor: DesignSystem.colors.accent, color: DesignSystem.colors.bg } }}>
                      <ShoppingCartOutlined sx={{ color: DesignSystem.colors.bg, fontSize: 24 }} />
                    </Badge>
                    <Box>
                      <Typography sx={{ fontFamily: DesignSystem.typography.display, fontWeight: 800, fontSize: '1.2rem', color: DesignSystem.colors.bg, textTransform: 'uppercase' }}>{t('checkout.yourCart', 'Your Cart')}</Typography>
                      <Typography sx={{ fontFamily: DesignSystem.typography.body, fontSize: '0.85rem', color: DesignSystem.colors.textMuted }}>{cartCount} {cartCount === 1 ? t('cart.item', 'item') : t('cart.items', 'items')} • {t('checkout.subtotalLabel', 'Subtotal')}: {formatCurrency(subtotal)}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ p: { xs: 3, md: 4 } }}>
                  <AnimatePresence>
                    {cart.map((item) => <CartItem key={item.variantKey || `${item.productId}-${item.selectedSize}`} item={item} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} isRTL={isRTL} t={t} />)}
                  </AnimatePresence>
                </Box>
              </Box>
            </motion.div>
          </Grid>

          <Grid item xs={12} lg={5}>
            <motion.div initial={{ opacity: 0, x: isRTL ? -40 : 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Box sx={{ background: DesignSystem.colors.bgCard, border: `1px solid ${DesignSystem.colors.border}`, borderRadius: `${DesignSystem.borderRadius.xl}px`, overflow: 'hidden', position: 'sticky', top: 20 }}>
                <Box sx={{ p: { xs: 3, md: 4 }, borderBottom: `1px solid ${DesignSystem.colors.border}`, background: 'linear-gradient(135deg, #161616 0%, #1A1A1A 100%)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontFamily: DesignSystem.typography.body, fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: DesignSystem.colors.textMuted, mb: 0.5 }}>{t('checkout.title', 'Checkout')}</Typography>
                      <Typography sx={{ fontFamily: DesignSystem.typography.display, fontWeight: 900, fontSize: '2rem', color: DesignSystem.colors.bg, textTransform: 'uppercase', lineHeight: 0.95 }}>{t('checkout.placeYour', 'Place Your')}<br /><Box component="span" sx={{ color: DesignSystem.colors.accent }}>{t('checkout.order', 'Order')}</Box></Typography>
                    </Box>
                    <Box sx={{ width: 56, height: 56, borderRadius: '14px', background: DesignSystem.colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: DesignSystem.shadows.glow(DesignSystem.colors.accent) }}><Send sx={{ color: DesignSystem.colors.bg, fontSize: 24 }} /></Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2.5 }}>
                    {requiredFields.map((f) => { const isDone = formData[f.name]?.trim() && !errors[f.name]; return <div key={f.name} className={`checkout-step-dot ${isDone ? 'done' : 'active'}`} />; })}
                    <Typography sx={{ fontFamily: DesignSystem.typography.body, fontSize: '0.68rem', color: DesignSystem.colors.textMuted, ml: isRTL ? 0 : 0.75, mr: isRTL ? 0.75 : 0 }}>{filledCount}/{requiredFields.length} {t('checkout.complete', 'complete')}</Typography>
                  </Box>
                </Box>

                <Box sx={{ p: { xs: 3, md: 4 } }}>
                  <Box sx={{ mb: 3, p: 2.5, bgcolor: 'rgba(0,128,255,0.03)', borderRadius: '10px', border: `1px solid ${DesignSystem.colors.border}` }}>
                    <Typography sx={{ fontFamily: DesignSystem.typography.display, fontWeight: 800, fontSize: '0.85rem', color: DesignSystem.colors.accent, textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>{t('checkout.orderSummary', 'Order Summary')}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography sx={{ fontFamily: DesignSystem.typography.body, fontSize: '0.85rem', color: DesignSystem.colors.textMuted }}>{t('checkout.subtotalLabel', 'Subtotal')} ({cartCount} {cartCount === 1 ? t('cart.item', 'item') : t('cart.items', 'items')})</Typography><Typography sx={{ fontFamily: DesignSystem.typography.body, fontSize: '0.85rem', fontWeight: 600, color: DesignSystem.colors.bg }}>{formatCurrency(subtotal)}</Typography></Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography sx={{ fontFamily: DesignSystem.typography.body, fontSize: '0.85rem', color: DesignSystem.colors.textMuted }}>{t('checkout.shipping', 'Shipping')}</Typography><Box sx={{ textAlign: 'right' }}>{shippingCost === 0 ? <Chip label={t('common:free', 'FREE')} size="small" sx={{ fontFamily: DesignSystem.typography.display, fontWeight: 700, fontSize: '0.7rem', height: 22, bgcolor: 'rgba(34,197,94,0.1)', color: DesignSystem.colors.success, border: '1px solid rgba(34,197,94,0.3)' }} /> : <Typography sx={{ fontFamily: DesignSystem.typography.body, fontSize: '0.85rem', fontWeight: 600, color: DesignSystem.colors.bg }}>+{formatCurrency(shippingCost)}</Typography>}</Box></Box>
                    {shippingCost > 0 && <Typography sx={{ fontFamily: DesignSystem.typography.body, fontSize: '0.7rem', color: DesignSystem.colors.textMuted, mb: 1 }}>{t('checkout.freeShippingThreshold', 'Free shipping on orders over {{amount}} TND', { amount: FREE_SHIPPING_THRESHOLD })} ({formatCurrency(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal))} {t('checkout.moreForFree', 'more for free shipping')})</Typography>}
                    <Divider sx={{ my: 1.5, borderColor: DesignSystem.colors.border }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Typography sx={{ fontFamily: DesignSystem.typography.display, fontWeight: 800, fontSize: '0.9rem', color: DesignSystem.colors.bg, textTransform: 'uppercase' }}>{t('checkout.total', 'Total')}</Typography><Typography className="price-glow" sx={{ fontFamily: DesignSystem.typography.display, fontWeight: 900, fontSize: '1.3rem', color: DesignSystem.colors.accent }}>{formatCurrency(total)}</Typography></Box>
                  </Box>

                  <Box className="checkout-form-container">
                    {FORM_FIELDS.map((field) => <DarkField key={field.name} field={field} value={formData[field.name]} onChange={handleChange(field.name)} onBlur={handleBlur(field.name)} error={errors[field.name]} touched={touched[field.name]} isRTL={isRTL} />)}
                  </Box>
                  
                  <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                    <button className="dark-submit-btn" onClick={handleSubmit} disabled={isSubmitting || cartIsEmpty} type="button" style={{ marginTop: 16, color: 'white' }}>
                      {isSubmitting ? <><span className="checkout-spinner"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg></span>{t('checkout.processing', 'Processing...')}</> : <><Lock sx={{ fontSize: 18, color: 'white' }} />{t('checkout.placeOrder', 'Place Order')} • {formatCurrency(total)}</>}
                    </button>
                  </motion.div>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2.5, py: 1.5, px: 2, borderRadius: '10px', bgcolor: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.1)' }}>
                    <Shield sx={{ fontSize: 16, color: DesignSystem.colors.success }} />
                    <Typography sx={{ fontFamily: DesignSystem.typography.body, fontSize: '0.7rem', color: DesignSystem.colors.success, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('checkout.secure', 'Secured by 256-bit SSL Encryption')}</Typography>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} variant="filled" icon={false} sx={{ fontFamily: isRTL ? DesignSystem.typography.ar : DesignSystem.typography.body, fontWeight: 600, borderRadius: '10px', boxShadow: DesignSystem.shadows.floating, fontSize: '0.85rem', bgcolor: snackbar.severity === 'success' ? DesignSystem.colors.success : DesignSystem.colors.error, color: '#fff' }}>
          {snackbar.severity === 'success' ? <CheckCircle sx={{ fontSize: 20, mr: 1 }} /> : <Error sx={{ fontSize: 20, mr: 1 }} />}
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};



export default Checkout;
// pages/ProductDetail.jsx - Full i18n Integration
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Container, Grid, Typography, Button, Card, CardMedia,
  Rating, Chip, Divider, Breadcrumbs, Link, Skeleton, Snackbar,
  Alert, Paper, alpha, Badge, Fab, Zoom, IconButton, TextField,
} from '@mui/material';
import {
  ShoppingCart, LocalShipping, Verified, ArrowBack, Check,
  Email, Phone, LocationOn, Person, ShoppingBag, Send,
  Lock, Notes, Error, AccessTime, LocalOffer,
  Add, Remove,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { productService, offerService, orderService } from '../services/api';
import { useCart } from '../context/CartContext';

// ==================== Design Tokens ====================
const T = {
  ink: '#0D0D0D', inkMid: '#3A3A3A', inkLight: '#888', inkFaint: '#C4C4C4',
  surface: '#ffffff', white: '#FFFFFF', accent: '#C8102E', success: '#1A7A4A',
  radius: { sm: 8, md: 14, lg: 22 },
  shadow: { card: '0 2px 20px rgba(0,0,0,.07)', button: '0 6px 24px rgba(13,13,13,.22)' },
};

const F = {
  bg: '#0F0F0F', bgCard: '#181818', bgField: '#242424', bgFieldFocus: '#2A2A2A',
  border: '#2E2E2E', borderFocus: '#0080ff', borderError: '#FF4444', borderSuccess: '#22C55E',
  text: '#F2F2F0', textMuted: '#8A8A8A', textPlaceholder: '#4A4A4A',
  accent: '#0080ff', accentDark: '#007acc', error: '#FF4444', success: '#22C55E',
  fontDisplay: '"Barlow Condensed", sans-serif', fontBody: '"DM Sans", sans-serif',
  fontAr: '"Noto Kufi Arabic", "Tajawal", sans-serif',
};

const SHIPPING_COST = 9;
const FREE_SHIPPING_THRESHOLD = 200;

// ==================== Form Fields (with translations) ====================
// ⚠️ EMAIL FIELD COMMENT (2026-06-07)
// Email field is currently DISABLED / NOT IN USE
// - Field is commented out from the form
// - Not required for checkout flow
// - To re-enable: uncomment the email field object below
// - Also uncomment in FORM_FIELDS array and ProField rendering
// - Reason: Reducing checkout friction, collecting email separately if needed
const getFormFields = (t) => [
  { name: 'fullName', label: t('checkout.fullName', 'Full Name'), icon: Person, placeholder: 'John Doe', grid: { xs: 12 }, validation: { required: t('checkout.validation.nameRequired', 'Full name is required'), minLength: { value: 3, message: t('checkout.validation.nameMinLength', 'At least 3 characters') } } },
  
  // ==============================================================
  // 📧 EMAIL FIELD - COMMENTED OUT (NOT IN USE)
  // Uncomment below to re-enable email collection
  // ==============================================================
  // { 
  //   name: 'email', 
  //   label: t('checkout.email', 'Email Address'), 
  //   icon: Email, 
  //   type: 'email', 
  //   placeholder: 'you@example.com', 
  //   grid: { xs: 12 }, 
  //   required: true,
  //   validation: { 
  //     required: t('checkout.validation.emailRequired', 'Email is required'),
  //     pattern: { 
  //       value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
  //       message: t('checkout.validation.emailInvalid', 'Invalid email format') 
  //     } 
  //   } 
  // },
  // ==============================================================
  
  { name: 'phone', label: t('checkout.phone', 'Phone Number'), icon: Phone, type: 'tel', placeholder: '+216 XX XXX XXX', grid: { xs: 12 }, validation: { required: t('checkout.validation.phoneRequired', 'Phone is required'), pattern: { value: /^[+]?[\d\s()-]{8,15}$/, message: t('checkout.validation.phoneInvalid', '8-15 digits required') } } },
  { name: 'address', label: t('checkout.address', 'Delivery Address'), icon: LocationOn, placeholder: 'Street, City, Postal Code', multiline: true, rows: 2, grid: { xs: 12 }, validation: { required: t('checkout.validation.addressRequired', 'Address is required'), minLength: { value: 5, message: t('checkout.validation.addressMinLength', 'Complete address required') } } },
  { name: 'notes', label: t('checkout.notes', 'Delivery Notes'), icon: Notes, placeholder: t('checkout.notesPlaceholder', 'Special instructions...'), multiline: true, rows: 2, grid: { xs: 12 }, required: false, validation: {} },
];

// ==================== Inject Form Styles ====================
const injectFormFonts = (isRTL) => {
  if (document.getElementById('product-detail-form-fonts')) return;
  const link = document.createElement('link');
  link.id = 'product-detail-form-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600&family=Noto+Kufi+Arabic:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap';
  document.head.appendChild(link);

  const style = document.createElement('style');
  style.id = 'product-detail-form-styles';
  style.textContent = `
    .pro-field-wrap{position:relative}.pro-field-wrap .pro-label{position:absolute;top:-10px;${isRTL ? 'right' : 'left'}:14px;font-family:${F.fontDisplay};font-size:0.62rem;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:${F.textMuted};background:${F.bgField};padding:0 6px;z-index:1;transition:color 0.2s;pointer-events:none}
    .pro-field-wrap.focused .pro-label{color:${F.accent}}.pro-field-wrap.has-error .pro-label{color:${F.error}}.pro-field-wrap.is-valid .pro-label{color:${F.success}}
    .pro-field-inner{width:100%;background:${F.bgField};border:1.5px solid ${F.border};border-radius:10px;color:${F.text};font-family:${F.fontBody};font-size:0.92rem;font-weight:400;padding:${isRTL ? '14px 42px 14px 44px' : '14px 44px 14px 42px'};outline:none;transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;box-sizing:border-box;resize:none;-webkit-appearance:none;text-align:${isRTL ? 'right' : 'left'}}
    .pro-field-inner::placeholder{color:${F.textPlaceholder}}
    .pro-field-inner:focus{border-color:${F.borderFocus};background:${F.bgFieldFocus};box-shadow:0 0 0 3px rgba(200,255,0,0.08)}
    .pro-field-wrap.has-error .pro-field-inner{border-color:${F.borderError}}
    .pro-field-wrap.is-valid .pro-field-inner{border-color:${F.borderSuccess}}
    .pro-field-icon{position:absolute;${isRTL ? 'right' : 'left'}:13px;top:50%;transform:translateY(-50%);color:${F.textMuted};font-size:17px!important;transition:color 0.2s;pointer-events:none}
    .pro-field-wrap.multiline .pro-field-icon{top:18px;transform:none}
    .pro-field-wrap.focused .pro-field-icon{color:${F.accent}}
    .pro-field-helper{font-family:${F.fontBody};font-size:0.72rem;font-weight:500;margin-top:5px;margin-${isRTL ? 'right' : 'left'}:2px;min-height:18px;text-align:${isRTL ? 'right' : 'left'}}
    .pro-submit-btn{width:100%;background:${F.accent};color:${F.bg};border:none;border-radius:10px;padding:15px 24px;font-family:${F.fontDisplay};font-weight:900;font-size:0.88rem;letter-spacing:0.12em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 4px 20px rgba(200,255,0,0.2)}
    .pro-submit-btn:hover:not(:disabled){background:${F.accentDark};transform:translateY(-2px)}
    .pro-submit-btn:disabled{background:#2A2A2A;color:#4A4A4A;cursor:not-allowed;box-shadow:none}
    @keyframes spin-form{to{transform:rotate(360deg)}}.pro-spinner{animation:spin-form 0.8s linear infinite;display:inline-flex}
    .form-step-dot{width:6px;height:6px;border-radius:50%;background:${F.border};transition:background 0.3s,transform 0.3s}
    .form-step-dot.active{background:${F.accent};transform:scale(1.4)}
    .form-step-dot.done{background:${F.success}}
  `;
  document.head.appendChild(style);
};

// ==================== Utility ====================
const formatData = (item, isOffer = false) => {
  const mainImage = item.mainImage?.url || item.mainImage || 'https://via.placeholder.com/600x600';
  const images = item.images?.map((img) => img.url || img) || [];
  if (isOffer) {
    return { ...item, id: item._id, mainImage, images, price: item.mainPrice, discount: item.discount || 0, discountedPrice: item.discountedPrice || (item.mainPrice * (1 - (item.discount || 0) / 100)).toFixed(2), size: item.sizes || [], review: item.review || 0, salesCount: item.salesCount || 0, stock: 999, category: item.category || 'Offers', description: item.description || '', isOffer: true, startDate: item.startDate, endDate: item.endDate };
  }
  return { ...item, id: item._id, mainImage, images, price: item.price || 0, discount: item.discount || 0, discountedPrice: item.discount > 0 ? ((item.price || 0) * (1 - (item.discount || 0) / 100)).toFixed(2) : (item.price || 0).toFixed(2), size: item.size || [], review: item.review || 0, salesCount: item.salesCount || 0, stock: item.stock || 0, category: item.category || 'Sport', description: item.description || '', isOffer: false };
};

// ==================== Hooks ====================
const useProductDetail = (productId, locationProduct) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchProduct = useCallback(async () => {
    if (locationProduct) { const isOffer = locationProduct.mainPrice !== undefined; setProduct(formatData(locationProduct, isOffer)); setLoading(false); return; }
    if (!productId) return;
    setLoading(true); setError(null);
    try {
      try { const res = await productService.getProduct(productId); if (res.data.success) { setProduct(formatData(res.data.data)); setLoading(false); return; } } catch (e) {}
      try { const res = await offerService.getOffer(productId); if (res.data.success) { setProduct(formatData(res.data.data, true)); setLoading(false); return; } } catch (e) { throw new Error('Item not found'); }
    } catch (err) { setError(err.response?.data?.message || err.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, [productId, locationProduct]);
  useEffect(() => { fetchProduct(); }, [fetchProduct]);
  return { product, loading, error, fetchProduct };
};

const useOrderForm = (t) => {
  const FORM_FIELDS = React.useMemo(() => getFormFields(t), [t]);
  const init = FORM_FIELDS.reduce((a, f) => ({ ...a, [f.name]: '' }), {});
  const [formData, setFormData] = useState(init);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const validateField = useCallback((name, value) => {
    const field = FORM_FIELDS.find((f) => f.name === name);
    if (!field?.validation) return '';
    const rules = field.validation;
    const v = value?.trim() || '';
    if (rules.required && !v) return rules.required;
    if (v && rules.minLength && v.length < rules.minLength.value) return rules.minLength.message;
    if (v && rules.pattern && !rules.pattern.value.test(v)) return rules.pattern.message;
    return '';
  }, [FORM_FIELDS]);

  const handleChange = useCallback((name) => (e) => {
    const v = e.target.value;
    setFormData((d) => ({ ...d, [name]: v }));
    if (touched[name]) setErrors((err) => ({ ...err, [name]: validateField(name, v) }));
  }, [touched, validateField]);

  const handleBlur = useCallback((name) => () => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((err) => ({ ...err, [name]: validateField(name, formData[name]) }));
  }, [formData, validateField]);

  const handleSubmit = useCallback(async (orderPayload, onSuccess, onError) => {
    const newErrs = {};
    FORM_FIELDS.forEach((f) => { if (f.required !== false) { const e = validateField(f.name, formData[f.name]); if (e) newErrs[f.name] = e; } });
    setErrors(newErrs);
    setTouched(FORM_FIELDS.reduce((a, f) => ({ ...a, [f.name]: true }), {}));
    if (Object.keys(newErrs).length) return;
    setIsSubmitting(true);
    try {
      const response = await orderService.createOrder(orderPayload);
      if (response.data.success) { setOrderResult(response.data.data); setSubmitted(true); onSuccess?.(response.data.data); }
    } catch (error) { onError?.(error.response?.data?.message || 'Failed to place order'); }
    finally { setIsSubmitting(false); }
  }, [formData, validateField, FORM_FIELDS]);

  return { formData, errors, touched, isSubmitting, submitted, orderResult, handleChange, handleBlur, handleSubmit };
};

// ==================== Sub-components ====================
const ProField = ({ field, value, onChange, onBlur, error, touched: isTouched }) => {
  const [focused, setFocused] = useState(false);
  const hasError = isTouched && !!error;
  const isValid = isTouched && !error && (value?.trim().length > 0 || field.required === false);
  const Icon = field.icon;
  const cls = ['pro-field-wrap', field.multiline ? 'multiline' : '', focused ? 'focused' : '', hasError ? 'has-error' : '', isValid ? 'is-valid' : ''].filter(Boolean).join(' ');
  return (
    <Box sx={{ mb: 0 }}>
      <div className={cls} style={{ position: 'relative' }}>
        <span className="pro-label">{field.label}{field.required !== false && <span style={{ color: '#0080ff', marginLeft: 2 }}>*</span>}</span>
        <Icon className="pro-field-icon" style={{ fontSize: 17 }} />
        {field.multiline ? <textarea className="pro-field-inner" name={field.name} value={value} placeholder={field.placeholder} rows={field.rows || 2} onChange={onChange} onFocus={() => setFocused(true)} onBlur={(e) => { setFocused(false); onBlur(e); }} /> : <input className="pro-field-inner" type={field.type || 'text'} name={field.name} value={value} placeholder={field.placeholder} onChange={onChange} onFocus={() => setFocused(true)} onBlur={(e) => { setFocused(false); onBlur(e); }} />}
      </div>
      <div className="pro-field-helper" style={{ color: hasError ? F.error : F.textMuted }}>{hasError ? error : '\u00A0'}</div>
    </Box>
  );
};

const OrderSuccess = ({ orderResult, t, isRTL }) => (
  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
    <Box sx={{ background: F.bgCard, border: `1px solid ${F.border}`, borderRadius: '20px', p: { xs: 4, sm: 6 }, textAlign: 'center', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${F.accent} 0%, ${F.accentDark} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
        <Check sx={{ fontSize: 38, color: F.bg }} />
      </Box>
      <Typography sx={{ fontFamily: isRTL ? F.fontAr : F.fontDisplay, fontWeight: 900, fontSize: '2rem', color: F.text, mb: 1, textTransform: 'uppercase' }}>{t('checkout.orderConfirmed', 'Order Confirmed!')}</Typography>
      <Typography sx={{ fontFamily: F.fontBody, fontSize: '1.1rem', color: F.text, mb: 2 }}>{t('checkout.order', 'Order')} #{orderResult?.orderNumber}</Typography>
      <Typography sx={{ fontFamily: F.fontBody, fontSize: '0.9rem', color: F.textMuted }}>{t('checkout.thankYouShort', "Thank you for your order! We'll send a confirmation to your email.")}</Typography>
    </Box>
  </motion.div>
);

const OrderForm = ({ formData, errors, touched, isSubmitting, submitted, orderResult, onChange, onBlur, onSubmit, itemTotal, quantity, shippingCost, total, t, isRTL }) => {
  const FORM_FIELDS = React.useMemo(() => getFormFields(t), [t]);
  useEffect(() => { injectFormFonts(isRTL); }, [isRTL]);
  if (submitted && orderResult) return <OrderSuccess orderResult={orderResult} t={t} isRTL={isRTL} />;
  const requiredFields = FORM_FIELDS.filter((f) => f.required !== false);
  const filledCount = requiredFields.filter((f) => formData[f.name]?.trim() && !errors[f.name]).length;

  return (
    <Box sx={{ width: { xs: '88vw', md: "45vw" }, mx: 'auto' }}>
      <Box sx={{ background: F.bgCard, border: `1px solid ${F.border}`, borderRadius: '20px', overflow: 'hidden', direction: isRTL ? 'rtl' : 'ltr' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #161616 0%, #1A1A1A 100%)', borderBottom: `1px solid ${F.border}`, px: { xs: 3, sm: 5 }, pt: { xs: 3, sm: 5 }, pb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography sx={{ fontFamily: F.fontBody, fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: F.textMuted, mb: 0.5 }}>{t('checkout.title', 'Checkout')}</Typography>
              <Typography sx={{ fontFamily: F.fontDisplay, fontWeight: 900, fontSize: { xs: '2rem', sm: '2.8rem' }, lineHeight: 0.95, color: F.text, textTransform: 'uppercase' }}>{t('checkout.placeYour', 'Place Your')}<br /><Box component="span" sx={{ color: F.accent }}>{t('checkout.order', 'Order')}</Box></Typography>
            </Box>
            <Box sx={{ width: 56, height: 56, borderRadius: '14px', background: F.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send sx={{ color: F.bg, fontSize: 24 }} /></Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2.5 }}>
            {requiredFields.map((f) => { const isDone = formData[f.name]?.trim() && !errors[f.name]; return <div key={f.name} className={`form-step-dot ${isDone ? 'done' : 'active'}`} />; })}
            <Typography sx={{ fontFamily: F.fontBody, fontSize: '0.68rem', color: F.textMuted, ml: isRTL ? 0 : 0.75, mr: isRTL ? 0.75 : 0 }}>{filledCount}/{requiredFields.length} {t('checkout.complete', 'complete')}</Typography>
          </Box>
        </Box>
        <Box sx={{ px: { xs: 3, sm: 5 }, py: { xs: 3, sm: 5 } }}>
          <Box sx={{ mb: 3, p: 2, bgcolor: alpha(F.accent, 0.05), borderRadius: '10px', border: `1px solid ${F.border}` }}>
            <Typography sx={{ fontFamily: F.fontDisplay, fontSize: '0.75rem', fontWeight: 700, color: F.accent, textTransform: 'uppercase', mb: 2 }}>{t('checkout.orderSummary', 'Order Summary')}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography sx={{ fontFamily: F.fontBody, fontSize: '0.85rem', color: F.textMuted }}>{t('checkout.subtotalLabel', 'Subtotal')} ({quantity} {quantity === 1 ? t('cart.item', 'item') : t('cart.items', 'items')})</Typography><Typography sx={{ fontFamily: F.fontBody, fontSize: '0.85rem', fontWeight: 600, color: F.text }}>{itemTotal.toFixed(2)} TND</Typography></Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography sx={{ fontFamily: F.fontBody, fontSize: '0.85rem', color: F.textMuted }}>{t('checkout.shipping', 'Shipping')}</Typography><Box sx={{ textAlign: 'right' }}>{shippingCost === 0 ? <Chip label={t('common:free', 'FREE')} size="small" sx={{ fontFamily: F.fontDisplay, fontWeight: 700, fontSize: '0.7rem', bgcolor: alpha(F.success, 0.2), color: F.success, height: 22 }} /> : <Typography sx={{ fontFamily: F.fontBody, fontSize: '0.85rem', fontWeight: 600, color: F.text }}>+{shippingCost.toFixed(2)} TND</Typography>}</Box></Box>
            {shippingCost > 0 && <Typography sx={{ fontFamily: F.fontBody, fontSize: '0.7rem', color: F.textMuted, mb: 1 }}>{t('checkout.freeShippingThreshold', 'Free shipping on orders over {{amount}} TND', { amount: FREE_SHIPPING_THRESHOLD })} ({Math.max(0, FREE_SHIPPING_THRESHOLD - itemTotal).toFixed(2)} TND {t('checkout.moreForFree', 'more for free shipping')})</Typography>}
            <Divider sx={{ my: 1.5, borderColor: F.border }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography sx={{ fontFamily: F.fontDisplay, fontSize: '0.9rem', fontWeight: 800, color: F.text }}>{t('checkout.total', 'Total')}</Typography><Typography sx={{ fontFamily: F.fontDisplay, fontSize: '1.1rem', fontWeight: 800, color: F.accent }}>{total.toFixed(2)} TND</Typography></Box>
          </Box>
          {FORM_FIELDS.map((field) => <ProField key={field.name} field={field} value={formData[field.name]} onChange={onChange(field.name)} onBlur={onBlur(field.name)} error={errors[field.name]} touched={touched[field.name]} />)}
          <button className="pro-submit-btn" onClick={onSubmit} disabled={isSubmitting} type="button" style={{ marginTop: 16 }}>
            {isSubmitting ? <><span className="pro-spinner"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={F.bg} strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg></span>{t('checkout.processing', 'Processing...')}</> : <><Send sx={{ fontSize: 18, color: F.bg }} />{t('checkout.confirmOrder', 'Confirm Order')} - {total.toFixed(2)} TND</>}
          </button>
        </Box>
      </Box>
    </Box>
  );
};

// ==================== Main Component ====================
const ProductDetail = () => {
  const { t, i18n } = useTranslation(['common']);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { addToCart, cartCount, openCart } = useCart();
  const isRTL = i18n.language === 'ar';

  const locationProduct = location.state?.product;
  const { product, loading, error, fetchProduct } = useProductDetail(id, locationProduct);
  const [selectedSize, setSelectedSize] = useState(locationProduct?.size?.[0] || locationProduct?.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { formData, errors, touched, isSubmitting, submitted, orderResult, handleChange, handleBlur, handleSubmit } = useOrderForm(t);

  useEffect(() => { document.documentElement.dir = isRTL ? 'rtl' : 'ltr'; document.documentElement.lang = i18n.language; }, [isRTL, i18n.language]);
  useEffect(() => { if (product?.size?.length > 0 && !selectedSize) setSelectedSize(product.size[0]); }, [product, selectedSize]);

  const showSnackbar = (msg, sev = 'success') => setSnackbar({ open: true, message: msg, severity: sev });
  const handleSizeSelect = (size) => setSelectedSize(size);
  const handleQuantityChange = (delta) => setQuantity(prev => Math.max(1, prev + delta));
  
  const handleAddToCart = () => { 
    if (!selectedSize) return showSnackbar(t('product.selectSize', 'Please select a size'), 'warning'); 
    addToCart(product, quantity, selectedSize); 
    showSnackbar(t('product.addedToCart', '{{quantity}}x {{name}} added to cart!', { quantity, name: product.name }), 'success'); 
    setQuantity(1);
  };

  const itemPrice = parseFloat(product?.discountedPrice || 0);
  const itemTotal = itemPrice * quantity;
  const shippingCost = itemTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = itemTotal + shippingCost;

  // NOTE: Email field is excluded from order payload (commented out in form fields)
  const handleOrderSubmit = () => {
    handleSubmit(
      { 
        customer: { 
          fullName: formData.fullName, 
          // email: formData.email, // ❌ EMAIL FIELD DISABLED - not collecting
          phone: formData.phone, 
          address: formData.address, 
          notes: formData.notes || '' 
        }, 
        items: [{ productId: product._id || product.id, itemType: product.isOffer ? 'Offer' : 'Product', quantity: quantity, size: selectedSize }], 
        paymentMethod: 'cash_on_delivery', 
        shippingCost: shippingCost 
      },
      (orderData) => { showSnackbar(t('product.orderPlaced', 'Order #{{number}} placed successfully! Total: {{total}} TND', { number: orderData.orderNumber, total: total.toFixed(2) }), 'success'); setQuantity(1); },
      (errorMessage) => showSnackbar(errorMessage, 'error')
    );
  };

  if (loading) return (
    <Container maxWidth="lg" sx={{ py: 4 }}><Grid container spacing={4}><Grid item xs={12} md={6}><Skeleton variant="rectangular" height={500} sx={{ borderRadius: '20px' }} /></Grid><Grid item xs={12} md={6}><Skeleton variant="text" width="80%" height={50} /><Skeleton variant="text" width="60%" height={30} /></Grid></Grid></Container>
  );

  if (error) return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Error sx={{ fontSize: 60, color: T.accent, mb: 2 }} />
      <Typography variant="h5" sx={{ fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif', fontWeight: 700, mb: 2 }}>{t('product.error', 'Error')}</Typography>
      <Typography sx={{ mb: 3, color: T.inkLight }}>{error}</Typography>
      <Button variant="contained" onClick={fetchProduct} sx={{ fontFamily: isRTL ? '"Noto Kufi Arabic"' : 'Amaranth, sans-serif', fontWeight: 700, bgcolor: T.ink, borderRadius: '12px', px: 4 }}>{t('product.retry', 'Retry')}</Button>
    </Container>
  );

  if (!product) return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', py: 8, direction: isRTL ? 'rtl' : 'ltr' }}>
      <ShoppingBag sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
      <Typography variant="h5" sx={{ fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif', fontWeight: 700, mb: 2 }}>{t('product.notFound', 'Not Found')}</Typography>
      <Button variant="contained" onClick={() => navigate('/sport')} startIcon={<ArrowBack sx={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />} sx={{ fontFamily: isRTL ? '"Noto Kufi Arabic"' : 'Amaranth, sans-serif', fontWeight: 700, bgcolor: '#141010', borderRadius: '12px', px: 4 }}>{t('product.back', 'Back')}</Button>
    </Container>
  );

  return (
    <Box sx={{ bgcolor: T.surface, minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Container sx={{ py: { xs: 2, sm: 4 } }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component="button" underline="hover" onClick={() => navigate(product?.isOffer ? '/offers' : `/${(product?.category || 'sport').toLowerCase()}`)} sx={{ fontFamily: isRTL ? '"Noto Kufi Arabic"' : 'Amaranth, sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', color: '#c31919' }}>
            <ArrowBack sx={{ mr: isRTL ? 0 : 0.5, ml: isRTL ? 0.5 : 0, fontSize: 18, transform: isRTL ? 'rotate(180deg)' : 'none' }} />{product?.isOffer ? t('common:offers.off', 'Offers') : (product?.category || 'Sport')}
          </Link>
          <Typography sx={{ fontFamily: isRTL ? '"Noto Kufi Arabic"' : 'Amaranth, sans-serif', fontWeight: 700, color: T.ink }}>{product.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: '20px', overflow: 'hidden', boxShadow: T.shadow.card, position: 'relative', bgcolor: '#f5f5f5' }}>
              <Box component="img" src={product.mainImage} alt={product.name} sx={{ width: '100%', height: { xs: 350, sm: 450, md: 500 }, objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/600x600'; }} />
              {product.discount > 0 && <Chip label={`-${product.discount}%`} sx={{ position: 'absolute', top: 16, left: isRTL ? 'auto' : 16, right: isRTL ? 16 : 'auto', fontFamily: 'Amaranth, sans-serif', fontWeight: 800, fontSize: '0.85rem', px: 1.5, py: 2.5, bgcolor: T.accent, color: '#fff' }} />}
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif', fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' }, color: T.ink, mb: 2, textAlign: isRTL ? 'right' : 'left' }}>{product.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Rating value={product.review || 0} precision={0.5} readOnly sx={{ color: '#F4B400' }} />
              <Typography sx={{ fontFamily: 'Amaranth, sans-serif', color: T.inkLight }}>({product.review || 0} {t('product.reviews', 'reviews')})</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 2, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, fontSize: { xs: '1.8rem', sm: '2.5rem' }, color: product.isOffer ? '#FF6B2B' : T.ink }}>{product.discountedPrice} TND</Typography>
              {product.discount > 0 && <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '1.2rem', color: T.inkFaint, textDecoration: 'line-through' }}>{product.price.toFixed(2)} TND</Typography>}
            </Box>

            {product.size?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ fontFamily: isRTL ? '"Noto Kufi Arabic"' : 'Amaranth, sans-serif', fontWeight: 600, mb: 1, textAlign: isRTL ? 'right' : 'left' }}>{t('common:size', 'Size')}</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  {product.size.map((size) => (
                    <Chip key={size} label={size} onClick={() => handleSizeSelect(size)} icon={selectedSize === size ? <Check /> : undefined}
                      sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, bgcolor: selectedSize === size ? T.ink : alpha(T.ink, 0.04), color: selectedSize === size ? '#fff' : T.ink, '&:hover': { bgcolor: selectedSize === size ? T.ink : alpha(T.ink, 0.1) } }} />
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontFamily: isRTL ? '"Noto Kufi Arabic"' : 'Amaranth, sans-serif', fontWeight: 600, mb: 1, textAlign: isRTL ? 'right' : 'left' }}>{t('product.quantity', 'Quantity')}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <IconButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} sx={{ bgcolor: alpha(T.ink, 0.05), borderRadius: '8px' }}><Remove /></IconButton>
                <TextField value={quantity} onChange={(e) => { const val = parseInt(e.target.value) || 1; setQuantity(Math.max(1, val)); }} inputProps={{ min: 1, style: { textAlign: 'center', fontFamily: 'Amaranth, sans-serif', fontWeight: 700 } }} sx={{ width: 70 }} size="small" />
                <IconButton onClick={() => handleQuantityChange(1)} sx={{ bgcolor: alpha(T.ink, 0.05), borderRadius: '8px' }}><Add /></IconButton>
                {quantity > 1 && <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.85rem', color: T.inkLight, ml: isRTL ? 0 : 1, mr: isRTL ? 1 : 0 }}>{t('product.total', 'Total')}: <strong style={{ color: T.ink }}>{itemTotal.toFixed(2)} TND</strong></Typography>}
              </Box>
            </Box>

            <Box sx={{ mb: 3, p: 1.5, bgcolor: alpha('#4caf50', 0.05), borderRadius: '12px', border: '1px solid', borderColor: alpha('#4caf50', 0.2) }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <LocalShipping sx={{ color: '#4caf50', fontSize: 18 }} />
                <Typography sx={{ fontFamily: isRTL ? '"Noto Kufi Arabic"' : 'Amaranth, sans-serif', fontSize: '0.8rem', color: T.ink }}>
                  {itemTotal >= FREE_SHIPPING_THRESHOLD ? t('product.freeShipping', '🎉 Free shipping on this order!') : t('product.addForFreeShipping', 'Add {{amount}} TND more for free shipping', { amount: (FREE_SHIPPING_THRESHOLD - itemTotal).toFixed(2) })}
                </Typography>
              </Box>
            </Box>

            {product.description && <Typography sx={{ fontFamily: isRTL ? '"Noto Kufi Arabic"' : 'Amaranth, sans-serif', color: T.inkLight, lineHeight: 1.7, mb: 3, textAlign: isRTL ? 'right' : 'left' }}>{product.description}</Typography>}

            <Paper elevation={0} sx={{ p: 3, bgcolor: alpha(T.ink, 0.03), borderRadius: '16px', border: `2px solid ${T.ink}` }}>
              <Button variant="contained" fullWidth size="large" startIcon={isRTL ? null : <ShoppingCart />} endIcon={isRTL ? <ShoppingCart /> : null} onClick={handleAddToCart}
                sx={{ fontFamily: isRTL ? '"Noto Kufi Arabic"' : 'Amaranth, sans-serif', fontWeight: 700, bgcolor: T.ink, borderRadius: '12px', py: 1.5, textTransform: 'none', fontSize: '1rem', '&:hover': { bgcolor: T.inkMid } }}>
                {t('common:addToCart', 'Add to Cart')} {quantity > 1 ? `${quantity} ${t('cart.items', 'items')}` : ''} - {itemTotal.toFixed(2)} TND
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <OrderForm formData={formData} errors={errors} touched={touched} isSubmitting={isSubmitting} submitted={submitted} orderResult={orderResult} onChange={handleChange} onBlur={handleBlur} onSubmit={handleOrderSubmit} itemTotal={itemTotal} quantity={quantity} shippingCost={shippingCost} total={total} t={t} isRTL={isRTL} />
          </Grid>
        </Grid>
      </Container>

      {cartCount > 0 && <Zoom in><Fab onClick={openCart} sx={{ position: 'fixed', bottom: 24, right: isRTL ? 'auto' : 24, left: isRTL ? 24 : 'auto', bgcolor: T.ink }}><Badge badgeContent={cartCount} color="error"><ShoppingCart /></Badge></Fab></Zoom>}
      
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ fontFamily: isRTL ? '"Noto Kufi Arabic"' : 'Amaranth, sans-serif', borderRadius: '12px', fontWeight: 600 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductDetail;
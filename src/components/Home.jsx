// pages/Home.jsx - Full i18n Integration (EN/FR/AR) with Mobile Image Slider
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Container, Typography, Button, Grid, Divider, IconButton,
  Rating, Chip, Stack, Skeleton, Card, CardMedia, CardContent,
  useMediaQuery, useTheme,
} from '@mui/material';
import {
  ArrowForward, ChevronLeft, ChevronRight, LocalShipping,
  Verified, SupportAgent, Star, ShoppingCart, Check,
} from '@mui/icons-material';
import heroImage from '../assets/hero-image.jpg';
import { keyframes } from '@mui/system';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { productService, offerService } from '../services/api';
import { useCart } from '../context/CartContext';

// Category images for mobile slider
import sportCategoryImg from '../assets/product2.jpg';
import streetwearCategoryImg from '../assets/product8.jpg';
import religiousCategoryImg from '../assets/product0.jpg';
import offersCategoryImg from '../assets/p4.jpg';

// ==================== Design Tokens ====================
const T = {
  colors: {
    ink: '#0D0D0D',
    inkLight: '#666',
    inkFaint: '#999',
    white: '#FFFFFF',
    surface: '#FAFAFA',
    accent: '#C8102E',
    sport: '#FF3B30',
    streetwear: '#8B5CF6',
    religious: '#D4AF37',
    offers: '#FF6B2B',
    star: '#F4B400',
  },
  font: {
    display: '"Barlow Condensed", sans-serif',
    body: '"Amaranth", sans-serif',
    ar: '"Noto Kufi Arabic", "Tajawal", sans-serif',
  },
  radius: { xs: 12, sm: 16, lg: 24, pill: 50 },
  shadow: {
    card: '0 2px 16px rgba(0,0,0,0.06)',
    hover: '0 16px 48px rgba(0,0,0,0.12)',
    button: '0 8px 24px rgba(0,0,0,0.2)',
  },
};

// ==================== Animation Variants ====================
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
`;

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

const cardReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
};

// ==================== Mobile Image Slider ====================
// ==================== Mobile Image Slider ====================
const MobileImageSlider = () => {
  const { t, i18n } = useTranslation(['home', 'common']);
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef(null);

  const slides = [
    {
      image: offersCategoryImg,
      title: t('common:offersh'),
      tagline: t('home:categories.offers.tagline', 'Special Deals'),
      color: T.colors.offers,
      path: '/offers',
    },
    {
      image: sportCategoryImg,
      title: t('common:sporth'),
      tagline: t('home:categories.sport.tagline', 'Performance Gear'),
      color: T.colors.sport,
      path: '/sport',
    },
    {
      image: streetwearCategoryImg,
      title: t('common:streetwearh'),
      tagline: t('home:categories.streetwear.tagline', 'Urban Style'),
      color: T.colors.streetwear,
      path: '/streetwear',
    },
    {
      image: religiousCategoryImg,
      title: t('common:religioush'),
      tagline: t('home:categories.religious.tagline', 'Modest Fashion'),
      color: T.colors.religious,
      path: '/religious',
    },
  ];

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-play
  useEffect(() => {
    if (!isHovered) {
      autoPlayRef.current = setInterval(goToNext, 4000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isHovered, goToNext]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <Box
      sx={{
        display: { xs: 'block', md: 'none' },
        direction: isRTL ? 'rtl' : 'ltr',
        mt: -14,
        ml: -1,
        mr: -1,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          maxHeight: '100svh',
          borderRadius: 0,
          overflow: 'hidden',
          boxShadow: 'none',
        }}
      >
        {/* Slide Container */}
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
          <AnimatePresence initial={false} custom={currentSlide}>
            <motion.div
              key={currentSlide}
              custom={currentSlide}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.25 },
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            >
              <Box
                onClick={() => navigate(slides[currentSlide].path)}
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                  '&:active': { transform: 'scale(0.98)' },
                  transition: 'transform 0.2s ease',
                }}
              >
                {/* Background Image */}
                <Box
                  component="img"
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Darker Gradient Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.15) 100%)',
                  }}
                />

                {/* Centered Content */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    px: 4,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  {/* Title */}
                  <Typography
                    sx={{
                      fontFamily: isRTL ? T.font.ar : T.font.display,
                      fontWeight: 900,
                      fontSize: { xs: '2.8rem', sm: '3.5rem' },
                      color: T.colors.white,
                      textTransform: 'uppercase',
                      letterSpacing: isRTL ? '0' : '0.04em',
                      lineHeight: 1,
                      textShadow: '0 4px 20px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)',
                    }}
                  >
                    {slides[currentSlide].title}
                  </Typography>

                  {/* Tagline */}
                  <Typography
                    sx={{
                      fontFamily: isRTL ? T.font.ar : T.font.body,
                      fontWeight: 700,
                      fontSize: { xs: '1.1rem', sm: '1.3rem' },
                      color: 'rgba(255,255,255,0.95)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                      maxWidth: '80%',
                    }}
                  >
                    {slides[currentSlide].tagline}
                  </Typography>

                  {/* Button */}
                  <Button
                    variant="contained"
                    size="large"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(slides[currentSlide].path);
                    }}
                    sx={{
                      mt: 1,
                      fontFamily: isRTL ? T.font.ar : T.font.display,
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      bgcolor: T.colors.white,
                      color: slides[currentSlide].color,
                      borderRadius: '50px',
                      px: 4,
                      py: 1.4,
                      minWidth: 180,
                      boxShadow: '0 6px 30px rgba(0,0,0,0.4), 0 2px 12px rgba(0,0,0,0.3)',
                      border: '2px solid transparent',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: 'transparent',
                        color: T.colors.white,
                        border: `2px solid ${T.colors.white}`,
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                      },
                      '&:active': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                      },
                    }}
                  >
                    {t('common:shopNow')}
                    <ArrowForward sx={{ ml: 1, fontSize: '1.1rem', transition: 'transform 0.3s ease', '.MuiButton-root:hover &': { transform: 'translateX(4px)' } }} />
                  </Button>
                </Box>
              </Box>
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Navigation Arrows */}
        <IconButton
          onClick={goToPrev}
          sx={{
            position: 'absolute',
            left: isRTL ? 'auto' : 12,
            right: isRTL ? 12 : 'auto',
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255,255,255,0.15)',
            color: T.colors.white,
            width: 44,
            height: 44,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.3)',
              transform: 'translateY(-50%) scale(1.1)',
            },
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: 2,
            transition: 'all 0.3s ease',
          }}
        >
          {isRTL ? <ChevronRight sx={{ fontSize: 30 }} /> : <ChevronLeft sx={{ fontSize: 30 }} />}
        </IconButton>

        <IconButton
          onClick={goToNext}
          sx={{
            position: 'absolute',
            right: isRTL ? 'auto' : 12,
            left: isRTL ? 12 : 'auto',
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(255,255,255,0.15)',
            color: T.colors.white,
            width: 44,
            height: 44,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.3)',
              transform: 'translateY(-50%) scale(1.1)',
            },
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: 2,
            transition: 'all 0.3s ease',
          }}
        >
          {isRTL ? <ChevronLeft sx={{ fontSize: 30 }} /> : <ChevronRight sx={{ fontSize: 30 }} />}
        </IconButton>

        {/* Dots Indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1.5,
            zIndex: 2,
          }}
        >
          {slides.map((_, index) => (
            <Box
              key={index}
              onClick={() => goToSlide(index)}
              sx={{
                width: index === currentSlide ? 32 : 10,
                height: 10,
                borderRadius: '5px',
                bgcolor: index === currentSlide ? T.colors.white : 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: index === currentSlide ? '0 0 12px rgba(255,255,255,0.6)' : 'none',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.7)',
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

// ==================== Fetch Hooks ====================
const useCategoryProducts = (category, limit = 3) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await productService.getProducts({ category, status: 'active', limit, sortBy: 'createdAt', sortOrder: 'desc' });
        if (res.data.success) setProducts(res.data.data.slice(0, limit));
      } catch (err) { console.error(`Error fetching ${category}:`, err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [category, limit]);
  return { products, loading };
};

const useOffers = (limit = 3) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await offerService.getOffers({ status: 'active', limit, sortBy: 'createdAt', sortOrder: 'desc' });
        if (res.data.success) setOffers(res.data.data.slice(0, limit));
      } catch (err) { console.error('Error fetching offers:', err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [limit]);
  return { offers, loading };
};

// ==================== Dynamic Product Card ====================
const DynamicProductCard = ({ item, isOffer = false, onAddToCart, onView }) => {
  const { t, i18n } = useTranslation(['common']);
  const isRTL = i18n.language === 'ar';
  const mainImage = item.mainImage?.url || item.mainImage || 'https://via.placeholder.com/400x400';
  const price = isOffer ? item.mainPrice : item.price;
  const discount = item.discount || 0;
  const discountedPrice = isOffer ? item.discountedPrice || (price * (1 - discount / 100)).toFixed(2) : discount > 0 ? (price * (1 - discount / 100)).toFixed(2) : price.toFixed(2);
  const rating = item.review || 0;
  const sizes = isOffer ? item.sizes || [] : item.size || [];
  const accentColor = isOffer ? T.colors.offers : T.colors.accent;

  const handleCardClick = () => onView(item);
  const handleAddToCartClick = (e) => {
    e.preventDefault(); e.stopPropagation(); e.nativeEvent.stopImmediatePropagation();
    onAddToCart(item);
  };

  return (
    <motion.div variants={cardReveal} whileHover={{ y: -6 }} style={{ height: '100%' }}>
      <Card onClick={handleCardClick} elevation={0}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', bgcolor: T.colors.white, border: '1px solid rgba(0,0,0,0.06)', boxShadow: T.shadow.card, transition: 'all 0.35s', '&:hover': { boxShadow: T.shadow.hover, '& .product-img': { transform: 'scale(1.06)' }, '& .product-quick-view': { opacity: 1, transform: 'translateY(0)' } } }}>
        <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden', bgcolor: '#f5f5f5' }}>
          <CardMedia component="img" image={mainImage} alt={item.name} className="product-img"
            sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400'; }} />
          <Box className="product-quick-view" sx={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translate(-50%, 10px)', opacity: 0, transition: 'all 0.3s ease', zIndex: 2 }}>
            <Button variant="contained" size="small" onClick={(e) => { e.preventDefault(); e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); handleCardClick(); }}
              sx={{ fontFamily: T.font.display, fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', bgcolor: T.colors.white, color: T.colors.ink, borderRadius: '50px', px: 2, py: 0.6, '&:hover': { bgcolor: T.colors.ink, color: T.colors.white } }}>
              {t('common:quickView')}
            </Button>
          </Box>
          {discount > 0 && <Chip label={`-${discount}%`} size="small" sx={{ position: 'absolute', top: 10, left: isRTL ? 'auto' : 10, right: isRTL ? 10 : 'auto', fontFamily: T.font.display, fontWeight: 800, fontSize: '0.7rem', bgcolor: accentColor, color: '#fff', borderRadius: '6px', height: 24, zIndex: 2 }} />}
          {isOffer && <Chip label={t('common:offersh')} size="small" sx={{ position: 'absolute', top: 10, right: isRTL ? 'auto' : 10, left: isRTL ? 10 : 'auto', fontFamily: T.font.display, fontWeight: 800, fontSize: '0.62rem', bgcolor: T.colors.offers, color: '#fff', borderRadius: '6px', height: 22, zIndex: 2 }} />}
          <Box sx={{ position: 'absolute', top: discount > 0 ? 42 : 10, left: isRTL ? 'auto' : 10, right: isRTL ? 10 : 'auto', bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: '20px', px: 1, py: 0.3, display: 'flex', alignItems: 'center', gap: 0.3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 2 }}>
            <Star sx={{ fontSize: '0.7rem', color: T.colors.star }} />
            <Typography sx={{ fontFamily: T.font.body, fontSize: '0.65rem', fontWeight: 700, color: T.colors.ink }}>{rating}</Typography>
          </Box>
        </Box>
        <CardContent sx={{ p: { xs: 1.5, md: 2 }, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
          <Typography sx={{ fontFamily: isRTL ? T.font.ar : T.font.body, fontSize: { xs: '0.8rem', md: '0.9rem' }, fontWeight: 700, color: T.colors.ink, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Rating value={rating} precision={0.5} readOnly size="small" sx={{ color: T.colors.star, fontSize: '0.75rem' }} />
            <Typography sx={{ fontFamily: T.font.body, fontSize: '0.62rem', color: T.colors.inkFaint }}>({rating})</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Typography sx={{ fontFamily: T.font.display, fontSize: { xs: '1rem', md: '1.1rem' }, fontWeight: 700, color: accentColor }}>{discountedPrice} {t('common:currency')}</Typography>
            {discount > 0 && <Typography sx={{ fontFamily: T.font.body, fontSize: '0.7rem', color: T.colors.inkFaint, textDecoration: 'line-through' }}>{price.toFixed(2)}</Typography>}
          </Box>
          {sizes.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.4, flexWrap: 'wrap', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              {sizes.slice(0, 3).map((s) => (
                <Chip key={s} label={s} size="small" onClick={(e) => { e.preventDefault(); e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
                  sx={{ fontFamily: T.font.display, fontWeight: 700, fontSize: '0.55rem', height: 20, bgcolor: '#f5f5f5', color: T.colors.inkLight, borderRadius: '4px', '&:hover': { bgcolor: T.colors.ink, color: T.colors.white } }} />
              ))}
            </Box>
          )}
          <Button variant="contained" fullWidth size="small"
            startIcon={isRTL ? null : <ShoppingCart sx={{ fontSize: '0.85rem' }} />}
            endIcon={isRTL ? <ShoppingCart sx={{ fontSize: '0.85rem' }} /> : null}
            onClick={handleAddToCartClick}
            sx={{ mt: 'auto', fontFamily: isRTL ? T.font.ar : T.font.display, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', bgcolor: T.colors.ink, color: '#fff', borderRadius: '10px', py: 0.9, '&:hover': { bgcolor: isOffer ? T.colors.offers : T.colors.accent, transform: 'translateY(-1px)' } }}>
            {t('common:addToCart')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ==================== Category Section ====================
const CategorySection = ({ title, items, loading, isOffer, accent, onAddToCart, onView, onViewAll }) => {
  const { t, i18n } = useTranslation(['common', 'home']);
  const isRTL = i18n.language === 'ar';
  return (
    <Box sx={{ mb: { xs: 6, md: 10 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, pb: 2, borderBottom: '1px solid rgba(0,0,0,0.06)', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        <Box sx={{ textAlign: isRTL ? 'right' : 'left' }}>
          <Typography sx={{ fontFamily: isRTL ? T.font.ar : T.font.display, fontSize: { xs: '1.6rem', md: '2.2rem' }, fontWeight: 900, color: T.colors.ink, textTransform: 'uppercase', letterSpacing: isRTL ? '0' : '-0.02em', lineHeight: 1 }}>{title}</Typography>
          <Box sx={{ width: 40, height: 3, bgcolor: accent, borderRadius: '2px', mt: 0.75, ml: isRTL ? 'auto' : 0, mr: isRTL ? 0 : 'auto' }} />
        </Box>
        <Button endIcon={<ArrowForward sx={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />} onClick={onViewAll}
          sx={{ fontFamily: T.font.display, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', color: accent, textTransform: 'uppercase', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline', textUnderlineOffset: '4px' } }}>
          {t('common:viewAll')}
        </Button>
      </Box>
      {loading ? (
        <Grid container spacing={2}>{[1,2,3].map((i) => (<Grid size={{ xs: 6, sm: 4 }} key={i}><Skeleton variant="rounded" height={220} sx={{ borderRadius: '16px', mb: 1 }} /><Skeleton variant="text" width="80%" height={20} /><Skeleton variant="text" width="50%" height={16} /><Skeleton variant="rounded" height={36} sx={{ mt: 1, borderRadius: '10px' }} /></Grid>))}</Grid>
      ) : items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, bgcolor: T.colors.surface, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)' }}>
          <Typography sx={{ fontFamily: isRTL ? T.font.ar : T.font.body, fontSize: '0.9rem', color: T.colors.inkFaint }}>{t('common:noProducts')}</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>{items.map((item) => (<Grid size={{ xs: 6, sm: 4 }} key={item._id}><DynamicProductCard item={item} isOffer={isOffer} onAddToCart={onAddToCart} onView={onView} /></Grid>))}</Grid>
      )}
    </Box>
  );
};

// ==================== MAIN HOME COMPONENT ====================
const Home = () => {
  const { t, i18n } = useTranslation(['home', 'common']);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const isRTL = i18n.language === 'ar';

  const sport = useCategoryProducts('Sport', 3);
  const streetwear = useCategoryProducts('Streetwear', 3);
  const religious = useCategoryProducts('Religious', 3);
  const { offers, loading: offersLoading } = useOffers(3);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [isRTL, i18n.language]);

  const handleAddToCart = (item) => {
    const size = item.size?.[0] || item.sizes?.[0] || 'M';
    addToCart(item, 1, size);
    setSnackbar({ open: true, message: `${item.name} ${t('home:addedToCart')}` });
    setTimeout(() => setSnackbar({ open: false, message: '' }), 3000);
  };

  const handleViewProduct = (item) => {
    navigate(`/product/${item._id}`, { state: { product: item } });
  };

  return (
    <Box sx={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Mobile Slider - starts from exact top, full width, full height */}
      <MobileImageSlider />

      {/* HERO SECTION - Hidden on mobile, visible on tablet/desktop */}
      <Box sx={{ bgcolor: T.colors.white, pt: { xs: 0, md: 4 }, pb: { xs: 4, md: 8 }, display: { xs: 'none', md: 'block' } }}>
        <Container maxWidth="lg">
          <Grid container alignItems="center" spacing={{ xs: 2, md: 4 }} direction={isRTL ? 'row-reverse' : 'row'}>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                <Box sx={{ textAlign: isRTL ? 'right' : 'left' }}>
                  <motion.div variants={fadeInUp}>
                    <Typography sx={{ fontFamily: isRTL ? T.font.ar : T.font.body, fontSize: { xs: '0.85rem', md: '1rem' }, fontWeight: 700, color: T.colors.inkLight, letterSpacing: '0.15em', mb: 0.5, textTransform: 'uppercase' }}>
                      {t('home:hero.brand')}
                    </Typography>
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <Typography sx={{ fontFamily: isRTL ? T.font.ar : T.font.display, fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' }, fontWeight: 900, color: T.colors.ink, lineHeight: 0.95, letterSpacing: isRTL ? '0' : '-0.03em', textTransform: 'uppercase', mb: 1 }}>
                      {t('home:hero.title')}
                    </Typography>
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <Typography sx={{ fontFamily: isRTL ? T.font.ar : T.font.body, fontSize: { xs: '0.9rem', md: '1.1rem' }, fontWeight: 600, color: T.colors.ink, mb: 3 }}>
                      {t('home:hero.saveUpTo')}{' '}
                      <Box component="span" sx={{ color: T.colors.accent, display: 'inline-block', animation: `${pulse} 1.5s ease-in-out infinite`, fontWeight: 800 }}>20%</Box>{' '}
                      {t('home:hero.forAllItems')}
                    </Typography>
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <Typography sx={{ fontFamily: isRTL ? T.font.ar : T.font.display, fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 900, color: T.colors.ink, textTransform: 'uppercase', letterSpacing: isRTL ? '0' : '-0.02em', mb: 1 }}>
                      {t('home:hero.tagline')}{' '}
                      <Box component="span" sx={{ color: T.colors.accent }}>{t('home:hero.brand')}</Box>
                    </Typography>
                  </motion.div>
                  <motion.div variants={fadeInUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="contained" disableElevation
                      endIcon={isRTL ? null : <ArrowForward />}
                      startIcon={isRTL ? <ArrowForward sx={{ transform: 'rotate(180deg)' }} /> : null}
                      href="/offers"
                      sx={{ mt: 2, fontFamily: isRTL ? T.font.ar : T.font.display, fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase', bgcolor: T.colors.ink, color: T.colors.white, px: 4, py: 1.5, borderRadius: '50px', boxShadow: T.shadow.button, '&:hover': { bgcolor: T.colors.accent, transform: 'translateY(-3px)' } }}>
                      {t('home:hero.shopNow')}
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div initial={{ opacity: 0, x: isRTL ? -60 : 60, rotateY: isRTL ? 10 : -10 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} transition={{ duration: 0.8 }}>
                <Box component="img" src={heroImage} alt="Tawakkol Hero" sx={{ width: '100%', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))' }} />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* COLLECTIONS SECTION */}
      <Box sx={{ bgcolor: T.colors.white, py: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 } }}>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Typography sx={{ fontFamily: isRTL ? T.font.ar : T.font.display, fontSize: { xs: '2rem', md: '3.5rem', lg: '4.5rem' }, fontWeight: 900, color: T.colors.ink, textTransform: 'uppercase', letterSpacing: isRTL ? '0' : '-0.03em', lineHeight: 1, mb: 1 }}>
                {t('home:collections.title')}
              </Typography>
              <Typography sx={{ fontFamily: isRTL ? T.font.ar : T.font.body, fontSize: { xs: '0.85rem', md: '1rem' }, color: T.colors.inkLight, fontStyle: isRTL ? 'normal' : 'italic' }}>
                {t('home:collections.subtitle')}
              </Typography>
              <Divider sx={{ width: '60px', height: '3px', bgcolor: T.colors.accent, borderRadius: '2px', mx: 'auto', mt: 1.5 }} />
            </motion.div>
          </Box>

          <CategorySection title={t('common:sporth')} items={sport.products} loading={sport.loading} accent={T.colors.sport} onAddToCart={handleAddToCart} onView={handleViewProduct} onViewAll={() => navigate('/sport')} />
          <CategorySection title={t('common:streetwearh')} items={streetwear.products} loading={streetwear.loading} accent={T.colors.streetwear} onAddToCart={handleAddToCart} onView={handleViewProduct} onViewAll={() => navigate('/streetwear')} />
          <CategorySection title={t('common:religioush')} items={religious.products} loading={religious.loading} accent={T.colors.religious} onAddToCart={handleAddToCart} onView={handleViewProduct} onViewAll={() => navigate('/religious')} />
          <CategorySection title={t('common:offersh')} items={offers} loading={offersLoading} isOffer accent={T.colors.offers} onAddToCart={handleAddToCart} onView={handleViewProduct} onViewAll={() => navigate('/offers')} />

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button variant="outlined"
                endIcon={<ArrowForward sx={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />}
                href="/offers"
                sx={{ fontFamily: isRTL ? T.font.ar : T.font.display, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: T.colors.ink, borderColor: T.colors.ink, borderWidth: '2px', px: 4, py: 1.3, borderRadius: '50px', '&:hover': { borderColor: T.colors.accent, color: T.colors.accent, borderWidth: '2px', transform: 'translateY(-3px)' } }}>
                {t('home:viewAllProducts')}
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* FEATURES SECTION */}
      <Box sx={{ bgcolor: T.colors.surface, py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            {[
              { icon: LocalShipping, key: 'shipping' },
              { icon: Verified, key: 'quality' },
              { icon: SupportAgent, key: 'support' },
            ].map((feat, i) => (
              <Grid size={{ xs: 12, sm: 4 }} key={i}>
                <Box sx={{ textAlign: 'center', p: 3, transition: 'all 0.3s ease', '&:hover .feat-icon': { transform: 'scale(1.1)', color: T.colors.accent } }}>
                  <feat.icon className="feat-icon" sx={{ fontSize: '2rem', color: T.colors.ink, mb: 1, transition: 'all 0.3s ease' }} />
                  <Typography sx={{ fontFamily: isRTL ? T.font.ar : T.font.body, fontSize: '0.75rem', fontWeight: 600, color: T.colors.inkLight, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.3 }}>
                    {t(`home:features.${feat.key}.label`)}
                  </Typography>
                  <Typography sx={{ fontFamily: T.font.display, fontSize: '1.3rem', fontWeight: 800, color: T.colors.accent, mb: 0.3 }}>
                    {t(`home:features.${feat.key}.value`)}
                  </Typography>
                  <Typography sx={{ fontFamily: isRTL ? T.font.ar : T.font.body, fontSize: '0.75rem', color: T.colors.inkFaint }}>
                    {t(`home:features.${feat.key}.desc`)}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* TOAST */}
      {snackbar.open && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
          style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 10000 }}>
          <Box sx={{ bgcolor: T.colors.ink, color: T.colors.white, fontFamily: isRTL ? T.font.ar : T.font.body, fontWeight: 600, fontSize: '0.85rem', px: 3, py: 1.5, borderRadius: '50px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 1, direction: isRTL ? 'rtl' : 'ltr' }}>
            <Check sx={{ fontSize: '1rem', color: '#4CAF50' }} />
            {snackbar.message}
          </Box>
        </motion.div>
      )}
    </Box>
  );
};

export default Home;
import React, { useState, useEffect } from 'react';
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
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { productService, offerService } from '../services/api';
import { useCart } from '../context/CartContext';
import product1 from '../assets/product1.jpg';
import product2 from '../assets/product2.jpg';
import product3 from '../assets/product3.jpg';
import product4 from '../assets/product4.jpg';
import product5 from '../assets/product5.jpg';
import product6 from '../assets/product6.jpg';
import product7 from '../assets/product7.jpg';
import product8 from '../assets/product8.jpg';

// Category images for mobile nav
import sportCategoryImg from '../assets/p1.jpg';
import streetwearCategoryImg from '../assets/p2.jpg';
import religiousCategoryImg from '../assets/p3.jpg';

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

// ==================== Category Navigation (Mobile Only) ====================
const CategoryNavCards = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: 'Sport',
      image: sportCategoryImg,
      color: T.colors.sport,
      gradient: 'transparent',
      path: '/sport',
      tagline: 'Performance Gear',
    },
    {
      name: 'Streetwear',
      image: streetwearCategoryImg,
      color: T.colors.streetwear,
      gradient: 'transparent',
      path: '/streetwear',
      tagline: 'Urban Style',
    },
    {
      name: 'Religious',
      image: religiousCategoryImg,
      color: T.colors.religious,
      gradient: 'transparent',
      path: '/religious',
      tagline: 'Essential Collection',
    },
  ];

  return (
    <Box
      sx={{
        display: { xs: 'grid', md: 'none' },
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr auto',
        gap: 1.5,
        mt: 6,
      }}
    >
      {/* Top row: 2 square cards side by side */}
      {categories.slice(0, 2).map((cat) => (
        <Box
          key={cat.name}
          onClick={() => navigate(cat.path)}
          sx={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            cursor: 'pointer',
            aspectRatio: '1/1',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            '&:hover .cat-img': { transform: 'scale(1.1)' },
            '&:hover .cat-overlay': { opacity: 1 },
            '&:active': { transform: 'scale(0.98)' },
            transition: 'transform 0.2s ease',
          }}
        >
          {/* Background Image */}
          <Box
            component="img"
            src={cat.image}
            alt={cat.name}
            className="cat-img"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
            }}
          />

          {/* Gradient Overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: cat.gradient,
              zIndex: 1,
            }}
          />

          {/* Content */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: T.font.display,
                fontWeight: 900,
                fontSize: '1.6rem',
                color: T.colors.white,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                lineHeight: 1.1,
                mb: 0.5,
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {cat.name}
            </Typography>
            <Typography
              sx={{
                fontFamily: T.font.body,
                fontWeight: 500,
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.85)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {cat.tagline}
            </Typography>
          </Box>

          {/* Hover Overlay */}
          <Box
            className="cat-overlay"
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              background: 'rgba(0,0,0,0.3)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                bgcolor: T.colors.white,
                color: cat.color,
                fontFamily: T.font.display,
                fontWeight: 800,
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                px: 2.5,
                py: 1,
                borderRadius: '50px',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              Shop Now
              <ArrowForward sx={{ fontSize: '0.9rem' }} />
            </Box>
          </Box>
        </Box>
      ))}

      {/* Bottom row: 1 wide card */}
      {categories.slice(2, 3).map((cat) => (
        <Box
          key={cat.name}
          onClick={() => navigate(cat.path)}
          sx={{
            position: 'relative',
            gridColumn: '1 / -1',
            borderRadius: '16px',
            overflow: 'hidden',
            cursor: 'pointer',
            height: 110,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            '&:hover .cat-img': { transform: 'scale(1.08)' },
            '&:hover .cat-overlay': { opacity: 1 },
            '&:active': { transform: 'scale(0.98)' },
            transition: 'transform 0.2s ease',
          }}
        >
          {/* Background Image */}
          <Box
            component="img"
            src={cat.image}
            alt={cat.name}
            className="cat-img"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 40%',
              transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
            }}
          />

          {/* Gradient Overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: cat.gradient,
              zIndex: 1,
            }}
          />

          {/* Content */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              px: 3,
            }}
          >
            <Typography
              sx={{
                fontFamily: T.font.display,
                fontWeight: 900,
                fontSize: '1.5rem',
                color: T.colors.white,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {cat.name}
            </Typography>
            <Typography
              sx={{
                fontFamily: T.font.body,
                fontWeight: 500,
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.85)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {cat.tagline}
            </Typography>
          </Box>

          {/* Hover Overlay */}
          <Box
            className="cat-overlay"
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              background: 'rgba(0,0,0,0.3)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                bgcolor: T.colors.white,
                color: cat.color,
                fontFamily: T.font.display,
                fontWeight: 800,
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                px: 2.5,
                py: 1,
                borderRadius: '50px',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              Shop Now
              <ArrowForward sx={{ fontSize: '0.9rem' }} />
            </Box>
          </Box>
        </Box>
      ))}
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
        const res = await productService.getProducts({
          category,
          status: 'active',
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        if (res.data.success) setProducts(res.data.data.slice(0, limit));
      } catch (err) {
        console.error(`Error fetching ${category}:`, err);
      } finally {
        setLoading(false);
      }
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
        const res = await offerService.getOffers({
          status: 'active',
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        if (res.data.success) setOffers(res.data.data.slice(0, limit));
      } catch (err) {
        console.error('Error fetching offers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [limit]);

  return { offers, loading };
};

// ==================== Dynamic Product Card ====================
const DynamicProductCard = ({ item, isOffer = false, onAddToCart, onView }) => {
  const mainImage = item.mainImage?.url || item.mainImage || 'https://via.placeholder.com/400x400';
  const price = isOffer ? item.mainPrice : item.price;
  const discount = item.discount || 0;
  const discountedPrice = isOffer
    ? item.discountedPrice || (price * (1 - discount / 100)).toFixed(2)
    : discount > 0
      ? (price * (1 - discount / 100)).toFixed(2)
      : price.toFixed(2);
  const rating = item.review || 0;
  const sizes = isOffer ? item.sizes || [] : item.size || [];
  const accentColor = isOffer ? T.colors.offers : T.colors.accent;

  // ✅ Create a dedicated handler for the card click (view product)
  const handleCardClick = () => {
    onView(item);
  };

  // ✅ Create a dedicated handler for add to cart that stops propagation
  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation(); // Extra safety
    onAddToCart(item);
  };

  return (
    <motion.div variants={cardReveal} whileHover={{ y: -6 }} style={{ height: '100%' }}>
      <Card
        onClick={handleCardClick} // ✅ Uses dedicated handler
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          bgcolor: T.colors.white,
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: T.shadow.card,
          transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
          '&:hover': {
            boxShadow: T.shadow.hover,
            '& .product-img': { transform: 'scale(1.06)' },
            '& .product-quick-view': { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        {/* Image Container */}
        <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden', bgcolor: '#f5f5f5' }}>
          <CardMedia
            component="img"
            image={mainImage}
            alt={item.name}
            className="product-img"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
            }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400';
            }}
          />

          {/* Quick View Button */}
          <Box
            className="product-quick-view"
            sx={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translate(-50%, 10px)',
              opacity: 0,
              transition: 'all 0.3s ease',
              zIndex: 2,
            }}
          >
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                handleCardClick();
              }}
              sx={{
                fontFamily: T.font.display,
                fontWeight: 700,
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                bgcolor: T.colors.white,
                color: T.colors.ink,
                borderRadius: '50px',
                px: 2,
                py: 0.6,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: T.colors.ink, color: T.colors.white },
              }}
            >
              Quick View
            </Button>
          </Box>

          {/* Discount Badge */}
          {discount > 0 && (
            <Chip
              label={`-${discount}%`}
              size="small"
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                fontFamily: T.font.display,
                fontWeight: 800,
                fontSize: '0.7rem',
                letterSpacing: '0.04em',
                bgcolor: accentColor,
                color: T.colors.white,
                borderRadius: '6px',
                height: 24,
                zIndex: 2,
              }}
            />
          )}

          {/* Offer Badge */}
          {isOffer && (
            <Chip
              label="OFFER"
              size="small"
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                fontFamily: T.font.display,
                fontWeight: 800,
                fontSize: '0.62rem',
                letterSpacing: '0.06em',
                bgcolor: T.colors.offers,
                color: T.colors.white,
                borderRadius: '6px',
                height: 22,
                zIndex: 2,
              }}
            />
          )}

          {/* Rating Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: discount > 0 ? 42 : 10,
              left: 10,
              bgcolor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: '20px',
              px: 1,
              py: 0.3,
              display: 'flex',
              alignItems: 'center',
              gap: 0.3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              zIndex: 2,
            }}
          >
            <Star sx={{ fontSize: '0.7rem', color: T.colors.star }} />
            <Typography sx={{ fontFamily: T.font.body, fontSize: '0.65rem', fontWeight: 700, color: T.colors.ink }}>
              {rating}
            </Typography>
          </Box>
        </Box>

        {/* Content */}
        <CardContent
          sx={{
            p: { xs: 1.5, md: 2 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.4,
          }}
        >
          <Typography
            sx={{
              fontFamily: T.font.body,
              fontSize: { xs: '0.8rem', md: '0.9rem' },
              fontWeight: 700,
              color: T.colors.ink,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {item.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Rating value={rating} precision={0.5} readOnly size="small" sx={{ color: T.colors.star, fontSize: '0.75rem' }} />
            <Typography sx={{ fontFamily: T.font.body, fontSize: '0.62rem', color: T.colors.inkFaint }}>
              ({rating})
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
            <Typography
              sx={{
                fontFamily: T.font.display,
                fontSize: { xs: '1rem', md: '1.1rem' },
                fontWeight: 700,
                color: accentColor,
                letterSpacing: '-0.01em',
              }}
            >
              {discountedPrice} TND
            </Typography>
            {discount > 0 && (
              <Typography
                sx={{
                  fontFamily: T.font.body,
                  fontSize: '0.7rem',
                  color: T.colors.inkFaint,
                  textDecoration: 'line-through',
                }}
              >
                {price.toFixed(2)}
              </Typography>
            )}
          </Box>

          {sizes.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.4, flexWrap: 'wrap' }}>
              {sizes.slice(0, 3).map((s) => (
                <Chip
                  key={s}
                  label={s}
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                  }}
                  sx={{
                    fontFamily: T.font.display,
                    fontWeight: 700,
                    fontSize: '0.55rem',
                    letterSpacing: '0.04em',
                    height: 20,
                    bgcolor: '#f5f5f5',
                    color: T.colors.inkLight,
                    borderRadius: '4px',
                    '&:hover': { bgcolor: T.colors.ink, color: T.colors.white },
                  }}
                />
              ))}
            </Box>
          )}

          <Button
            variant="contained"
            fullWidth
            size="small"
            startIcon={<ShoppingCart sx={{ fontSize: '0.85rem' }} />}
            onClick={handleAddToCartClick} // ✅ Uses dedicated handler with proper event stopping
            sx={{
              mt: 'auto',
              fontFamily: T.font.display,
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              bgcolor: T.colors.ink,
              color: T.colors.white,
              borderRadius: '10px',
              py: 0.9,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: isOffer ? T.colors.offers : T.colors.accent,
                transform: 'translateY(-1px)',
              },
            }}
          >
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ==================== Category Section ====================
const CategorySection = ({ title, items, loading, isOffer, accent, onAddToCart, onView, onViewAll }) => (
  <Box sx={{ mb: { xs: 6, md: 10 } }}>
    {/* Section Header */}
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        mb: 3,
        pb: 2,
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <Box>
        <Typography
          sx={{
            fontFamily: T.font.display,
            fontSize: { xs: '1.6rem', md: '2.2rem' },
            fontWeight: 900,
            color: T.colors.ink,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {title}
        </Typography>
        <Box sx={{ width: 40, height: 3, bgcolor: accent, borderRadius: '2px', mt: 0.75 }} />
      </Box>
      <Button
        endIcon={<ArrowForward />}
        onClick={onViewAll}
        sx={{
          fontFamily: T.font.display,
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '0.08em',
          color: accent,
          textTransform: 'uppercase',
          pb: 0.5,
          '&:hover': { bgcolor: 'transparent', textDecoration: 'underline', textUnderlineOffset: '4px' },
        }}
      >
        View All
      </Button>
    </Box>

    {/* Content */}
    {loading ? (
      <Grid container spacing={2}>
        {[1, 2, 3].map((i) => (
          <Grid size={{ xs: 6, sm: 4 }} key={i}>
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: '16px', mb: 1 }} />
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="50%" height={16} />
            <Skeleton variant="rounded" height={36} sx={{ mt: 1, borderRadius: '10px' }} />
          </Grid>
        ))}
      </Grid>
    ) : items.length === 0 ? (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          bgcolor: T.colors.surface,
          borderRadius: '16px',
          border: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        <Typography sx={{ fontFamily: T.font.body, fontSize: '0.9rem', color: T.colors.inkFaint }}>
          No {title.toLowerCase()} available yet.
        </Typography>
      </Box>
    ) : (
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid size={{ xs: 6, sm: 4 }} key={item._id}>
            <DynamicProductCard item={item} isOffer={isOffer} onAddToCart={onAddToCart} onView={onView} />
          </Grid>
        ))}
      </Grid>
    )}
  </Box>
);

// ==================== MAIN HOME COMPONENT ====================
const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const sport = useCategoryProducts('Sport', 3);
  const streetwear = useCategoryProducts('Streetwear', 3);
  const religious = useCategoryProducts('Religious', 3);
  const { offers, loading: offersLoading } = useOffers(3);

  const handleAddToCart = (item) => {
    const size = item.size?.[0] || item.sizes?.[0] || 'M';
    addToCart(item, 1, size);
    setSnackbar({ open: true, message: `${item.name} added to cart!` });
    setTimeout(() => setSnackbar({ open: false, message: '' }), 3000);
  };

  const handleViewProduct = (item) => {
    navigate(`/product/${item._id}`, { state: { product: item } });
  };

  return (
    <>
      {/* ==================== HERO SECTION ==================== */}
      <Box sx={{ bgcolor: T.colors.white, pt: { xs: 2, md: 4 }, pb: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container alignItems="center" spacing={{ xs: 2, md: 4 }}>
            {/* Left Content */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                <Box>
                  <motion.div variants={fadeInUp}>
                    <Typography
                      sx={{
                        fontFamily: T.font.body,
                        fontSize: { xs: '0.85rem', md: '1rem' },
                        fontWeight: 700,
                        color: T.colors.inkLight,
                        letterSpacing: '0.15em',
                        mb: 0.5,
                        textTransform: 'uppercase',
                      }}
                    >
                      Tawakkol
                    </Typography>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <Typography
                      sx={{
                        fontFamily: T.font.display,
                        fontSize: { xs: '2.5rem', md: '4rem', lg: '4rem' },
                        fontWeight: 900,
                        color: T.colors.ink,
                        lineHeight: 0.95,
                        letterSpacing: '-0.03em',
                        textTransform: 'uppercase',
                        mb: 1,
                      }}
                    >
                      New Mentality
                      Drop
                    </Typography>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <Typography
                      sx={{
                        fontFamily: T.font.body,
                        fontSize: { xs: '0.9rem', md: '1.1rem' },
                        fontWeight: 600,
                        color: T.colors.ink,
                        mb: 3,
                      }}
                    >
                      SAVE UP TO{' '}
                      <Box
                        component="span"
                        sx={{
                          color: T.colors.accent,
                          display: 'inline-block',
                          animation: `${pulse} 1.5s ease-in-out infinite`,
                          fontWeight: 800,
                        }}
                      >
                        20%
                      </Box>{' '}
                      FOR ALL ITEMS
                    </Typography>
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <Typography
                      sx={{
                        fontFamily: T.font.display,
                        fontSize: { xs: '2rem', md: '3rem' },
                        fontWeight: 900,
                        color: T.colors.ink,
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em',
                        mb: 1,
                      }}
                    >
                      BE YOU. BE WITH{' '}
                      <Box component="span" sx={{ color: T.colors.accent }}>
                        TAWAKKUL
                      </Box>
                    </Typography>
                  </motion.div>

                  <motion.div variants={fadeInUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="contained"
                      disableElevation
                      endIcon={<ArrowForward />}
                      href="/offers"
                      sx={{
                        mt: 2,
                        fontFamily: T.font.display,
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        bgcolor: T.colors.ink,
                        color: T.colors.white,
                        px: 4,
                        py: 1.5,
                        borderRadius: '50px',
                        boxShadow: T.shadow.button,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: T.colors.accent,
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 32px rgba(200,16,46,0.3)',
                        },
                      }}
                    >
                      Shop Now
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>

            {/* Right Image - Desktop Only */}
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'block' } }}>
              <motion.div
                initial={{ opacity: 0, x: 60, rotateY: -10 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Box
                  component="img"
                  src={heroImage}
                  alt="Tawakkol Hero"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>

          {/* Mobile Category Navigation Cards */}
          <CategoryNavCards />
        </Container>
      </Box>

      {/* ==================== SHOP BY CATEGORY SECTION ==================== */}
      <Box sx={{ bgcolor: T.colors.white, py: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          {/* Section Heading */}
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 } }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                sx={{
                  fontFamily: T.font.display,
                  fontSize: { xs: '2rem', md: '3.5rem', lg: '4.5rem' },
                  fontWeight: 900,
                  color: T.colors.ink,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  mb: 1,
                }}
              >
                Our Collections 
              </Typography>
              <Typography
                sx={{
                  fontFamily: T.font.body,
                  fontSize: { xs: '0.85rem', md: '1rem' },
                  color: T.colors.inkLight,
                  fontStyle: 'italic',
                }}
              >
                Discover our latest collections
              </Typography>
              <Divider
                sx={{
                  width: '60px',
                  height: '3px',
                  bgcolor: T.colors.accent,
                  borderRadius: '2px',
                  mx: 'auto',
                  mt: 1.5,
                }}
              />
            </motion.div>
          </Box>

          {/* Category Sections */}
          <CategorySection
            title="Sport"
            items={sport.products}
            loading={sport.loading}
            accent={T.colors.sport}
            onAddToCart={handleAddToCart}
            onView={handleViewProduct}
            onViewAll={() => navigate('/sport')}
          />

          <CategorySection
            title="Streetwear"
            items={streetwear.products}
            loading={streetwear.loading}
            accent={T.colors.streetwear}
            onAddToCart={handleAddToCart}
            onView={handleViewProduct}
            onViewAll={() => navigate('/streetwear')}
          />

          <CategorySection
            title="Religious"
            items={religious.products}
            loading={religious.loading}
            accent={T.colors.religious}
            onAddToCart={handleAddToCart}
            onView={handleViewProduct}
            onViewAll={() => navigate('/religious')}
          />

          <CategorySection
            title="Hot Offers"
            items={offers}
            loading={offersLoading}
            isOffer
            accent={T.colors.offers}
            onAddToCart={handleAddToCart}
            onView={handleViewProduct}
            onViewAll={() => navigate('/offers')}
          />

          {/* View All CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                endIcon={<ArrowForward />}
                href="/offers"
                sx={{
                  fontFamily: T.font.display,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: T.colors.ink,
                  borderColor: T.colors.ink,
                  borderWidth: '2px',
                  px: 4,
                  py: 1.3,
                  borderRadius: '50px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: T.colors.accent,
                    color: T.colors.accent,
                    borderWidth: '2px',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px rgba(200,16,46,0.15)',
                  },
                }}
              >
                View All Products
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ==================== FEATURES SECTION ==================== */}
      <Box sx={{ bgcolor: T.colors.surface, py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="center">
            {[
              {
                icon: LocalShipping,
                label: 'Shipping',
                value: '9 TND',
                desc: 'Fast delivery across Tunisia',
              },
              {
                icon: Verified,
                label: 'Quality',
                value: 'Premium',
                desc: 'Crafted with attention to detail',
              },
              {
                icon: SupportAgent,
                label: 'Support',
                value: '24/7',
                desc: 'Always here when you need us',
              },
            ].map((feat, i) => (
              <Grid size={{ xs: 12, sm: 4 }} key={i}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    transition: 'all 0.3s ease',
                    '&:hover .feat-icon': {
                      transform: 'scale(1.1)',
                      color: T.colors.accent,
                    },
                  }}
                >
                  <feat.icon
                    className="feat-icon"
                    sx={{
                      fontSize: '2rem',
                      color: T.colors.ink,
                      mb: 1,
                      transition: 'all 0.3s ease',
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: T.font.body,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: T.colors.inkLight,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      mb: 0.3,
                    }}
                  >
                    {feat.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: T.font.display,
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      color: T.colors.accent,
                      mb: 0.3,
                    }}
                  >
                    {feat.value}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: T.font.body,
                      fontSize: '0.75rem',
                      color: T.colors.inkFaint,
                    }}
                  >
                    {feat.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ==================== TOAST ==================== */}
      {snackbar.open && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          style={{
            position: 'fixed',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
          }}
        >
          <Box
            sx={{
              bgcolor: T.colors.ink,
              color: T.colors.white,
              fontFamily: T.font.body,
              fontWeight: 600,
              fontSize: '0.85rem',
              px: 3,
              py: 1.5,
              borderRadius: '50px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Check sx={{ fontSize: '1rem', color: '#4CAF50' }} />
            {snackbar.message}
          </Box>
        </motion.div>
      )}
    </>
  );
};

export default Home;
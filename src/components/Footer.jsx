// components/Footer.jsx - Full i18n Integration
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Link,
  Stack,
  Paper,
} from '@mui/material';
import {
  Instagram,
  Facebook,
  Send,
  Copyright,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/MainL.png';

// TikTok icon as a custom component
const TikTokIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Footer = () => {
  const { t, i18n } = useTranslation(['common', 'footer']);
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (!email) {
      setEmailError(t('footer.emailRequired', 'Please enter your email'));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t('footer.emailInvalid', 'Please enter a valid email'));
      return;
    }
    setEmailError('');
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  // Social links - UPDATE THESE WITH YOUR ACTUAL URLs
  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/tawakkol_wear' },
    { name: 'TikTok', icon: TikTokIcon, url: 'https://www.tiktok.com/@tawakkol_wear?_r=1&_t=ZS-96F7nSglJYa' },
    { name: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/profile.php?id=61578870274724' },
  ];

  // Quick links
  const quickLinks = [
    { name: t('nav.home', 'Home'), url: '/' },
    { name: t('nav.sport', 'Sport'), url: '/sport' },
    { name: t('nav.streetwear', 'Streetwear'), url: '/streetwear' },
    { name: t('nav.religious', 'Religious'), url: '/religious' },
    { name: t('nav.contact', 'Contact'), url: '/contact' },
    { name: t('nav.offers', 'Offers'), url: '/offers' },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#ffffff',
        color: '#141010',
        mt: 'auto',
        borderTop: '1px solid #e0e0e0',
        fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Logo & Social Section - Left */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Box
                component="img"
                src={logo}
                alt="Tawakkol Logo"
                sx={{ height: 70, width: 'auto' }}
              />
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#141010',
                  fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                }}
              >
                {t('appName', 'Tawakkol')}
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666666', 
                mb: 2,
                fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {t('footer.aboutDesc', 'Premium sportswear, streetwear, and religious apparel. Designed for those who value quality, comfort, and style.')}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.name}
                  component="a"
                  href={social.url}
                  target="_blank"
                  sx={{
                    color: '#666666',
                    backgroundColor: '#f5f5f5',
                    '&:hover': { 
                      color: '#141010', 
                      backgroundColor: '#e0e0e0',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <social.icon />
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Quick Links - Middle (stacked vertically) */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1rem',
                mb: 2,
                color: '#141010',
                fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {t('footer.quickLinks', 'Quick Links')}
            </Typography>
            <Stack spacing={1.5}>
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.url}
                  underline="none"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(link.url);
                  }}
                  sx={{
                    color: '#666666',
                    fontSize: '0.875rem',
                    display: 'block',
                    fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                    textAlign: isRTL ? 'right' : 'left',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      color: '#141010',
                      transform: `translateX(${isRTL ? '-4px' : '4px'})`,
                    },
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Newsletter - Right Side */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                backgroundColor: '#fafafa',
                borderRadius: '16px',
                border: '1px solid #e0e0e0',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  mb: 1,
                  color: '#141010',
                  fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('footer.newsletter', 'Stay Updated')}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#666666', 
                  mb: 2.5,
                  fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                {t('footer.newsletterDesc', 'Subscribe to get special offers, free giveaways, and exclusive deals.')}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('footer.yourEmail', 'Your email address')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!emailError}
                  helperText={emailError}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      '&:hover fieldset': { borderColor: '#141010' },
                      '&.Mui-focused fieldset': { borderColor: '#141010', borderWidth: '2px' },
                    },
                    '& .MuiInputBase-input': { 
                      color: '#141010',
                      fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                      textAlign: isRTL ? 'right' : 'left',
                    },
                    flex: 1,
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSubscribe}
                  disabled={subscribed}
                  sx={{
                    backgroundColor: '#141010',
                    borderRadius: '12px',
                    padding: '8px 24px',
                    textTransform: 'none',
                    fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    minWidth: '120px',
                    '&:hover': { 
                      backgroundColor: '#2a2a2a',
                      transform: 'translateY(-2px)',
                    },
                    '&:active': { transform: 'translateY(0)' },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {subscribed ? (
                    `✓ ${t('footer.subscribed', 'Subscribed!')}`
                  ) : (
                    <>
                      {t('footer.subscribe', 'Subscribe')}
                      <Send sx={{ ml: isRTL ? 0 : 1, mr: isRTL ? 1 : 0, fontSize: 18 }} />
                    </>
                  )}
                </Button>
              </Box>
              
              {subscribed && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mt: 1.5, 
                    display: 'block', 
                    color: '#4caf50',
                    fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                    textAlign: 'center',
                  }}
                >
                  {t('footer.thankYou', 'Thank you for subscribing! 🎉')}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Copyright sx={{ fontSize: 14, color: '#999999' }} />
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#999999',
                fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
              }}
            >
              {currentYear} {t('appName', 'Tawakkol')}. {t('footer.rights', 'All rights reserved.')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Link 
              href="/privacy" 
              underline="none" 
              sx={{ 
                color: '#999999', 
                fontSize: '0.7rem', 
                fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                '&:hover': { color: '#141010' },
                transition: 'color 0.3s ease',
              }}
            >
              {t('footer.privacy', 'Privacy')}
            </Link>
            <Link 
              href="/terms" 
              underline="none" 
              sx={{ 
                color: '#999999', 
                fontSize: '0.7rem', 
                fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                '&:hover': { color: '#141010' },
                transition: 'color 0.3s ease',
              }}
            >
              {t('footer.terms', 'Terms')}
            </Link>
            <Link 
              href="/contact" 
              underline="none" 
              sx={{ 
                color: '#999999', 
                fontSize: '0.7rem', 
                fontFamily: isRTL ? '"Noto Kufi Arabic", "Tajawal", sans-serif' : 'Amaranth, sans-serif',
                '&:hover': { color: '#141010' },
                transition: 'color 0.3s ease',
              }}
            >
              {t('footer.contactUs', 'Contact')}
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import SplashScreen from './components/SplashScreen';
import Home from './components/Home';
import Layout from './components/Layout';
import Login from './components/Login';
import Contact from './components/Contact';
import AdminLayout from './admin/AdminLayout';
import ErrorPage from './components/ErrorPage';
import Sport from './components/Sport';
import ProductDetail from './components/ProductDetail';
import Streetwear from './components/Streetwear';
import Religious from './components/Religious';
import { getAuthToken, getCurrentUser, isAdmin } from './utils/auth';
import AdminProducts from './admin/AdminProducts';
import AdminOffers from './admin/AdminOffers';
import AdminContacts from './admin/AdminContacts';
import AdminSettings from './admin/AdminSettings';
import AdminCategories from './admin/AdminCategories';
import AdminDashboard from './admin/Dashboard';
import Offers from './components/Offers';
import Checkout from './components/Checkout';
import AdminOrders from './admin/AdminOrders';
import Trace from './admin/Trace';


// Check if user is authenticated
const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

// Protected Route wrapper with optional admin check
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Admin page component factory
const createAdminPage = (title, description) => {
  const AdminPage = () => (
    <div>
      <h1 style={{ 
        fontFamily: 'Amaranth, sans-serif', 
        color: 'inherit', 
        fontSize: '2rem', 
        marginBottom: '1rem' 
      }}>
        {title}
      </h1>
      <p style={{ fontFamily: 'Amaranth, sans-serif', color: '#666' }}>
        {description}
      </p>
    </div>
  );
  return AdminPage;
};


function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Simulate loading and check auth
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Check for existing user data
    const user = getCurrentUser();
    if (user) {
      setUserData(user);
    }

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      const user = getCurrentUser();
      setUserData(user);
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const router = createBrowserRouter([
    // Public Routes with Main Layout
    {
      path: '/',
      element: (
        <Layout >
          <Home />
        </Layout>
      ),
      errorElement: <ErrorPage />,
    },
    {
      path: '/login',
      element: (
        <Layout >
          <Login />
        </Layout>
      ),
    },
    {
      path: '/contact',
      element: (
        <Layout >
          <Contact />
        </Layout>
      ),
    },
    {
      path: '/offers',
      element: (
        <Layout >
          <Offers />
        </Layout>
      ),
    },
    {
      path: '/sport',
      element: (
        <Layout >
          <Sport />
        </Layout>
      ),
    },
    {
      path: '/streetwear',
      element: (
        <Layout >
          <Streetwear />
        </Layout>
      ),
    },
    {
      path: '/religious',
      element: (
        <Layout >
          <Religious />
        </Layout>
      ),
    },
    {
      path: '/checkout',
      element: (
        <Layout >
          <Checkout />
        </Layout>
      ),
    },
    {
      path: '/product/:id',
      element: (
        <Layout >
          <ProductDetail />
        </Layout>
      ),
      errorElement: <ErrorPage />,
    },

    // Admin Routes (Protected)
    // Note: AdminLayout now automatically reads from localStorage
    {
      path: '/admin',
      element: (
        <ProtectedRoute>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/orders',
      element: (
        <ProtectedRoute>
          <AdminLayout>
            <AdminOrders />
          </AdminLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/trace',
      element: (
        <ProtectedRoute>
          <AdminLayout>
            <Trace />
          </AdminLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/products',
      element: (
        <ProtectedRoute>
          <AdminLayout>
            <AdminProducts />
          </AdminLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/categories',
      element: (
        <ProtectedRoute>
          <AdminLayout>
            <AdminCategories />
          </AdminLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/contacts',
      element: (
        <ProtectedRoute>
          <AdminLayout>
            <AdminContacts />
          </AdminLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/offers',
      element: (
        <ProtectedRoute>
          <AdminLayout>
            <AdminOffers />
          </AdminLayout>
        </ProtectedRoute>
      ),
    },
    {
      path: '/admin/settings',
      element: (
        <ProtectedRoute>
          <AdminLayout>
            <AdminSettings />
          </AdminLayout>
        </ProtectedRoute>
      ),
    },

    // 404 Error Page
    {
      path: '*',
      element: <ErrorPage />,
    },
  ]);

  return (
    <>
      {isLoading ? (
        <SplashScreen onFinish={() => setIsLoading(false)} />
      ) : (
        <RouterProvider router={router} />
      )}
    </>
  );
}

export default App;
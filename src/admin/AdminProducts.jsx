import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  LinearProgress,
  Card,
  CardContent,
  Rating,
  alpha,
  Divider,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  PictureAsPdf,
  TableChart,
  Save,
  Cancel,
  CloudUpload,
  Close,
  Inventory,
  Category,
  AttachMoney,
  Description,
  Star,
  CheckCircle,
  Warning,
  Refresh,
  AddCircle,
  RemoveCircle,
  LocationOn,
  Visibility,
  VisibilityOff,
  ToggleOn,
  ToggleOff,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { productService, createProductFormData } from '../services/api';

// Sample data for categories
const categoriesData = [
  'Sport',
  'Streetwear',
  'Religious',
];

// Sample data for sizes
const sizesData = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Initial form state
const initialFormState = {
  name: '',
  description: '',
  price: '',
  stockBySize: [], // New: array of {size, quantity, location}
  review: 0,
  discount: '',
  mainImage: null,
  images: [],
  category: '',
  lowStockThreshold: 5,
};

// Validation messages
const validationMessages = {
  name: 'Product name is required',
  description: 'Product description is required (min 10 characters)',
  price: 'Valid price is required',
  category: 'Category is required',
  mainImage: 'Main image is required',
};

const AdminProducts = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [inStockFilter, setInStockFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    categories: categoriesData.length,
    avgRating: 0,
    activeProducts: 0,
    totalStock: 0,
    lowStockProducts: 0,
  });
  const [stockManagementTab, setStockManagementTab] = useState(0);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState({});

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  // Filter products when search, category, size, stock, or status filters change
  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter, sizeFilter, inStockFilter, statusFilter]);

  // Fetch products from API
  const fetchProducts = async () => {
    setTableLoading(true);
    try {
      const params = {
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      
      // Add stock filters
      if (inStockFilter === 'true') params.inStock = 'true';
      if (inStockFilter === 'false') params.inStock = 'false';
      if (sizeFilter !== 'all') params.size = sizeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await productService.getProducts(params);
      
      if (response.data.success) {
        const productsData = response.data.data.map((product) => ({
          ...product,
          id: product._id,
          mainImage: product.mainImage?.url || 'https://via.placeholder.com/150',
          images: product.images?.map(img => img.url) || [],
        }));
        setProducts(productsData);
        setFilteredProducts(productsData);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showSnackbar('Failed to load products', 'error');
    } finally {
      setTableLoading(false);
    }
  };

  // Fetch product statistics
  const fetchStats = async () => {
    try {
      const response = await productService.getProductStats();
      if (response.data.success) {
        const { overall, byStatus, lowStockProductsCount } = response.data.data;
        const activeProducts = byStatus?.find(s => s._id === 'active')?.count || 0;
        
        setStats({
          totalProducts: overall?.totalProducts || 0,
          categories: categoriesData.length,
          avgRating: overall?.averageRating?.toFixed(1) || '0.0',
          activeProducts: activeProducts,
          totalStock: overall?.totalStockUnits || 0,
          lowStockProducts: lowStockProductsCount || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Filter products based on filters
  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((product) => product.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((product) => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
  };

  // ✅ NEW: Toggle product status (active/inactive)
  const handleToggleStatus = async (productId, currentStatus) => {
    setTogglingStatus(prev => ({ ...prev, [productId]: true }));
    
    try {
      const response = await productService.toggleProductStatus(productId);
      
      if (response.data.success) {
        // Update local state
        setProducts(prev => prev.map(p => 
          p.id === productId 
            ? { ...p, status: response.data.data.status }
            : p
        ));
        
        const newStatus = response.data.data.status;
        showSnackbar(
          `Product ${response.data.data.name} ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`,
          'success'
        );
        
        // Refresh stats
        fetchStats();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to toggle product status';
      showSnackbar(errorMessage, 'error');
      console.error('Toggle status error:', error);
    } finally {
      setTogglingStatus(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = validationMessages.name;
    } else if (formData.name.length < 3) {
      newErrors.name = 'Product name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = validationMessages.description;
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = validationMessages.price;
    }

    if (!formData.category) {
      newErrors.category = validationMessages.category;
    }

    if (formData.discount && (isNaN(formData.discount) || formData.discount < 0 || formData.discount > 100)) {
      newErrors.discount = 'Discount must be between 0 and 100';
    }

    if (dialogMode === 'add' && !formData.mainImage) {
      newErrors.mainImage = validationMessages.mainImage;
    }

    // Validate stock by size
    if (formData.stockBySize.length === 0) {
      newErrors.stockBySize = 'At least one size with stock is required';
    } else {
      const hasPositiveStock = formData.stockBySize.some(item => item.quantity > 0);
      if (!hasPositiveStock) {
        newErrors.stockBySize = 'At least one size must have positive stock quantity';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle stock by size changes
  const handleStockBySizeChange = (size, field, value) => {
    setFormData((prev) => {
      const existingIndex = prev.stockBySize.findIndex(item => item.size === size);
      let newStockBySize = [...prev.stockBySize];
      
      if (existingIndex >= 0) {
        newStockBySize[existingIndex] = {
          ...newStockBySize[existingIndex],
          [field]: field === 'quantity' ? parseInt(value) || 0 : value,
        };
      } else {
        newStockBySize.push({
          size,
          quantity: field === 'quantity' ? parseInt(value) || 0 : 0,
          location: field === 'location' ? value : '',
        });
      }
      
      // Remove size if quantity is 0 and location is empty
      if (field === 'quantity' && (parseInt(value) === 0 || value === '')) {
        newStockBySize = newStockBySize.filter(item => item.size !== size);
      }
      
      return { ...prev, stockBySize: newStockBySize };
    });
    
    if (errors.stockBySize) {
      setErrors((prev) => ({ ...prev, stockBySize: '' }));
    }
  };

  // Handle main image upload
  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, mainImage: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      if (errors.mainImage) {
        setErrors((prev) => ({ ...prev, mainImage: '' }));
      }
    }
  };

  // Handle multiple images upload
  const handleImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    
    const newPreviews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image from preview
  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission with API
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        stockBySize: formData.stockBySize,
        review: formData.review || 0,
        discount: formData.discount || 0,
        status: 'active',
        lowStockThreshold: formData.lowStockThreshold,
      };

      // Create FormData with files
      const formDataToSend = createProductFormData(
        productData,
        formData.mainImage instanceof File ? formData.mainImage : null,
        formData.images.filter(img => img instanceof File)
      );

      if (dialogMode === 'add') {
        const response = await productService.createProduct(formDataToSend);
        const newProduct = {
          ...response.data.data,
          id: response.data.data._id,
          mainImage: response.data.data.mainImage?.url || mainImagePreview,
          images: response.data.data.images?.map(img => img.url) || imagePreviews,
        };
        setProducts((prev) => [newProduct, ...prev]);
        showSnackbar('Product created successfully!', 'success');
      } else {
        const response = await productService.updateProduct(editId, formDataToSend);
        setProducts((prev) =>
          prev.map((p) => 
            p.id === editId 
              ? {
                  ...p,
                  ...response.data.data,
                  id: response.data.data._id,
                  mainImage: response.data.data.mainImage?.url || p.mainImage,
                  images: response.data.data.images?.map(img => img.url) || p.images,
                }
              : p
          )
        );
        showSnackbar('Product updated successfully!', 'success');
      }

      handleCloseDialog();
      fetchStats(); // Refresh stats
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error saving product. Please try again.';
      showSnackbar(errorMessage, 'error');
      console.error('Product save error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (product) => {
    setDialogMode('edit');
    setEditId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stockBySize: product.stockBySize || [],
      review: product.review || 0,
      discount: product.discount?.toString() || '',
      mainImage: product.mainImage,
      images: product.images || [],
      category: product.category,
      lowStockThreshold: product.lowStockThreshold || 5,
    });
    setMainImagePreview(typeof product.mainImage === 'string' ? product.mainImage : null);
    setImagePreviews(Array.isArray(product.images) ? product.images.filter(img => typeof img === 'string') : []);
    setOpenDialog(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (id, name) => {
    setDeleteConfirm({ open: true, id, name });
  };

  // Handle delete with API
  const handleDelete = async () => {
    setLoading(true);
    try {
      await productService.deleteProduct(deleteConfirm.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
      showSnackbar('Product deleted successfully!', 'success');
      setDeleteConfirm({ open: false, id: null, name: '' });
      fetchStats(); // Refresh stats
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error deleting product.';
      showSnackbar(errorMessage, 'error');
      console.error('Product delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle stock management for a product
  const handleOpenStockDialog = (product) => {
    setSelectedProductForStock(product);
    setStockDialogOpen(true);
  };

  // Handle stock update
  const handleStockUpdate = async (size, quantity, operation) => {
    try {
      const response = await productService.updateProductStock(selectedProductForStock.id, {
        size,
        quantity: parseInt(quantity),
        operation,
      });
      
      if (response.data.success) {
        // Update local product data
        setProducts(prev => prev.map(p => 
          p.id === selectedProductForStock.id
            ? {
                ...p,
                stockBySize: p.stockBySize.map(s => 
                  s.size === size
                    ? { ...s, quantity: operation === 'add' ? s.quantity + parseInt(quantity) : parseInt(quantity) }
                    : s
                ),
              }
            : p
        ));
        
        showSnackbar(`Stock updated for size ${size}`, 'success');
        fetchStats();
      }
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to update stock', 'error');
    }
  };

  // Dialog handlers
  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData(initialFormState);
    setErrors({});
    setMainImagePreview(null);
    setImagePreviews([]);
    setEditId(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormState);
    setErrors({});
    setMainImagePreview(null);
    setImagePreviews([]);
    setEditId(null);
    setLoading(false);
  };

  // Snackbar handler
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Export handlers with API
  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = async () => {
    try {
      const response = await productService.exportProducts('csv');
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSnackbar('Products exported successfully!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showSnackbar('Failed to export products', 'error');
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                fontWeight: 700,
                color: '#141010',
                mb: 0.5,
              }}
            >
              Products Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                color: '#666',
              }}
            >
              Manage your product inventory, track stock by size, and update existing products
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Tooltip title="Refresh Data" arrow>
              <IconButton
                onClick={() => {
                  fetchProducts();
                  fetchStats();
                }}
                sx={{
                  border: '1px solid #141010',
                  borderRadius: '8px',
                  color: '#141010',
                  '&:hover': { bgcolor: alpha('#141010', 0.05) },
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdf />}
              onClick={handleExportPDF}
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                borderColor: '#141010',
                color: '#141010',
                '&:hover': {
                  borderColor: '#141010',
                  bgcolor: alpha('#141010', 0.05),
                },
              }}
            >
              Export PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<TableChart />}
              onClick={handleExportExcel}
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                borderColor: '#141010',
                color: '#141010',
                '&:hover': {
                  borderColor: '#141010',
                  bgcolor: alpha('#141010', 0.05),
                },
              }}
            >
              Export Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenAddDialog}
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                bgcolor: '#141010',
                color: '#f2f9f1',
                '&:hover': {
                  bgcolor: '#2a2a2a',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 30px rgba(20, 16, 16, 0.35)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Add New Product
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Products', value: stats.totalProducts, icon: Inventory, color: '#141010' },
          { title: 'Categories', value: stats.categories, icon: Category, color: '#4caf50' },
          { title: 'Avg. Rating', value: stats.avgRating, icon: Star, color: '#ff9800' },
          { title: 'Active Products', value: stats.activeProducts, icon: CheckCircle, color: '#2196f3' },
          { title: 'Total Stock Units', value: stats.totalStock, icon: Inventory, color: '#9c27b0' },
          { title: 'Low Stock Alerts', value: stats.lowStockProducts, icon: Warning, color: '#ff9800' },
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        bgcolor: alpha(stat.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent sx={{ color: stat.color, fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: 'Amaranth, sans-serif',
                          fontSize: '0.85rem',
                          color: '#666',
                          mb: 0.5,
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: 'Amaranth, sans-serif',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: '#141010',
                        }}
                      >
                        {stat.value}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Search and Filter Bar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '12px',
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <TextField
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{
            flex: 1,
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              fontFamily: 'Amaranth, sans-serif',
              borderRadius: '8px',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#999' }} />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Category"
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              borderRadius: '8px',
            }}
          >
            <MenuItem value="all" sx={{ fontFamily: 'Amaranth, sans-serif' }}>
              All Categories
            </MenuItem>
            {categoriesData.map((cat) => (
              <MenuItem key={cat} value={cat} sx={{ fontFamily: 'Amaranth, sans-serif' }}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Size</InputLabel>
          <Select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            label="Size"
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              borderRadius: '8px',
            }}
          >
            <MenuItem value="all" sx={{ fontFamily: 'Amaranth, sans-serif' }}>
              All Sizes
            </MenuItem>
            {sizesData.map((size) => (
              <MenuItem key={size} value={size} sx={{ fontFamily: 'Amaranth, sans-serif' }}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Stock Status</InputLabel>
          <Select
            value={inStockFilter}
            onChange={(e) => setInStockFilter(e.target.value)}
            label="Stock Status"
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              borderRadius: '8px',
            }}
          >
            <MenuItem value="all" sx={{ fontFamily: 'Amaranth, sans-serif' }}>
              All Products
            </MenuItem>
            <MenuItem value="true" sx={{ fontFamily: 'Amaranth, sans-serif' }}>
              In Stock
            </MenuItem>
            <MenuItem value="false" sx={{ fontFamily: 'Amaranth, sans-serif' }}>
              Out of Stock
            </MenuItem>
          </Select>
        </FormControl>

        {/* ✅ NEW: Status Filter (Active/Inactive) */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Product Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Product Status"
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              borderRadius: '8px',
            }}
          >
            <MenuItem value="all" sx={{ fontFamily: 'Amaranth, sans-serif' }}>
              All Status
            </MenuItem>
            <MenuItem value="active" sx={{ fontFamily: 'Amaranth, sans-serif' }}>
              Active
            </MenuItem>
            <MenuItem value="inactive" sx={{ fontFamily: 'Amaranth, sans-serif' }}>
              Inactive
            </MenuItem>
            <MenuItem value="draft" sx={{ fontFamily: 'Amaranth, sans-serif' }}>
              Draft
            </MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Paper
          sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {tableLoading && <LinearProgress />}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f2f9f1' }}>
                  <TableCell sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }}>
                    Product
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }}>
                    Price
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }}>
                    Stock by Size
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }}>
                    Total Stock
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }}>
                    Rating
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }}>
                    Discount
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((product) => (
                    <TableRow
                      key={product.id}
                      sx={{
                        '&:hover': { bgcolor: alpha('#141010', 0.02) },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={product.mainImage}
                            variant="rounded"
                            sx={{ width: 48, height: 48, borderRadius: '8px' }}
                          />
                          <Box>
                            <Typography
                              sx={{
                                fontFamily: 'Amaranth, sans-serif',
                                fontWeight: 600,
                                color: '#141010',
                              }}
                            >
                              {product.name}
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: 'Amaranth, sans-serif',
                                fontSize: '0.8rem',
                                color: '#666',
                                maxWidth: 200,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {product.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.category}
                          size="small"
                          sx={{
                            fontFamily: 'Amaranth, sans-serif',
                            bgcolor: alpha('#141010', 0.05),
                            color: '#141010',
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, color: '#141010' }}>
                          <span style={{color:'#c31919'}}>{product.price} TND</span>
                        </Typography>
                        {product.discount > 0 && (
                          <Typography
                            sx={{
                              fontFamily: 'Amaranth, sans-serif',
                              fontSize: '0.75rem',
                              color: '#e70000',
                              textDecoration: 'line-through',
                            }}
                          >
                            <span style={{color:'#c31919'}}>{(product.price * (1 + product.discount / 100)).toFixed(2)} TND</span>
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {product.stockBySize?.map((stock) => (
                            <Tooltip key={stock.size} title={`Location: ${stock.location || 'N/A'}`} arrow>
                              <Chip
                                label={`${stock.size}: ${stock.quantity - (stock.reserved || 0)}`}
                                size="small"
                                sx={{
                                  fontFamily: 'Amaranth, sans-serif',
                                  fontSize: '0.7rem',
                                  bgcolor: (stock.quantity - (stock.reserved || 0)) <= (product.lowStockThreshold || 5) 
                                    ? alpha('#ff9800', 0.2) 
                                    : '#f2f9f1',
                                  color: '#141010',
                                  borderLeft: `3px solid ${(stock.quantity - (stock.reserved || 0)) <= 0 ? '#e70000' : '#4caf50'}`,
                                }}
                              />
                            </Tooltip>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${product.totalStock || 0} units`}
                          size="small"
                          sx={{
                            fontFamily: 'Amaranth, sans-serif',
                            bgcolor: (product.totalStock || 0) === 0 ? alpha('#e70000', 0.1) : alpha('#4caf50', 0.1),
                            color: (product.totalStock || 0) === 0 ? '#e70000' : '#4caf50',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      {/* ✅ NEW: Status Column with Toggle Button */}
                      <TableCell>
                        <Tooltip title={product.status === 'active' ? 'Click to deactivate' : 'Click to activate'} arrow>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={product.status === 'active'}
                                onChange={() => handleToggleStatus(product.id, product.status)}
                                disabled={togglingStatus[product.id]}
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#4caf50',
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#4caf50',
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography
                                sx={{
                                  fontFamily: 'Amaranth, sans-serif',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: product.status === 'active' ? '#4caf50' : '#e70000',
                                }}
                              >
                                {togglingStatus[product.id] ? '...' : (product.status === 'active' ? 'Active' : 'Inactive')}
                              </Typography>
                            }
                            labelPlacement="start"
                            sx={{ m: 0 }}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Rating
                            value={product.review || 0}
                            precision={0.5}
                            readOnly
                            size="small"
                            sx={{ color: '#ff9800' }}
                          />
                          <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.85rem', color: '#666' }}>
                            ({product.review || 0})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {product.discount > 0 ? (
                          <Chip
                            label={`${product.discount}% OFF`}
                            size="small"
                            sx={{
                              fontFamily: 'Amaranth, sans-serif',
                              bgcolor: alpha('#e70000', 0.1),
                              color: '#e70000',
                              fontWeight: 600,
                            }}
                          />
                        ) : (
                          <Typography sx={{ fontFamily: 'Amaranth, sans-serif', color: '#999', fontSize: '0.85rem' }}>
                            No discount
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Manage Stock" arrow>
                            <IconButton
                              onClick={() => handleOpenStockDialog(product)}
                              sx={{
                                color: '#4caf50',
                                '&:hover': { bgcolor: alpha('#4caf50', 0.05) },
                              }}
                              size="small"
                            >
                              <Inventory fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Product" arrow>
                            <IconButton
                              onClick={() => handleEdit(product)}
                              sx={{
                                color: '#141010',
                                '&:hover': { bgcolor: alpha('#141010', 0.05) },
                              }}
                              size="small"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Product" arrow>
                            <IconButton
                              onClick={() => handleDeleteConfirm(product.id, product.name)}
                              sx={{
                                color: '#e70000',
                                '&:hover': { bgcolor: alpha('#e70000', 0.05) },
                              }}
                              size="small"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {!tableLoading && filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Inventory sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', color: '#999', fontSize: '1.1rem' }}>
                          No products found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontFamily: 'Amaranth, sans-serif',
              },
            }}
          />
        </Paper>
      </motion.div>

      {/* Add/Edit Product Dialog - (same as before, unchanged) */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            fontFamily: 'Amaranth, sans-serif',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: 'Amaranth, sans-serif',
            fontWeight: 700,
            fontSize: '1.5rem',
            color: '#141010',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {dialogMode === 'add' ? 'Add New Product' : 'Edit Product'}
          <IconButton onClick={handleCloseDialog} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Tabs value={stockManagementTab} onChange={(e, v) => setStockManagementTab(v)} sx={{ mb: 2 }}>
            <Tab label="Basic Info" sx={{ fontFamily: 'Amaranth, sans-serif' }} />
            <Tab label="Stock Management" sx={{ fontFamily: 'Amaranth, sans-serif' }} />
            <Tab label="Images" sx={{ fontFamily: 'Amaranth, sans-serif' }} />
          </Tabs>

          {stockManagementTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder="Enter product name"
                  required
                  sx={textFieldStyle}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  placeholder="Enter product description (min 10 characters)"
                  multiline
                  rows={3}
                  required
                  sx={textFieldStyle}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price (TND)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  error={!!errors.price}
                  helperText={errors.price}
                  placeholder="0.00"
                  required
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney sx={{ color: '#999' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Discount (%)"
                  name="discount"
                  type="number"
                  value={formData.discount}
                  onChange={handleInputChange}
                  error={!!errors.discount}
                  helperText={errors.discount || 'Optional (0-100)'}
                  placeholder="0"
                  sx={textFieldStyle}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.category} required>
                  <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Category"
                    sx={{
                      fontFamily: 'Amaranth, sans-serif',
                      borderRadius: '12px',
                    }}
                  >
                    {categoriesData.map((cat) => (
                      <MenuItem key={cat} value={cat} sx={{ fontFamily: 'Amaranth, sans-serif' }}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.75rem', color: '#e70000', mt: 0.5 }}>
                      {errors.category}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Low Stock Threshold"
                  name="lowStockThreshold"
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={handleInputChange}
                  helperText="Alert when stock falls below this number"
                  sx={textFieldStyle}
                />
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.9rem', color: '#666', mb: 1 }}>
                    Initial Rating
                  </Typography>
                  <Rating
                    name="review"
                    value={parseFloat(formData.review) || 0}
                    onChange={(event, newValue) => {
                      setFormData((prev) => ({ ...prev, review: newValue }));
                    }}
                    precision={0.5}
                    sx={{ color: '#ff9800', fontSize: '2rem' }}
                  />
                </Box>
              </Grid>
            </Grid>
          )}

          {stockManagementTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, color: '#141010' }}>
                  Stock by Size
                </Typography>
                {errors.stockBySize && (
                  <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.75rem', color: '#e70000' }}>
                    {errors.stockBySize}
                  </Typography>
                )}
              </Box>
              
              <Grid container spacing={2}>
                {sizesData.map((size) => {
                  const stockItem = formData.stockBySize.find(item => item.size === size);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={size}>
                      <Paper sx={{ p: 2, borderRadius: '12px', bgcolor: '#fafafa' }}>
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, mb: 1 }}>
                          Size {size}
                        </Typography>
                        <TextField
                          fullWidth
                          label="Quantity"
                          type="number"
                          size="small"
                          value={stockItem?.quantity || ''}
                          onChange={(e) => handleStockBySizeChange(size, 'quantity', e.target.value)}
                          placeholder="Enter quantity"
                          sx={{ mb: 1 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Inventory sx={{ color: '#999', fontSize: 18 }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Location (Optional)"
                          size="small"
                          value={stockItem?.location || ''}
                          onChange={(e) => handleStockBySizeChange(size, 'location', e.target.value)}
                          placeholder="Shelf, warehouse, etc."
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOn sx={{ color: '#999', fontSize: 18 }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {stockManagementTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box>
                  <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.9rem', color: '#666', mb: 1 }}>
                    Main Image {dialogMode === 'add' && '*'}
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    sx={{
                      fontFamily: 'Amaranth, sans-serif',
                      borderColor: errors.mainImage ? '#e70000' : '#141010',
                      color: '#141010',
                      '&:hover': {
                        borderColor: '#141010',
                        bgcolor: alpha('#141010', 0.05),
                      },
                    }}
                  >
                    Upload Main Image
                    <input type="file" hidden accept="image/*" onChange={handleMainImageUpload} />
                  </Button>
                  {errors.mainImage && (
                    <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.75rem', color: '#e70000', mt: 0.5 }}>
                      {errors.mainImage}
                    </Typography>
                  )}
                  {mainImagePreview && (
                    <Box
                      component="img"
                      src={mainImagePreview}
                      alt="Main preview"
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: '8px',
                        mt: 1,
                      }}
                    />
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.9rem', color: '#666', mb: 1 }}>
                    Additional Images
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    sx={{
                      fontFamily: 'Amaranth, sans-serif',
                      borderColor: '#141010',
                      color: '#141010',
                      '&:hover': {
                        borderColor: '#141010',
                        bgcolor: alpha('#141010', 0.05),
                      },
                    }}
                  >
                    Upload Images
                    <input type="file" hidden accept="image/*" multiple onChange={handleImagesUpload} />
                  </Button>
                  {imagePreviews.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                      {imagePreviews.map((preview, index) => (
                        <Box key={index} sx={{ position: 'relative' }}>
                          <Box
                            component="img"
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: '8px',
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveImage(index)}
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              bgcolor: '#e70000',
                              color: '#fff',
                              width: 20,
                              height: 20,
                              '&:hover': { bgcolor: '#c50000' },
                            }}
                          >
                            <Close sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={handleCloseDialog}
            startIcon={<Cancel />}
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              color: '#666',
              '&:hover': { bgcolor: alpha('#141010', 0.05) },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={dialogMode === 'add' ? <Add /> : <Save />}
            disabled={loading}
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              bgcolor: '#141010',
              color: '#f2f9f1',
              '&:hover': {
                bgcolor: '#2a2a2a',
              },
              '&:disabled': {
                bgcolor: '#ccc',
              },
            }}
          >
            {loading ? 'Saving...' : dialogMode === 'add' ? 'Add Product' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Management Dialog - (same as before, unchanged) */}
      <Dialog
        open={stockDialogOpen}
        onClose={() => setStockDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            fontFamily: 'Amaranth, sans-serif',
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }}>
          Manage Stock: {selectedProductForStock?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {selectedProductForStock?.stockBySize?.map((stock) => (
              <Grid item xs={12} key={stock.size}>
                <Paper sx={{ p: 2, borderRadius: '12px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, fontSize: '1.1rem' }}>
                      Size {stock.size}
                    </Typography>
                    <Chip
                      label={`Available: ${stock.quantity - (stock.reserved || 0)}`}
                      size="small"
                      sx={{
                        bgcolor: (stock.quantity - (stock.reserved || 0)) <= 0 ? alpha('#e70000', 0.1) : alpha('#4caf50', 0.1),
                        color: (stock.quantity - (stock.reserved || 0)) <= 0 ? '#e70000' : '#4caf50',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                      label="Current Stock"
                      type="number"
                      size="small"
                      value={stock.quantity}
                      disabled
                      sx={{ width: 120 }}
                    />
                    <TextField
                      label={`${stock.reserved > 0 ? `Reserved: ${stock.reserved}` : 'Add Stock'}`}
                      type="number"
                      size="small"
                      id={`stock-input-${stock.size}`}
                      placeholder="Quantity"
                      sx={{ width: 120 }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddCircle />}
                      onClick={() => {
                        const input = document.getElementById(`stock-input-${stock.size}`);
                        const qty = input.value;
                        if (qty && qty > 0) {
                          handleStockUpdate(stock.size, qty, 'add');
                          input.value = '';
                        }
                      }}
                      sx={{
                        bgcolor: '#4caf50',
                        '&:hover': { bgcolor: '#45a049' },
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => {
                        const input = document.getElementById(`stock-input-${stock.size}`);
                        const qty = input.value;
                        if (qty && qty >= 0) {
                          handleStockUpdate(stock.size, qty, 'set');
                          input.value = '';
                        }
                      }}
                      sx={{ borderColor: '#141010', color: '#141010' }}
                    >
                      Set
                    </Button>
                  </Box>
                  {stock.location && (
                    <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.8rem', color: '#666', mt: 1 }}>
                      <LocationOn sx={{ fontSize: 14, verticalAlign: 'middle' }} /> Location: {stock.location}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
            {(!selectedProductForStock?.stockBySize || selectedProductForStock.stockBySize.length === 0) && (
              <Grid item xs={12}>
                <Typography sx={{ textAlign: 'center', color: '#999', py: 4 }}>
                  No stock information available for this product.
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setStockDialogOpen(false)} sx={{ fontFamily: 'Amaranth, sans-serif', color: '#666' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog - (same as before, unchanged) */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            fontFamily: 'Amaranth, sans-serif',
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning sx={{ color: '#ff9800' }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Amaranth, sans-serif' }}>
            Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })}
            sx={{ fontFamily: 'Amaranth, sans-serif', color: '#666' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            startIcon={<Delete />}
            disabled={loading}
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              bgcolor: '#e70000',
              color: '#fff',
              '&:hover': { bgcolor: '#c50000' },
              '&:disabled': { bgcolor: '#ccc' },
            }}
          >
            {loading ? 'Deleting...' : 'Delete Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            fontFamily: 'Amaranth, sans-serif',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Shared text field style
const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    fontFamily: 'Amaranth, sans-serif',
    borderRadius: '12px',
    '& fieldset': { borderColor: '#e0e0e0' },
    '&:hover fieldset': { borderColor: '#141010' },
    '&.Mui-focused fieldset': { borderColor: '#141010', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Amaranth, sans-serif',
    '&.Mui-focused': { color: '#141010' },
  },
  '& .MuiFormHelperText-root': {
    fontFamily: 'Amaranth, sans-serif',
  },
};

export default AdminProducts;
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
  alpha,
  Tabs,
  Tab,
  Badge,
  Avatar,
} from '@mui/material';
import {
  Search,
  Refresh,
  Inventory,
  Warning,
  CheckCircle,
  RemoveCircle,
  AddCircle,
  Edit,
  LocationOn,
  FilterList,
  TrendingDown,
  TrendingUp,
  Store,
  LocalShipping,
  History,
  Block,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { 
  productService, 
  getStockTrackingHelper, 
  updateProductStockHelper,
  getProductStockHistoryHelper 
} from '../services/api';

const sizesData = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const categoriesData = ['Sport', 'Streetwear', 'Religious'];

const Trace = () => {
  // State management
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalStockUnits: 0,
    totalAvailableStock: 0,
    totalReserved: 0,
    outOfStockSizes: 0,
    lowStockSizes: 0,
    inStockSizes: 0,
    totalInventoryValue: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockUpdateDialog, setStockUpdateDialog] = useState(false);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [stockHistory, setStockHistory] = useState(null);
  const [updateData, setUpdateData] = useState({ size: '', quantity: '', operation: 'set' });
  const [tabValue, setTabValue] = useState(0);

  // Fetch stock tracking data
  const fetchStockTracking = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (sizeFilter !== 'all') filters.size = sizeFilter;
      if (categoryFilter !== 'all') filters.category = categoryFilter;
      if (stockStatusFilter !== 'all') {
        if (stockStatusFilter === 'low') filters.lowStock = 'true';
        if (stockStatusFilter === 'out') filters.size = 'all'; // Will filter client-side
      }

      const result = await getStockTrackingHelper(filters);
      
      let data = result.data || [];
      
      // Client-side filtering for out of stock
      if (stockStatusFilter === 'out') {
        data = data.filter(item => item.availableStock === 0);
      }
      
      setStockData(data);
      setFilteredData(data);
      setSummary(result.summary);
    } catch (error) {
      console.error('Error fetching stock tracking:', error);
      showSnackbar('Failed to load stock data', 'error');
    } finally {
      setLoading(false);
    }
  }, [sizeFilter, categoryFilter, stockStatusFilter]);

  useEffect(() => {
    fetchStockTracking();
  }, [fetchStockTracking]);

  // Filter by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(stockData);
    } else {
      const filtered = stockData.filter(
        item =>
          item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.size.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, stockData]);

  // Handle stock update
  const handleOpenStockUpdate = (item) => {
    setSelectedProduct(item);
    setUpdateData({
      size: item.size,
      quantity: '',
      operation: 'set',
    });
    setStockUpdateDialog(true);
  };

  const handleStockUpdate = async () => {
    if (!updateData.quantity || updateData.quantity <= 0) {
      showSnackbar('Please enter a valid quantity', 'error');
      return;
    }

    try {
      await updateProductStockHelper(
        selectedProduct.productId,
        updateData.size,
        updateData.quantity,
        updateData.operation
      );
      
      showSnackbar(`Stock ${updateData.operation === 'add' ? 'added' : 'updated'} successfully`, 'success');
      setStockUpdateDialog(false);
      fetchStockTracking();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to update stock', 'error');
    }
  };

  // Handle stock history
  const handleOpenHistory = async (item) => {
    try {
      const result = await getProductStockHistoryHelper(item.productId, item.size);
      setStockHistory(result.data);
      setHistoryDialog(true);
    } catch (error) {
      showSnackbar('Failed to load stock history', 'error');
    }
  };

  // Get stock status color
  const getStockStatusColor = (status) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return '#e70000';
      case 'LOW_STOCK':
        return '#ff9800';
      case 'IN_STOCK':
        return '#4caf50';
      default:
        return '#999';
    }
  };

  // Get stock status icon
  const getStockStatusIcon = (status) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return <Block sx={{ fontSize: 16 }} />;
      case 'LOW_STOCK':
        return <Warning sx={{ fontSize: 16 }} />;
      case 'IN_STOCK':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Snackbar handler
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
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
              Stock Trace
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'Amaranth, sans-serif',
                color: '#666',
              }}
            >
              Track inventory by size, manage stock levels, and monitor low stock alerts
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Data" arrow>
              <IconButton
                onClick={fetchStockTracking}
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
          </Box>
        </Box>
      </motion.div>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { 
            title: 'Total Stock Units', 
            value: summary.totalStockUnits, 
            icon: Inventory, 
            color: '#141010',
            subtitle: `${summary.totalAvailableStock} available`
          },
          { 
            title: 'In Stock Sizes', 
            value: summary.inStockSizes, 
            icon: CheckCircle, 
            color: '#4caf50' 
          },
          { 
            title: 'Low Stock Alerts', 
            value: summary.lowStockSizes, 
            icon: Warning, 
            color: '#ff9800',
            blink: summary.lowStockSizes > 0
          },
          { 
            title: 'Out of Stock', 
            value: summary.outOfStockSizes, 
            icon: Block, 
            color: '#e70000' 
          },
          { 
            title: 'Reserved Stock', 
            value: summary.totalReserved, 
            icon: LocalShipping, 
            color: '#2196f3' 
          },
          { 
            title: 'Inventory Value', 
            value: `${summary.totalInventoryValue?.toLocaleString() || 0} TND`, 
            icon: Store, 
            color: '#9c27b0',
            isCurrency: true
          },
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
                    borderLeft: `4px solid ${stat.color}`,
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  {stat.blink && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: '#ff9800',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { boxShadow: '0 0 0 0 rgba(255, 152, 0, 0.7)' },
                          '70%': { boxShadow: '0 0 0 10px rgba(255, 152, 0, 0)' },
                          '100%': { boxShadow: '0 0 0 0 rgba(255, 152, 0, 0)' },
                        },
                      }}
                    />
                  )}
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
                          fontSize: stat.isCurrency ? '1.2rem' : '1.5rem',
                          fontWeight: 700,
                          color: '#141010',
                        }}
                      >
                        {stat.value}
                      </Typography>
                      {stat.subtitle && (
                        <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>
                          {stat.subtitle}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Filters */}
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
          placeholder="Search by product name, size, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{
            flex: 2,
            minWidth: 250,
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

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            label="Category"
            sx={{ fontFamily: 'Amaranth, sans-serif', borderRadius: '8px' }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categoriesData.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Size</InputLabel>
          <Select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            label="Size"
            sx={{ fontFamily: 'Amaranth, sans-serif', borderRadius: '8px' }}
          >
            <MenuItem value="all">All Sizes</MenuItem>
            {sizesData.map((size) => (
              <MenuItem key={size} value={size}>{size}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Status</InputLabel>
          <Select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            label="Status"
            sx={{ fontFamily: 'Amaranth, sans-serif', borderRadius: '8px' }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="in">In Stock</MenuItem>
            <MenuItem value="low">Low Stock</MenuItem>
            <MenuItem value="out">Out of Stock</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => {
            setSearchQuery('');
            setSizeFilter('all');
            setCategoryFilter('all');
            setStockStatusFilter('all');
          }}
          sx={{
            fontFamily: 'Amaranth, sans-serif',
            borderColor: '#141010',
            color: '#141010',
            '&:hover': { bgcolor: alpha('#141010', 0.05) },
          }}
        >
          Clear Filters
        </Button>
      </Paper>

      {/* Stock Table */}
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
          {loading && <LinearProgress />}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f2f9f1' }}>
                  <TableCell sx={headerCellStyle}>Product</TableCell>
                  <TableCell sx={headerCellStyle}>Category</TableCell>
                  <TableCell sx={headerCellStyle}>Size</TableCell>
                  <TableCell sx={headerCellStyle} align="center">Total Stock</TableCell>
                  <TableCell sx={headerCellStyle} align="center">Reserved</TableCell>
                  <TableCell sx={headerCellStyle} align="center">Available</TableCell>
                  <TableCell sx={headerCellStyle} align="center">Status</TableCell>
                  <TableCell sx={headerCellStyle}>Location</TableCell>
                  <TableCell sx={headerCellStyle} align="center">Stock Value</TableCell>
                  <TableCell sx={headerCellStyle} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item, index) => (
                    <TableRow
                      key={`${item.productId}-${item.size}`}
                      sx={{
                        '&:hover': { bgcolor: alpha('#141010', 0.02) },
                        bgcolor: item.availableStock === 0 
                          ? alpha('#e70000', 0.03) 
                          : item.isLowStock 
                            ? alpha('#ff9800', 0.03) 
                            : 'transparent',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{ 
                              width: 36, 
                              height: 36, 
                              borderRadius: '8px',
                              bgcolor: alpha(getStockStatusColor(item.stockStatus), 0.1),
                              color: getStockStatusColor(item.stockStatus),
                              fontSize: '0.8rem',
                              fontWeight: 700,
                            }}
                          >
                            {item.productName?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#141010' }}>
                              {item.productName}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>
                              {item.price?.toFixed(2)} TND
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.category}
                          size="small"
                          sx={{
                            fontFamily: 'Amaranth, sans-serif',
                            fontSize: '0.7rem',
                            bgcolor: alpha('#141010', 0.05),
                            color: '#141010',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.size}
                          size="small"
                          sx={{
                            fontFamily: 'Amaranth, sans-serif',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            bgcolor: '#141010',
                            color: '#fff',
                            minWidth: 45,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600 }}>
                          {item.totalStock}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {item.reserved > 0 ? (
                          <Chip
                            label={item.reserved}
                            size="small"
                            sx={{
                              fontFamily: 'Amaranth, sans-serif',
                              fontSize: '0.75rem',
                              bgcolor: alpha('#2196f3', 0.1),
                              color: '#2196f3',
                              fontWeight: 600,
                            }}
                          />
                        ) : (
                          <Typography sx={{ color: '#999', fontSize: '0.85rem' }}>0</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontFamily: 'Amaranth, sans-serif',
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: item.availableStock <= 0 
                              ? '#e70000' 
                              : item.isLowStock 
                                ? '#ff9800' 
                                : '#4caf50',
                          }}
                        >
                          {item.availableStock}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={getStockStatusIcon(item.stockStatus)}
                          label={item.stockStatus.replace('_', ' ')}
                          size="small"
                          sx={{
                            fontFamily: 'Amaranth, sans-serif',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            bgcolor: alpha(getStockStatusColor(item.stockStatus), 0.1),
                            color: getStockStatusColor(item.stockStatus),
                            border: `1px solid ${alpha(getStockStatusColor(item.stockStatus), 0.3)}`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 14, color: '#999' }} />
                          <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.8rem', color: '#666' }}>
                            {item.location || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, fontSize: '0.85rem' }}>
                          {item.stockValue?.toFixed(2)} TND
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Update Stock" arrow>
                            <IconButton
                              onClick={() => handleOpenStockUpdate(item)}
                              size="small"
                              sx={{ color: '#4caf50', '&:hover': { bgcolor: alpha('#4caf50', 0.1) } }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Stock History" arrow>
                            <IconButton
                              onClick={() => handleOpenHistory(item)}
                              size="small"
                              sx={{ color: '#2196f3', '&:hover': { bgcolor: alpha('#2196f3', 0.1) } }}
                            >
                              <History fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {!loading && filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                      <Inventory sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                      <Typography sx={{ fontFamily: 'Amaranth, sans-serif', color: '#999', fontSize: '1.2rem' }}>
                        No stock data found
                      </Typography>
                      <Typography sx={{ color: '#bbb', fontSize: '0.9rem', mt: 1 }}>
                        Try adjusting your filters or add stock to products
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredData.length}
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

      {/* Stock Update Dialog */}
      <Dialog
        open={stockUpdateDialog}
        onClose={() => setStockUpdateDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }}>
          Update Stock
          {selectedProduct && (
            <Typography sx={{ fontSize: '0.9rem', color: '#666', mt: 0.5 }}>
              {selectedProduct.productName} - Size {selectedProduct.size}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {selectedProduct && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: '8px', fontFamily: 'Amaranth, sans-serif' }}>
                Current available: <strong>{selectedProduct.availableStock}</strong> | 
                Reserved: <strong>{selectedProduct.reserved}</strong>
              </Alert>
            )}
            
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel sx={{ fontFamily: 'Amaranth, sans-serif' }}>Operation</InputLabel>
              <Select
                value={updateData.operation}
                onChange={(e) => setUpdateData(prev => ({ ...prev, operation: e.target.value }))}
                label="Operation"
                sx={{ fontFamily: 'Amaranth, sans-serif', borderRadius: '12px' }}
              >
                <MenuItem value="set">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Edit fontSize="small" /> Set Exact Quantity
                  </Box>
                </MenuItem>
                <MenuItem value="add">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddCircle fontSize="small" sx={{ color: '#4caf50' }} /> Add Stock
                  </Box>
                </MenuItem>
                <MenuItem value="subtract">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RemoveCircle fontSize="small" sx={{ color: '#e70000' }} /> Subtract Stock
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={updateData.quantity}
              onChange={(e) => setUpdateData(prev => ({ ...prev, quantity: e.target.value }))}
              size="small"
              sx={textFieldStyle}
              InputProps={{
                inputProps: { min: 1 },
                startAdornment: (
                  <InputAdornment position="start">
                    <Inventory sx={{ color: '#999' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setStockUpdateDialog(false)}
            sx={{ fontFamily: 'Amaranth, sans-serif', color: '#666' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStockUpdate}
            variant="contained"
            startIcon={<CheckCircle />}
            sx={{
              fontFamily: 'Amaranth, sans-serif',
              bgcolor: '#141010',
              '&:hover': { bgcolor: '#2a2a2a' },
            }}
          >
            Update Stock
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock History Dialog */}
      <Dialog
        open={historyDialog}
        onClose={() => setHistoryDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 700, color: '#141010' }}>
          Stock History
          {stockHistory && (
            <Typography sx={{ fontSize: '0.9rem', color: '#666', mt: 0.5 }}>
              {stockHistory.productName} - Size {stockHistory.size}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {stockHistory && (
            <Box>
              <Paper sx={{ p: 2, mb: 3, bgcolor: '#fafafa', borderRadius: '12px' }}>
                <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, mb: 1 }}>
                  Current Stock Status
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#888' }}>Total Stock</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{stockHistory.currentData.totalStock}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#888' }}>Reserved</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{stockHistory.currentData.reserved}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#888' }}>Available</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#4caf50' }}>
                      {stockHistory.currentData.available}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#888' }}>Location</Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {stockHistory.currentData.location || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontWeight: 600, mb: 1 }}>
                Change History
              </Typography>
              
              {stockHistory.history?.map((entry, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#141010',
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.85rem' }}>
                      {entry.details}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>
                      {new Date(entry.date).toLocaleString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={entry.action}
                    size="small"
                    sx={{ fontFamily: 'Amaranth, sans-serif', fontSize: '0.7rem' }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setHistoryDialog(false)}
            sx={{ fontFamily: 'Amaranth, sans-serif', color: '#666' }}
          >
            Close
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

// Styles
const headerCellStyle = {
  fontFamily: 'Amaranth, sans-serif',
  fontWeight: 700,
  color: '#141010',
  fontSize: '0.85rem',
  whiteSpace: 'nowrap',
};

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
};

export default Trace;
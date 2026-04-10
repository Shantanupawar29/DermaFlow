const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();

// ✅ MIDDLEWARE (Must be before routes)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log(`📌 ${req.method} ${req.url}`);
  next();
});

// ✅ ADD GLOBAL ERROR HANDLER AFTER ALL ROUTES (at the bottom of index.js, before mongoose.connect)
app.use((err, req, res, next) => {
  console.error('❌ Global error handler caught:', err);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
// ✅ ROUTES IMPORT
const productRoutes    = require('./routes/products');
const authRoutes       = require('./routes/auth');
const orderRoutes      = require('./routes/orders');
const adminRoutes      = require('./routes/admin'); // NLP aur Logs iske andar hain
const inventoryRoutes  = require('./routes/inventory');
const customerRoutes   = require('./routes/customers');
const analyticsRoutes  = require('./routes/analytics');
const paymentRoutes    = require('./routes/payment');
const scmRoutes        = require('./routes/scm');
const sellerAuthRoutes = require('./routes/sellerAuth');
const reviewRoutes     = require('./routes/reviews'); // New Feature
const quizRoutes = require('./routes/quiz');
const pincodeRoutes = require('./routes/pincode');


// ✅ ROUTES REGISTRATION
app.use('/api/quiz', quizRoutes);
app.use('/api/pincode', pincodeRoutes);
app.use('/api/reviews',   reviewRoutes);    // Customer Reviews & Feedback
app.use('/api/admin',     adminRoutes);     // Security SOC, Audit Logs, Sentiment
app.use('/api/scm',       scmRoutes);       // Supply Chain Management
app.use('/api/seller/auth', sellerAuthRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/auth',      authRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payment',   paymentRoutes);
app.use('/api/erp',       require('./routes/erp'));       // ERP: Batch, BOM, COGS, Quarantine
app.use('/api/crm',       require('./routes/crm'));  
app.get('/', (req, res) => res.json({ message: 'Derma Flow API is running' }));

// ✅ DB CONNECTION & SERVER START
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => { 
    console.error('❌ MongoDB connection error:', err); 
    process.exit(1); 
  });
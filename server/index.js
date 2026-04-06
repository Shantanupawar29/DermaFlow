const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();

// ✅ MIDDLEWARE FIRST — before anything else
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ROUTES AFTER middleware
const productRoutes   = require('./routes/products');
const authRoutes      = require('./routes/auth');
const orderRoutes     = require('./routes/orders');
const adminRoutes     = require('./routes/admin');
const inventoryRoutes = require('./routes/inventory');
const customerRoutes  = require('./routes/customers');
const analyticsRoutes = require('./routes/analytics');
const paymentRoutes   = require('./routes/payment');

app.use('/api/products',  productRoutes);
app.use('/api/auth',      authRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payment',   paymentRoutes);

app.get('/', (req, res) => res.json({ message: 'Derma Flow API is running' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });
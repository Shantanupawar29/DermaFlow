const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ ROUTES IMPORT
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ ROUTES
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// ✅ TEST ROUTE
app.get('/', (req, res) => {
  res.send('Server running');
});

// ✅ DB CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(5000, () => {
      console.log('✅ Server running on port 5000');
    });
  })
  .catch(err => console.log(err));
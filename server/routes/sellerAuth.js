const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Seller login attempt:', email);
    
    const supplier = await Supplier.findOne({ email });
    if (!supplier) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, supplier.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: supplier._id, role: 'supplier' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      supplier: { 
        id: supplier._id, 
        name: supplier.name, 
        email: supplier.email,
        company: supplier.company
      } 
    });
  } catch (error) {
    console.error('Seller login error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
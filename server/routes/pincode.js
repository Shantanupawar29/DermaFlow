const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;

    const response = await axios.get(
      `https://api.postalpincode.in/pincode/${pincode}`
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pincode data' });
  }
});

module.exports = router;
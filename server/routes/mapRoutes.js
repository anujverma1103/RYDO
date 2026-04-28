const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/route', async (req, res) => {
  try {
    const { pickup, drop } = req.body;
    const response = await axios.post(
      'https://api.heigit.org/openrouteservice/v2/directions/driving-car',
      { coordinates: [pickup, drop] },
      {
        headers: {
          Authorization: `Bearer ${process.env.ORS_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    console.error('ORS Error:', err.response?.status, msg);
    // User ko friendly message do
    res.status(400).json({ 
      message: 'Selected location ke paas koi road nahi mili. Kripya nearby main road ke paas ka point select karein.' 
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Gera print de mapa estático via Google Maps Static API
router.get('/static', async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) return res.status(400).json({ error: 'Endereço obrigatório' });
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API Key não configurada' });
    // Geocodifica endereço
    const geoResp = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address, key: apiKey }
    });
    if (!geoResp.data.results.length) return res.status(404).json({ error: 'Endereço não encontrado' });
    const { lat, lng } = geoResp.data.results[0].geometry.location;
    // Monta URL do mapa estático
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=16&size=600x400&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
    res.json({ mapUrl, lat, lng });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

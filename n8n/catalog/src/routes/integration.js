const express = require('express');
const { Product, Category, IntegrationLog } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Webhook para receber eventos do bot ou sistemas externos
router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;
    // Salva log do evento recebido
    await IntegrationLog.create({ type: 'webhook', payload, status: 'received' });
    // Aqui você pode processar o evento, atualizar pedidos, etc.
    res.json({ received: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Endpoint para exportar catálogo completo (para o bot consumir)
router.get('/catalog-sync', auth, async (req, res) => {
  try {
    const products = await Product.findAll({ include: Category });
    // Log de exportação
    await IntegrationLog.create({ type: 'catalog-export', payload: {}, response: { count: products.length }, status: 'success' });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para importar catálogo (exemplo: sincronizar de outro sistema)
router.post('/catalog-sync', auth, async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) return res.status(400).json({ error: 'Formato inválido' });
    let updated = 0;
    for (const prod of products) {
      await Product.upsert(prod);
      updated++;
    }
    await IntegrationLog.create({ type: 'catalog-import', payload: { count: products.length }, response: { updated }, status: 'success' });
    res.json({ updated });
  } catch (err) {
    await IntegrationLog.create({ type: 'catalog-import', payload: req.body, status: 'error' });
    res.status(400).json({ error: err.message });
  }
});

// Endpoint para cálculo de frete (simples, pode ser expandido)
router.post('/shipping', async (req, res) => {
  try {
    const { cep, products } = req.body;
    if (!cep || !Array.isArray(products)) return res.status(400).json({ error: 'Informe o CEP e os produtos' });
    // Lógica simples: frete fixo + adicional por item
    const base = 15.0;
    const adicional = 5.0 * products.length;
    // Exemplo de restrição de entrega (pode ser expandido)
    let restricao = false;
    if (cep.startsWith('69')) restricao = true; // Exemplo: CEPs do Amazonas
    // Log de cálculo de frete
    await IntegrationLog.create({ type: 'shipping', payload: req.body, response: { shipping: base + adicional, restricao }, status: 'success' });
    res.json({
      shipping: base + adicional,
      prazo: '3-7 dias úteis',
      via: 'Entrega padrão',
      restricao
    });
  } catch (err) {
    await IntegrationLog.create({ type: 'shipping', payload: req.body, status: 'error' });
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

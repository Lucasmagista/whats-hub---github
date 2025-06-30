const express = require('express');
const { Order, Product } = require('../models');
const router = express.Router();

// Listar pedidos
router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({ include: Product });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar pedido por ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: Product });
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar pedido
router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar pedido
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Order.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Pedido não encontrado' });
    const order = await Order.findByPk(req.params.id);
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deletar pedido
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Order.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json({ message: 'Pedido removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

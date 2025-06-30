const express = require('express');
const { Category } = require('../models');
const router = express.Router();

// Listar categorias
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar categoria
router.post('/', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar categoria
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Category.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Categoria não encontrada' });
    const category = await Category.findByPk(req.params.id);
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deletar categoria
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Category.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json({ message: 'Categoria removida' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

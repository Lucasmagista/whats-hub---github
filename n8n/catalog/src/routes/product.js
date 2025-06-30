const express = require('express');
const { Product, Category } = require('../models');
const router = express.Router();

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({ include: Category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: Category });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    // Garantir que sempre haja um array de imagens
    const images = product.imageUrl ? [product.imageUrl] : ['/placeholder.png'];

    // Garantir que description, price, stock, category estejam presentes
    const response = {
      id: product.id,
      name: product.name,
      description: product.description || 'Sem descrição.',
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl || '/placeholder.png',
      images,
      category: product.Category ? {
        id: product.Category.id,
        name: product.Category.name
      } : null
    };
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar produto
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Atualizar produto
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Product.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Produto não encontrado' });
    const product = await Product.findByPk(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deletar produto
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ message: 'Produto removido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

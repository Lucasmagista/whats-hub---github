const express = require('express');
const router = express.Router();


const productRoutes = require('./product');
const categoryRoutes = require('./category');
const orderRoutes = require('./order');
const userRoutes = require('./user');

const integrationRoutes = require('./integration');
const pixRoutes = require('./pix');
const mapRoutes = require('./map');

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/integration', integrationRoutes);
router.use('/pix', pixRoutes);
router.use('/map', mapRoutes);

module.exports = router;

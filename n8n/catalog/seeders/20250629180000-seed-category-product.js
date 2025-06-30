"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // Categoria exemplo
    let catId;
    const categories = await queryInterface.bulkInsert('categories', [
      {
        name: 'Eletrônicos',
        description: 'Produtos eletrônicos em geral',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Buscar o id da categoria criada
    if (Array.isArray(categories) && categories[0]?.id) {
      catId = categories[0].id;
    } else {
      // fallback: buscar a primeira categoria
      const cats = await queryInterface.sequelize.query('SELECT id FROM categories LIMIT 1;', { type: Sequelize.QueryTypes.SELECT });
      catId = cats[0]?.id || 1;
    }

    // Produto exemplo
    await queryInterface.bulkInsert('products', [
      {
        name: 'Smartphone X',
        description: 'Um smartphone de última geração',
        price: 1999.99,
        stock: 10,
        imageUrl: 'https://via.placeholder.com/300x300.png?text=Smartphone+X',
        active: true,
        categoryId: catId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fone de Ouvido Bluetooth',
        description: 'Fone sem fio com alta qualidade de som',
        price: 299.90,
        stock: 25,
        imageUrl: 'https://via.placeholder.com/300x300.png?text=Fone+Bluetooth',
        active: true,
        categoryId: catId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('categories', null, {});
  }
};

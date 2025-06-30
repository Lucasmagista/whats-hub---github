"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Categoria exemplo
    const [category] = await queryInterface.bulkInsert('categories', [
      {
        name: 'Eletrônicos',
        description: 'Produtos de tecnologia e eletrônicos',
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true
      }
    ], { returning: true });

    // Produto exemplo
    await queryInterface.bulkInsert('products', [
      {
        name: 'Fone de Ouvido Bluetooth',
        description: 'Fone sem fio com ótima qualidade de som',
        price: 199.90,
        stock: 50,
        imageUrl: 'https://via.placeholder.com/300x200.png?text=Fone+Bluetooth',
        active: true,
        categoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('categories', null, {});
  }
};

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    imageUrl: { type: DataTypes.STRING },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    categoryId: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'products',
    timestamps: true
  });
  return Product;
};

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Variation = sequelize.define('Variation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    attribute: { type: DataTypes.STRING, allowNull: false }, // cor, tamanho, etc
    value: { type: DataTypes.STRING, allowNull: false },
  }, {
    tableName: 'variations',
    timestamps: false
  });
  return Variation;
};

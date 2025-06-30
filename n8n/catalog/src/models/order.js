const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    customerName: { type: DataTypes.STRING, allowNull: false },
    customerPhone: { type: DataTypes.STRING },
    customerAddress: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'pendente' },
    total: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    paymentStatus: { type: DataTypes.STRING, defaultValue: 'aguardando' },
    paymentProofUrl: { type: DataTypes.STRING },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'orders',
    timestamps: true
  });
  return Order;
};

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PaymentProof = sequelize.define('PaymentProof', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    imageUrl: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'pending' }, // pending, valid, invalid
    detectedValue: { type: DataTypes.DECIMAL(10,2) },
    detectedTime: { type: DataTypes.DATE },
    detectedName: { type: DataTypes.STRING },
    isScheduled: { type: DataTypes.BOOLEAN },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'payment_proofs',
    timestamps: false
  });
  return PaymentProof;
};

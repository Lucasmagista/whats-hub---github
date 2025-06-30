const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    cep: { type: DataTypes.STRING },
    lat: { type: DataTypes.DECIMAL(10,8) },
    lng: { type: DataTypes.DECIMAL(10,8) },
  }, {
    tableName: 'customers',
    timestamps: false
  });
  return Customer;
};

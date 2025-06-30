const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'categories',
    timestamps: true
  });
  return Category;
};

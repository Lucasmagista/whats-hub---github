const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const IntegrationLog = sequelize.define('IntegrationLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.STRING, allowNull: false }, // webhook, sync, shipping
    payload: { type: DataTypes.JSONB },
    response: { type: DataTypes.JSONB },
    status: { type: DataTypes.STRING },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'integration_logs',
    timestamps: false
  });
  return IntegrationLog;
};

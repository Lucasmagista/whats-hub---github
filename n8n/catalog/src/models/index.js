
require('dotenv').config();
const { Sequelize } = require('sequelize');


const ProductModel = require('./product');
const CategoryModel = require('./category');
const OrderModel = require('./order');
const UserModel = require('./user');
const IntegrationLogModel = require('./integrationLog');
const VariationModel = require('./variation');
const OrderItemModel = require('./orderItem');
const CustomerModel = require('./customer');
const PaymentProofModel = require('./paymentProof');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/catalog', {
  dialect: 'postgres',
  logging: false,
});



const Product = ProductModel(sequelize);
const Category = CategoryModel(sequelize);
const Order = OrderModel(sequelize);
const User = UserModel(sequelize);
const IntegrationLog = IntegrationLogModel(sequelize);
const Variation = VariationModel(sequelize);
const OrderItem = OrderItemModel(sequelize);
const Customer = CustomerModel(sequelize);
const PaymentProof = PaymentProofModel(sequelize);


// Relações
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });
Product.hasMany(Variation, { foreignKey: 'productId' });
Variation.belongsTo(Product, { foreignKey: 'productId' });
Order.belongsTo(Customer, { foreignKey: 'customerId' });
Customer.hasMany(Order, { foreignKey: 'customerId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });
OrderItem.belongsTo(Variation, { foreignKey: 'variationId' });
Order.hasOne(PaymentProof, { foreignKey: 'orderId' });
PaymentProof.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = {
  sequelize,
  Product,
  Category,
  Order,
  User,
  IntegrationLog,
  Variation,
  OrderItem,
  Customer,
  PaymentProof
};

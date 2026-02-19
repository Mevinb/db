/**
 * Database Configuration
 * Handles PostgreSQL connection using Sequelize
 */

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || process.env.POSTGRES_URI, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? (msg) => console.log(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ PostgreSQL Connected`);
    console.log(`📦 Database: ${sequelize.config.database}`);

    // Sync all models (creates tables if they don't exist)
    // Import models to register them before sync
    require('../models');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ All models synchronized');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await sequelize.close();
      console.log('PostgreSQL connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ Error connecting to PostgreSQL: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, sequelize };

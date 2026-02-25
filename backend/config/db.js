/**
 * Database Configuration
 * Handles PostgreSQL connection using Sequelize
 */

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || process.env.POSTGRES_URI, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
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
    console.log(`✅ Supabase PostgreSQL Connected`);
    console.log(`📦 Database: ${sequelize.config.database}`);

    // Register all model associations (do NOT sync/alter on startup)
    require('../models');
    console.log('✅ Models loaded');

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

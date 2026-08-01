const { Sequelize } = require('sequelize');
const env = require('./env');
const mysql = require('mysql2/promise');
const path = require('path');

let sequelizeInstance = null;

const initDb = async () => {
  if (sequelizeInstance) return sequelizeInstance;

  // 1. Try MySQL Connection
  try {
    const connection = await mysql.createConnection({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      connectTimeout: 2000,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env.db.name}\`;`);
    await connection.end();

    const instance = new Sequelize(env.db.name, env.db.user, env.db.password, {
      host: env.db.host,
      port: env.db.port,
      dialect: 'mysql',
      logging: false,
      define: {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    });

    await instance.authenticate();
    console.log('Database connected successfully (MySQL)');
    sequelizeInstance = instance;
    return sequelizeInstance;
  } catch (error) {
    console.warn(`⚠️ MySQL Server unavailable on port ${env.db.port} (${error.message}). Using SQLite storage fallback...`);
    const sqlitePath = path.join(__dirname, '../../campusprocure.sqlite');
    const instance = new Sequelize({
      dialect: 'sqlite',
      storage: sqlitePath,
      logging: false,
      define: {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    });

    await instance.authenticate();
    console.log('Database connected successfully (SQLite)');
    sequelizeInstance = instance;
    return sequelizeInstance;
  }
};

const getSequelize = () => {
  if (!sequelizeInstance) {
    const sqlitePath = path.join(__dirname, '../../campusprocure.sqlite');
    sequelizeInstance = new Sequelize({
      dialect: 'sqlite',
      storage: sqlitePath,
      logging: false,
      define: {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    });
  }
  return sequelizeInstance;
};

module.exports = {
  getSequelize,
  initDb,
};

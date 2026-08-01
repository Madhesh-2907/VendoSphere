require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'campusprocure_db',
  },
  jwtSecret: process.env.JWT_SECRET || 'campusprocure_super_secret_jwt_key_2026',
  nodeEnv: process.env.NODE_ENV || 'development',
};

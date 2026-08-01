const app = require('./src/app');
const env = require('./src/config/env');
const { initDb } = require('./src/config/db');

const PORT = env.port || 5000;

const startServer = async () => {
  try {
    const sequelize = await initDb();
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`CampusProcure API Server running on port ${PORT}`);
      console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();

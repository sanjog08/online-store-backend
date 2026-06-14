import mongoose from 'mongoose';
import app from './app.js';
import config from './config.js';
import logger from './utils/logger.js';

let server;

// Connect to MongoDB
mongoose.connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info('Connected to MongoDB');
    server = app.listen(config.port, () => {
      logger.info(`Server listening on port ${config.port} in ${config.env} mode`);
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB on startup:', err);
    process.exit(1);
  });

// Graceful shutdown handler
const exitHandler = () => {
  if (server) {
    logger.info('Closing HTTP server...');
    server.close(async () => {
      logger.info('HTTP server closed');
      
      try {
        // Close MongoDB connection
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
        
        // SCALABILITY: Hook any future teardown routines here (e.g., closing Redis connections)
        
        logger.info('Graceful shutdown completed successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error('Unexpected error encountered:', error);
  exitHandler();
};

// Process-level event hooks for safety and clean exit
process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received');
  exitHandler();
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received');
  exitHandler();
});

import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import { errorConverter, errorHandler } from './middlewares/error.js';
import logger from './utils/logger.js';
import ApiError from './utils/ApiError.js';

const app = express();

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Custom HTTP request logger middleware
app.use((req, res, next) => {
  logger.info({
    type: 'request',
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  next();
});

// Mount routing configuration
app.use('/', routes);

// Send 404 ApiError for any unknown endpoints
app.use((req, res, next) => {
  next(new ApiError(404, 'Not found'));
});

// Convert unknown errors to ApiError
app.use(errorConverter);

// Standardized error handler
app.use(errorHandler);

export default app;

import cors, { CorsOptions } from 'cors';
import { env } from '../config/env';
import { AppError } from './errorHandler';

const DEV_LAN_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/i,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/i,
  /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^https?:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^https?:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^exp:\/\//i,
];

function isOriginAllowed(origin: string | undefined): boolean {
  // Allow native mobile / curl / server-to-server requests that omit Origin
  if (!origin) {
    return true;
  }

  if (env.corsOriginsList.includes(origin)) {
    return true;
  }

  if (env.NODE_ENV !== 'production') {
    return DEV_LAN_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
  }

  return false;
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    callback(
      new AppError(
        403,
        'CORS_FORBIDDEN',
        `Origin "${origin}" is not allowed by CORS policy.`
      )
    );
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400,
};

export const corsMiddleware = cors(corsOptions);

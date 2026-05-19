//Configuracion de la app express, rutas y middlewares globales
import express, { Application } from 'express';
import cors from 'cors';
import { config } from './utils/config.js';
import {
  globalErrorHandler,
  notFoundHandler,
} from './middleware/error/error.middleware.js';
import apiRouter from './routes/api.router.js';


function createApp(): Application {
  const app = express();

  //CORS permite peticiones del front
  app.use(
    cors({
      origin: config.frontend.url,
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'x-session-id'],
      credentials: true,
    }),
  );

  app.use(express.json());

  //Router raiz del api
  app.use('/api', apiRouter);

  // 404 — Rutas no encontradas
  app.use(notFoundHandler);

  // 500 - Manejo global de errores (estructura response de errores al front)
  app.use(globalErrorHandler);

  return app;
}

export default createApp;
import { Request, Response } from 'express';
import { logger } from '../../utils/logger.js';

//Maneja errores en la peticion
export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
): void {
  logger.error(`[ErrorHandler] ${err.message}`, { stack: err.stack });

  res.status(500).json({
    ok: false,
    error: err.message
  });
}


//Error 404 para rutas no definidas.
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    ok: false,
    error: 'Ruta no encontrada',
  });
}
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';


//Ejecuta los resultados de validaciones de varios campos
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({
      ok: false,
      error: 'Datos de entrada inválidos',
      details: errors.array().map((e) => ({
        field: e.type === 'field' ? e.path : undefined,
        message: e.msg,
      })),
    });
    return;
  }

  next();
}
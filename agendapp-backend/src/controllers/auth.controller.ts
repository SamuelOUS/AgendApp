import { Request, Response } from 'express';
import { LoginCredentials } from "../types/index.types";
import {loginWithEPS, logout} from '../services/auth.service.js';
import { logger } from '../utils/logger.js';



/**
 * Inicia sesion en el portal EPS con las credenciales del usuario.
 * Body: { epsId, documentType, documentNumber, password }
 *   200 — Login exitoso: { ok: true, data: { sessionId, expiresAt, message } }
 */
export async function loginHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const credentials = req.body as LoginCredentials;
 
  logger.info(
    `[AuthController] POST /login — EPS: ${credentials.epsId}, doc: ${credentials.documentNumber}, intakeId: ${credentials.intakeId ?? 'sin intake'}`,
  );
 
  const result = await loginWithEPS(credentials);
 
  if (result.success) {
    res.status(200).json({ ok: true, data: result });
    return;
  }
 
  //error en login del portal como credenciales incorrectas
  const isCredentialsError =
    result.message.toLowerCase().includes('credencial') ||
    result.message.toLowerCase().includes('contraseña') ||
    result.message.toLowerCase().includes('verifica');
 
  res.status(isCredentialsError ? 401 : 502).json({
    ok: false,
    error: result.message,
  });
}



/**
 * Cierra la sesion del usuario 
 * Requiere el middleware requireSession
*/
export async function logoutHandler(
  req: Request,
  res: Response,
): Promise<void> {

  const sessionId = req.activeSession!.sessionId;
 
  await logout(sessionId);
 
  res.status(200).json({
    ok: true,
    data: { message: 'Sesión cerrada correctamente' },
  });
}

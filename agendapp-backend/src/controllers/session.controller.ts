import { Request, Response } from 'express';
import {checkSession} from '../services/auth.service.js';
import { sessionStore } from '../infraestructure/browser/session.store.js';

//Verifica si sesion esta activa, dado su sessionId
export async function sessionStatusHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { sessionId } = req.params;
 
  if (!sessionId) {
    res.status(400).json({ ok: false, error: 'sessionId es requerido' });
    return;
  }
 
  const status = await checkSession(sessionId);
 
  if (status.isActive) {
    res.status(200).json({ ok: true, data: status });
  } else {
    res.status(401).json({ ok: false, error: status.message });
  }
}

//Retorna numero sesiones activas (trazabilidad)
export function sessionsListHandler(_req: Request, res: Response): void {
  const count = sessionStore.count();
 
  res.status(200).json({
    ok: true,
    data: { activeSessions: count },
  });
}
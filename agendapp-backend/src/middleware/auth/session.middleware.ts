import { Request, Response, NextFunction } from 'express';
import { sessionStore } from '../../infraestructure/browser/session.store.js';
import { ActiveSession } from '../../types/index.types.js';
 
//Agrega activeSession a request como propiedad
declare global {
  namespace Express {
    interface Request {
      activeSession?: ActiveSession;
    }
  }
}
 
//Toma id de la sesion del header x-session-id, la valida y  agrega a req.activeSession
export function requireSession(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const sessionId = req.headers['x-session-id'] as string | undefined;
 
  if (!sessionId) {
    res.status(401).json({
      ok: false,
      error: 'Header x-session-id es requerido',
    });
    return;
  }
 
  const session = sessionStore.get(sessionId);
 
  if (!session) {
    res.status(401).json({
      ok: false,
      error: 'Sesión no válida o expirada',
    });
    return;
  }
 
  sessionStore.touch(sessionId);
 
  req.activeSession = session;
  next();
}
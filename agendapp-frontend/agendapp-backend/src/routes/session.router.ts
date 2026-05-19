import { Router } from 'express';
import {
  sessionStatusHandler,
  sessionsListHandler,
} from '../controllers/session.controller.js';


const sessionRouter = Router();

// Conteo sesiones activas
sessionRouter.get('/', sessionsListHandler);

// verifica sesion activa: sesion-id enviada por  parametro
sessionRouter.get('/:sessionId', sessionStatusHandler);

export default sessionRouter;
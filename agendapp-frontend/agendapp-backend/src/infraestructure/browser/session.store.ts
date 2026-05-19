import { v4 as uuidv4 } from 'uuid';
import type { ActiveSession, SessionInfo } from "../../types/index.types";
import type { BrowserContext, Page } from '@playwright/test';
import { config } from '../../utils/config.js';
import { logger } from '../../utils/logger';

//almacenamiento en memoria desesiones: guardar, eliminar, get, controlar expiracion

//Session: {string: session ID (codigo UUID), ActiveSession: contexto y page}
class SessionStore {
  private sessions = new Map<string, ActiveSession>();


  //crear sesion
  create(params: { epsId: string; documentNumber: string; intakeId?: string; context: BrowserContext; page: Page;}): string {

    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + config.session.ttlMinutes * 60 * 1000,
    );

    const session: ActiveSession = {
      sessionId,
      epsId: params.epsId,
      documentNumber: params.documentNumber,
      intakeId: params.intakeId,
      context: params.context,
      page: params.page,
      createdAt: now,
      lastActivityAt: now,
      expiresAt,
    };

    this.sessions.set(sessionId, session);

    logger.info(`[SessionStore] Sesión creada: ${sessionId}`, {
      epsId: params.epsId,
      expiresAt: expiresAt.toISOString(),
    });

    return sessionId;
  }

  //obtener sesion existente, si expiro elimina
  get(sessionId: string): ActiveSession | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    if (this._isExpired(session)) {
      logger.info(`[SessionStore] Sesion expirada: ${sessionId}`);
      this.destroy(sessionId);
      return undefined;
    }

    return session;
  }

  //Actualiza fecha ult actividad cuando usuario hace peticion 
  touch(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || this._isExpired(session)) return false;

    session.lastActivityAt = new Date();
    session.expiresAt = new Date(
      Date.now() + config.session.ttlMinutes * 60 * 1000,
    );
    return true;
  }


  //destruir sesion: cierra contexto y la elimina
  async destroy(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;


    try {
      await session.context.close();
    } catch (err) {
      logger.warn(`[SessionStore] Error cerrando context: ${err}`);
    }

    this.sessions.delete(sessionId);
    logger.info(`[SessionStore] Sesión destruida: ${sessionId}`);
  }


  //info de sesion sin contexto, ni pagina
  getInfo(sessionId: string): SessionInfo | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      sessionId: session.sessionId,
      epsId: session.epsId,
      documentNumber: session.documentNumber,
      createdAt: session.createdAt,
      lastActivityAt: session.lastActivityAt,
      expiresAt: session.expiresAt,
      isValid: !this._isExpired(session),
    };
  }

  count(): number {
    return this.sessions.size;
  }

  //Cierra todas las sesiones 
  async destroyAll(): Promise<void> {
    const ids = Array.from(this.sessions.keys());
    await Promise.allSettled(ids.map((id) => this.destroy(id)));
    logger.info('[SessionStore] Todas las sesiones cerradas');
  }

  private _isExpired(session: ActiveSession): boolean {
    return Date.now() > session.expiresAt.getTime();
  }

}

export const sessionStore = new SessionStore();

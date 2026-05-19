import type { BrowserContext, Page } from '@playwright/test';


export interface SessionInfo {
  sessionId: string;
  epsId: string;
  documentNumber: string;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  isValid: boolean;
}

export interface SessionStatus {
  isActive: boolean;
  sessionId: string;
  expiresAt?: string;
  message: string;
}

//Sesion activa con contexto de navegador tiene la cookie del usuario autenticado
export interface ActiveSession {
  sessionId: string;
  epsId: string;
  documentNumber: string;
  intakeId?: string;
  context: BrowserContext;
  page: Page;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
}

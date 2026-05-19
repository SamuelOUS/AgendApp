import { Page } from '@playwright/test';
import { config } from '../../utils/config.js';
import { sessionStore } from './session.store.js';


//Validar se autentico tiene cookie, hace peticion API interna de sura
export async function validatePortalSession(page: Page): Promise<boolean> {
  try {
    const response = await page.request.post(config.portal.consultarAfiliadoUrl,);
    return response.status() === 200;

  } catch {
    return false;
  }
}

//maneja validar estado de sesiones creadas, eliminar si expiro
export async function checkSession(sessionId: string) {
  const session = sessionStore.get(sessionId);

  if (!session) {
    return {
      isActive: false,
      message: 'Sesión no encontrada o expirada',
    };
  }
  
  const isValid = await validatePortalSession(session.page);

  if (!isValid) {
    await sessionStore.destroy(sessionId);
    return {
      isActive: false,
      message: 'Sesión expirada en el portal',
    };
  }

  sessionStore.touch(sessionId);

  return {
    isActive: true,
    expiresAt: session.expiresAt,
  };
}
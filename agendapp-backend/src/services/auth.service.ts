import { browserService } from "../infraestructure/browser/browser.service";
import { performLogin } from "../infraestructure/browser/login.service";
import { fetchAffiliateData, validatePortalSession } from "../infraestructure/browser/session.service";
import { sessionStore } from "../infraestructure/browser/session.store";
import { LoginCredentials, LoginResult, SessionStatus } from "../types/index.types";
import { logger } from "../utils/logger";

type AffiliateMember = {
  correoElectronico?: string;
  tipoDocumento?: string;
  numeroIdentificacion?: string;
  parentesco?: string;
  tipoAfiliado?: string;
};

type AffiliatePayload = {
  grupoFamiliar?: AffiliateMember[];
};

function normalizeDocType(value?: string): string {
  return (value ?? '').toUpperCase().trim();
}

function normalizeDocNumber(value?: string): string {
  return String(value ?? '').trim();
}

function extractEmailFromAffiliateData(
  data: unknown,
  credentials: LoginCredentials,
): string | undefined {
  if (!data || typeof data !== 'object') return undefined;

  const payload = data as AffiliatePayload;
  const family = Array.isArray(payload.grupoFamiliar) ? payload.grupoFamiliar : [];
  const docType = normalizeDocType(credentials.documentType);
  const docNumber = normalizeDocNumber(credentials.documentNumber);

  const matchByDocument = family.find(
    (member) =>
      normalizeDocType(member.tipoDocumento) === docType &&
      normalizeDocNumber(member.numeroIdentificacion) === docNumber,
  );
  const titular = family.find(
    (member) =>
      (member.parentesco ?? '').toUpperCase() === 'TITULAR' ||
      (member.tipoAfiliado ?? '').toUpperCase() === 'TITULAR',
  );

  const email = matchByDocument?.correoElectronico ?? titular?.correoElectronico;

  if (typeof email !== 'string') return undefined;

  const trimmed = email.trim();
  return trimmed.length ? trimmed : undefined;
}


//Login en Sura y creacion de sesion local
export async function loginWithEPS( credentials: LoginCredentials): Promise<LoginResult> {

  const { epsId, documentNumber } = credentials;
  logger.info(`[AuthService] Iniciando login — EPS: ${epsId}, doc: ${documentNumber}`);

  let context;

  try {
    const browser = await browserService.getBrowser();

    context = await browser.newContext({
      locale: 'es-CO',
      timezoneId: 'America/Bogota',
      viewport: { width: 1280, height: 800 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    // Login en Sura
    await performLogin(page, credentials);

    // Validar sesión en el portal -> llamado api sura
    const isValid = await validatePortalSession(page);

    if (!isValid) {
      await context.close();
      return {
        success: false,
        message: 'No fue posible iniciar sesion en el portal. Intenta nuevamente.',
      };
    }

    // Guardar sesion
    const sessionId = sessionStore.create({
      epsId,
      documentType: credentials.documentType,
      documentNumber,
      intakeId: credentials.intakeId,
      context,
      page,
    });

    void fetchAffiliateData(page)
      .then((affiliateData) => {
        const email = extractEmailFromAffiliateData(affiliateData, credentials);

        if (email) {
          sessionStore.update(sessionId, { email });
          logger.info('[AuthService] Correo afiliado guardado', { sessionId, email });
        } else {
          logger.warn('[AuthService] Correo no encontrado en datos del afiliado', { sessionId });
        }
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        logger.warn(`[AuthService] No se pudo leer datos del afiliado: ${message}`);
      });

    logger.info(`[AuthService] Login exitoso — sessionId: ${sessionId}`);

    return {
      success: true,
      sessionId,
      message: 'Autenticación exitosa',
      intakeId: credentials.intakeId,
    };

  } catch (err) {

    if (context) {
      await context.close().catch(() => undefined);
    }

    const message = err instanceof Error ? err.message : String(err);
    logger.error(`[AuthService] Error en login: ${message}`);

    return {
      success: false,
      message: 'Error al conectar con el portal. Intenta más tarde.',
    };
  }
}

 //Verifica si la sesión sigue activa SOLO en Sura
export async function checkSession(sessionId: string): Promise<SessionStatus> {

  const session = sessionStore.get(sessionId);

  if (!session) {
    return {
      isActive: false,
      sessionId,
      message: 'Sesión no encontrada. Debes iniciar sesión nuevamente.',
    };
  }

  // Validación real contra Sura
  const isPortalValid = await validatePortalSession(session.page);

  if (!isPortalValid) {
    await sessionStore.destroy(sessionId);

    return {
      isActive: false,
      sessionId,
      message: 'La sesión expiró en el portal. Redirigir a login.',
    };
  }

  return {
    isActive: true,
    sessionId,
    message: 'Sesión activa',
  };
}

//Logout manual
export async function logout(sessionId: string): Promise<void> {
  logger.info(`[AuthService] Logout — sessionId: ${sessionId}`);
  await sessionStore.destroy(sessionId);
}


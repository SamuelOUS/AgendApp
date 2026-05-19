//Ejecucion de la app (punto de entrada)
import http from 'http';
import createApp from './app.js';
import { config } from './utils/config.js';
import { logger } from './utils/logger.js';
import { sessionStore } from './infraestructure/browser/session.store.js';
import { browserService } from './infraestructure/browser/browser.service.js';


const app = createApp();

const server = http.createServer(app);

server.listen(config.port, () => {
  logger.info(`[Server] AgendApp backend corriendo en http://localhost:${config.port}`);
  logger.info(`[Server] CORS permitido desde: ${config.frontend.url}`);
});

async function shutdown(signal: string): Promise<void> {
  logger.info(`[Server] Señal recibida: ${signal}. Iniciando shutdown...`);

  //Dejar de aceptar nuevas peticiones HTTP
  server.close((err) => {
    if (err) {
      logger.error('[Server] Error cerrando el servidor HTTP:', err);
    } else {
      logger.info('[Server] Servidor HTTP cerrado');
    }
  });

  try {
    // destruir sesiones activas
    await sessionStore.destroyAll();

    //Cerrar el proceso de Chromium
    await browserService.close();

    logger.info('[Server] Shutdown completado. Hasta pronto 👋');
    process.exit(0);

  } catch (err) {
    logger.error('[Server] Error durante el shutdown:', err);
    process.exit(1);
  }
}

// Cierre con docker
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Ctrl+C en desarrollo
process.on('SIGINT', () => shutdown('SIGINT'));

// try catch no manejado
process.on('uncaughtException', (err) => {
  logger.error('[Server] uncaughtException:', err);
  process.exit(1);
});

//promesa no manejada
process.on('unhandledRejection', (reason) => {
  logger.error('[Server] unhandledRejection:', reason);
  process.exit(1);
});

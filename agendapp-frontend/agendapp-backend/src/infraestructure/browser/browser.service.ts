import { chromium, Browser } from '@playwright/test';
import { config } from '../../utils/config.js';
import { logger } from '../../utils/logger.js';

//unica instancia de browser para toda la app, se reutiliza 
class BrowserService {

  private browser: Browser | null = null;

  async getBrowser(): Promise<Browser> {
    if (this.browser?.isConnected()) return this.browser;

    logger.info('[Browser] creando instancia de Chromium');

    this.browser = await chromium.launch({
      headless: config.playwright.headless,
      slowMo: config.playwright.slowMo,
      args: ['--disable-blink-features=AutomationControlled'],
    });

    logger.info('[Browser] Chromium creado');

    this.browser.on('disconnected', () => {
      logger.warn('[Browser] Chromium desconectado');
      this.browser = null;
    });

    return this.browser;
  }

  async close(): Promise<void> {
    if (this.browser?.isConnected()) {
      await this.browser.close();
      this.browser = null;
      logger.info('[Browser] Chromium cerrado');
    }
  }

  isReady(): boolean {
    return this.browser?.isConnected() ?? false;
  }
}

export const browserService = new BrowserService();

import type { Page } from '@playwright/test';
import { loginSelectors } from './selectors.js';
import { config } from '../../utils/config.js';
import { logger } from '../../utils/logger.js';
import type { LoginCredentials } from "../../types/index.types.js";
 
 
async function openLoginPage(page: Page): Promise<void> {

  logger.debug('[Login] Abriendo pagina de login de la eps...');
  await page.goto(config.portal.loginUrl, { waitUntil: 'domcontentloaded' });
 
  await Promise.all([page.waitForSelector(loginSelectors.docType, {
      state: 'visible',
      timeout: 30_000,
    }),
    page.waitForSelector(loginSelectors.docNumberInput, {
      state: 'visible',
      timeout: 30_000,
    }),
    page.waitForSelector(loginSelectors.submitBtn, {
      state: 'visible',
      timeout: 30_000,
    }),
  ]);
}

async function fillKeyboardPassword(page: Page, password: string) :Promise<void> {
  const passInput = page.locator(loginSelectors.passwordInput);
  const keyboard = page.locator(loginSelectors.kbDiv);

  // Abrir teclado virtual
  await passInput.click();
  await keyboard.waitFor({ state: 'visible', timeout: 10_000 });

  const preview = page.locator(loginSelectors.kbPreviewInput);

  // Clic por cada dígito via jQuery (ui-keyboard no responde a clics nativos)
  for (let i = 0; i < password.length; i++) {
    const btnSelector = loginSelectors.kbDigitBtn(password[i]);

    await page.evaluate((btnSel) => {
      const btn = document.querySelector(btnSel) as HTMLButtonElement | null;
      const jq = (window as any).jQuery;
      jq(btn).trigger('mousedown').trigger('mouseup').trigger('click');
    }, btnSelector);

    // Esperar a que el preview (****) refleje el nuevo dígito
    await page.waitForFunction(({ previewInput, expectedLen }) => {
      const el = document.querySelector(previewInput) as HTMLInputElement | null;
      return el && el.value.length === expectedLen;
    }, { previewInput: loginSelectors.kbPreviewInput, expectedLen: i + 1 }, { timeout: 10_000 });
  }

  const finalLen = await preview.evaluate(el => (el as HTMLInputElement).value.length);
  if (finalLen !== password.length) {
    throw new Error(`Se esperaban ${password.length} dígitos y quedaron ${finalLen}`);
  }

  // Aceptar teclado virtual
  await page.locator(loginSelectors.kbAcceptBtn).click({ timeout: 10_000 });
}

async function fillLoginForm(page: Page, credentials: LoginCredentials,): Promise<void> {
  logger.debug('[Login] Llenando formulario con credenciales del usuario');
 
  await page
    .locator(loginSelectors.docTypeSelect(credentials.documentType))
    .waitFor({ state: 'attached', timeout: 10_000 });
 
  await page.selectOption(loginSelectors.docType, credentials.documentType);
  await page.fill(loginSelectors.docNumberInput, credentials.documentNumber);
  await fillKeyboardPassword(page, credentials.password);
}

async function submitAndWaitHome(page: Page): Promise<void> {
  await page
    .locator(loginSelectors.kbDiv)
    .waitFor({ state: 'hidden', timeout: 10_000 });
 
  await page.locator(loginSelectors.submitBtn).click();
 
  await page.waitForURL(
    (url) => url.href.startsWith(config.portal.portalUrlLogged),
    { timeout: 60_000 },
  );

  await page.locator(loginSelectors.homeHelloText).first().waitFor({ timeout: 30_000 });
 
  logger.debug('[Login] Portal cargado — usuario autenticado');
}


//flujo login completo
export async function performLogin(page: Page, credentials: LoginCredentials, ): Promise<void> {
  await openLoginPage(page);
  await fillLoginForm(page, credentials);
  await submitAndWaitHome(page);
}
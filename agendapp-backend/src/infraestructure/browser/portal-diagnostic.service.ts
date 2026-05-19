import { Page } from '@playwright/test';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { homeSelectors } from './selectors.js';
import { PortalDiagnosticSnapshot } from '../../types/index.types';

async function summarizeElements(page: Page, selector: string, limit = 40) {
  return page.locator(selector).evaluateAll((elements, maxItems) =>
    elements.slice(0, maxItems as number).map((element) => {
      const htmlElement = element as HTMLElement;
      const inputElement = element as HTMLInputElement;
      const anchorElement = element as HTMLAnchorElement;

      return {
        tag: element.tagName.toLowerCase(),
        text: (htmlElement.innerText || element.textContent || '').replace(/\s+/g, ' ').trim(),
        id: htmlElement.id || undefined,
        name: inputElement.name || undefined,
        type: inputElement.type || undefined,
        href: anchorElement.href || undefined,
        value: inputElement.value || undefined,
        placeholder: inputElement.placeholder || undefined,
        ariaLabel: htmlElement.getAttribute('aria-label') || undefined,
        classes: htmlElement.className || undefined,
      };
    }),
    limit,
  );
}

export async function inspectPortalPage(page: Page): Promise<PortalDiagnosticSnapshot> {
  const html = await page.content();
  const capturedAt = new Date().toISOString();
  const snapshotName = `portal-${capturedAt.replace(/[:.]/g, '-')}`;

  const snapshot: PortalDiagnosticSnapshot = {
    url: page.url(),
    title: await page.title(),
    headings: await summarizeElements(page, 'h1,h2,h3,h4,h5,h6', 30),
    buttons: await summarizeElements(page, 'button,input[type="button"],input[type="submit"]', 60),
    links: await summarizeElements(page, 'a', 80),
    selects: await summarizeElements(page, 'select', 30),
    inputs: await summarizeElements(page, 'input,textarea', 60),
    htmlSample: html.slice(0, 20_000),
    capturedAt,
  };

  const diagnosticsDir = path.resolve(process.cwd(), 'diagnostics');
  await mkdir(diagnosticsDir, { recursive: true });

  const artifactPath = path.join(diagnosticsDir, `${snapshotName}.json`);
  const screenshotPath = path.join(diagnosticsDir, `${snapshotName}.png`);

  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);
  snapshot.artifactPath = artifactPath;
  snapshot.screenshotPath = screenshotPath;

  await writeFile(
    artifactPath,
    JSON.stringify({ ...snapshot, html }, null, 2),
    'utf8',
  );

  return snapshot;
}

export async function goToAppointmentsEntry(page: Page): Promise<PortalDiagnosticSnapshot> {
  await page.locator(homeSelectors.citasMedicoGeneralCard).first().click({ timeout: 15_000 });
  await page.waitForLoadState('domcontentloaded', { timeout: 15_000 }).catch(() => undefined);
  await page.waitForTimeout(1_500);

  return inspectPortalPage(page);
}

import { Page } from '@playwright/test';
import { Beneficiary } from '../../types/index.types';
import { inspectPortalPage } from './portal-diagnostic.service.js';

interface SuraFamilyMember {
  tipoID: string;
  numID: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  feNacimiento?: string;
}

function fullName(member: SuraFamilyMember): string {
  return [
    member.primerNombre,
    member.segundoNombre,
    member.primerApellido,
    member.segundoApellido,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function readPortalBeneficiaries(page: Page): Promise<Beneficiary[]> {
  const rawValue = await page
    .locator('#dataUserSemp')
    .first()
    .inputValue({ timeout: 5_000 })
    .catch(() => '');

  if (!rawValue) {
    return [];
  }

  const parsed = JSON.parse(rawValue) as { grupoFamiliar?: SuraFamilyMember[] };

  return (parsed.grupoFamiliar ?? []).map((member, index) => ({
    id: `${member.tipoID}-${member.numID}`,
    name: fullName(member),
    relationship: index === 0 ? 'Titular' : 'Beneficiario',
    documentType: member.tipoID,
    documentNumber: member.numID,
    birthDate: member.feNacimiento,
  }));
}

export async function selectPortalBeneficiary(page: Page, beneficiaryId: string) {
  const beneficiaries = await readPortalBeneficiaries(page);
  const selected = beneficiaries.find((beneficiary) => beneficiary.id === beneficiaryId);

  if (!selected) {
    throw new Error('Beneficiario no encontrado en el portal');
  }

  await page.locator('#grupoFamiliar').first().waitFor({ state: 'visible', timeout: 10_000 });
  await page.locator('#grupoFamiliar').first().selectOption({ label: selected.name });
  await page.waitForLoadState('domcontentloaded', { timeout: 10_000 }).catch(() => undefined);
  await page
    .locator('wc-hada,#web-component')
    .first()
    .waitFor({ state: 'attached', timeout: 20_000 })
    .catch(() => undefined);
  await page.waitForTimeout(4_000);

  return inspectPortalPage(page);
}

export async function acceptPortalRedirect(page: Page) {
  await page
    .getByRole('button', { name: /entendido/i })
    .click({ timeout: 15_000 });

  await page.waitForLoadState('domcontentloaded', { timeout: 20_000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => undefined);
  await page.waitForTimeout(4_000);

  return inspectPortalPage(page);
}

import { Request, Response } from 'express';
import {
  goToAppointmentsEntry,
  inspectPortalPage,
} from '../infraestructure/browser/portal-diagnostic.service.js';
import {
  acceptPortalRedirect,
  selectPortalBeneficiary,
} from '../infraestructure/browser/portal-appointments.service.js';

export async function inspectPortalHandler(req: Request, res: Response): Promise<void> {
  const snapshot = await inspectPortalPage(req.activeSession!.page);

  res.status(200).json({
    ok: true,
    data: snapshot,
  });
}

export async function goToAppointmentsHandler(req: Request, res: Response): Promise<void> {
  try {
    const snapshot = await goToAppointmentsEntry(req.activeSession!.page);

    res.status(200).json({
      ok: true,
      data: snapshot,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'No fue posible navegar a citas',
    });
  }
}

export async function selectBeneficiaryHandler(req: Request, res: Response): Promise<void> {
  try {
    const beneficiaryId = String(req.body?.beneficiaryId ?? '');

    if (!beneficiaryId) {
      res.status(422).json({
        ok: false,
        error: 'beneficiaryId es requerido',
      });
      return;
    }

    const snapshot = await selectPortalBeneficiary(req.activeSession!.page, beneficiaryId);

    res.status(200).json({
      ok: true,
      data: snapshot,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'No fue posible seleccionar beneficiario',
    });
  }
}

export async function acceptRedirectHandler(req: Request, res: Response): Promise<void> {
  try {
    const snapshot = await acceptPortalRedirect(req.activeSession!.page);

    res.status(200).json({
      ok: true,
      data: snapshot,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'No fue posible continuar en el portal',
    });
  }
}

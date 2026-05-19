import { Request, Response } from 'express';
import { intakeStore } from '../infraestructure/intake/intake.store.js';
import { IntakeRequest } from '../types/index.types';
import { config } from '../utils/config.js';

export function createIntakeHandler(req: Request, res: Response): void {
  const intake = intakeStore.create(req.body as IntakeRequest);
  const frontendUrl = new URL(config.frontend.url);

  frontendUrl.searchParams.set('intakeId', intake.intakeId);

  res.status(201).json({
    ok: true,
    data: {
      intake,
      frontendUrl: frontendUrl.toString(),
    },
  });
}

export function getIntakeHandler(req: Request, res: Response): void {
  const { intakeId } = req.params;
  const intake = intakeStore.get(intakeId);

  if (!intake) {
    res.status(404).json({
      ok: false,
      error: 'Informacion de entrada no encontrada',
    });
    return;
  }

  res.status(200).json({
    ok: true,
    data: intake,
  });
}

import { Router } from 'express';
import {
  createIntakeHandler,
  getIntakeHandler,
} from '../controllers/intake.controller.js';
import { intakeValidationRules } from '../middleware/validation/intake.validation.js';

const intakeRouter = Router();

intakeRouter.post('/', intakeValidationRules, createIntakeHandler);
intakeRouter.get('/:intakeId', getIntakeHandler);

export default intakeRouter;

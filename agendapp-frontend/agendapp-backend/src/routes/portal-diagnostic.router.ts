import { Router } from 'express';
import {
  acceptRedirectHandler,
  goToAppointmentsHandler,
  inspectPortalHandler,
  selectBeneficiaryHandler,
} from '../controllers/portal-diagnostic.controller.js';
import { requireSession } from '../middleware/auth/session.middleware.js';

const portalDiagnosticRouter = Router();

portalDiagnosticRouter.use(requireSession);
portalDiagnosticRouter.get('/inspect', inspectPortalHandler);
portalDiagnosticRouter.post('/go-to-appointments', goToAppointmentsHandler);
portalDiagnosticRouter.post('/select-beneficiary', selectBeneficiaryHandler);
portalDiagnosticRouter.post('/accept-redirect', acceptRedirectHandler);

export default portalDiagnosticRouter;

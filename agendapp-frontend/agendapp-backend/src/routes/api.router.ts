import { Router, Request, Response } from 'express';
import appointmentRouter from './appointment.router';
import authRouter from './auth.router';
import intakeRouter from './intake.router';
import portalDiagnosticRouter from './portal-diagnostic.router';
import sessionRouter from './session.router';


const apiRouter = Router();

// Health
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    },
  });
});

// Modulos
apiRouter.use('/appointments', appointmentRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/intake', intakeRouter);
apiRouter.use('/portal-diagnostics', portalDiagnosticRouter);
apiRouter.use('/sessions', sessionRouter);

export default apiRouter;

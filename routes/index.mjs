import { Router } from 'express';
import bookRouter from './book.mjs';
import adminRouter from './admin.mjs';
import dashboardRouter from "./dashboard.mjs";
import authRouter from './auth.mjs';

const router = Router();

// Contains all the routes that will be used 
router.use('/', bookRouter);
router.use('/', adminRouter);
router.use('/', dashboardRouter);
router.use('/', authRouter);

export default router;
import { Router } from 'express';
import bookRouter from './book.mjs';
import adminRouter from './admin.mjs';

const router = Router();

// Contains all the routes that will be used 
router.use('/', bookRouter);
router.use('/', adminRouter);

export default router;
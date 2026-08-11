import { Router } from 'express';
import bookRouter from './book.mjs';
import adminRouter from './admin.mjs';
import openLibrary from './openLibrary.mjs'

const router = Router();

// Contains all the routes that will be used 
router.use('/', bookRouter);
router.use('/', adminRouter);
router.use('/api', openLibrary)

export default router;
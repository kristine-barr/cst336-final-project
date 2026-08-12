import { Router } from 'express';
import bookRouter from './book.mjs';
import adminRouter from './admin.mjs';
import dashboardRouter from "./dashboard.mjs";
import authRouter from './auth.mjs';
import categoryRouter from "./category.mjs";
import editBookRouter from "./EdBook.mjs";
import { requireAuth } from "../middleware/auth.mjs";

const router = Router();

router.get('/', (req, res) => {
	res.redirect('/dashboard');
});

// Public routes (no login required)
router.use('/', authRouter);

// All routes below require an active session
router.use(requireAuth);
router.use('/', bookRouter);
router.use('/', adminRouter);
router.use('/', dashboardRouter);
router.use("/", categoryRouter);
router.use("/", editBookRouter);

export default router;
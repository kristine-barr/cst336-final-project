import { Router } from "express";
import { searchOpenLibrary } from "../controllers/openLibraryController.mjs";

const router = Router();

router.get("/openlibrary/search", searchOpenLibrary);

export default router;

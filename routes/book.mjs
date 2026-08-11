import express from "express";
const router = express.Router();

import {
  renderBookPage,
  renderBookSearchResults,
} from "../controllers/bookController.mjs";

router.get("/book", renderBookPage);
router.get("/book/search", renderBookSearchResults);

// Here we would create our CRUD operation for reading and writing from the db.

export default router;
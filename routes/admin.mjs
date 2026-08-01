import express from "express";
const router = express.Router();

import pool from "../db.mjs";

router.get("/admin", (req, res) => {
  res.render("./admin/index");
});

// Here we would create our CRUD operation for reading and writing from the db.

export default router;
import express from "express";
const router = express.Router();

import { searchBooks } from "../services/openLibraryService.mjs";

router.get("/book", (req, res) => {
  res.render("./book/index", {
    search: { title: "", author: "" },
    results: [],
    error: null,
  });
});

router.get("/book/search", async (req, res) => {
  const title = typeof req.query.title === "string" ? req.query.title : "";
  const author = typeof req.query.author === "string" ? req.query.author : "";

  try {
    const results = await searchBooks({ title, author });
    return res.render("./book/index", {
      search: { title, author },
      results,
      error: null,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).render("./book/index", {
      search: { title, author },
      results: [],
      error: error.message,
    });
  }
});



export default router;
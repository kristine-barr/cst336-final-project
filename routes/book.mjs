import express from "express";
import pool from "../db.mjs";
const router = express.Router();

import { searchBooks, getBookById } from "../services/openLibraryService.mjs";

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

router.post("/book/save", async (req, res) => {
  let olId = req.body.id;
  let title = req.body.title;
  let author = req.body.author;
  let year = req.body.year;
  let isbn = req.body.isbn;
  let coverUrl = req.body.coverUrl;
  let editionKey = req.body.editionKey;

  let qry = `insert into Books (olId, title, author, publishYear, isbn, bookCoverUrl, editionKey) 
              values (?, ?, ?, ?, ?, ?, ?)`;
  let params = [olId, title, author, year, isbn, coverUrl, editionKey];
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    let [bookInfo] = await conn.query(`select * from Books where olId = ?`, [
      olId,
    ]);
    let bookId;

    // if empty result, then insert
    if (bookInfo.length === 0) {
      let [insertResult] = await conn.query(qry, params);
      bookId = insertResult.insertId;
    }

    // SMFIX hard coding the UserID until the login page is created
    // and we can setup session to store the userid.

    // insert into user_books table with hard coded userId
    let userId = 1; // hard coded userId
    let userBooksQry = `insert into User_Books (userId, bookId) values (?, ?)`;
    let userBooksParams = [userId, bookId];
    await conn.query(userBooksQry, userBooksParams);
    await conn.commit();
    return res.send({ success: true , message: "Book saved successfully" });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    console.error(error);
    return res.status(500).send("An error occurred while saving the book.");
  } finally {
    if (conn) {
      conn.release();
    }
  }
});

export default router;

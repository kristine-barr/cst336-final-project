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
  const title = typeof req. query.title === "string" ? req.query.title : "";
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
    console.error(error);
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
    let bookId = null;
  
    // If the book already exists, set the bookId to the existing book's ID otherwise insert a new record 
    // and set bookId to the newly inserted book's ID.
    if (bookInfo.length === 0) {
      let [insertResult] = await conn.query(qry, params);
      bookId = insertResult.insertId;
    } else {
      bookId = bookInfo[0].bookId;
    }

    // SMFIX hard coding the UserID until the login page is created
    // and we can setup session to store the userid.

    // SMFIX more harding
    // insert into user_books table with hard coded userId
    let userId = 1; // hard coded userId

    // Check if the user alread has the book saved in thier list.
   
    let [userBooks] = await conn.query(
      `select * from User_Books where userId = ? and bookId = ?`,
      [userId, bookId]
    );

    // If the user already has saved the book we exit as we don't want to insert a duplicate record.
    if (userBooks.length > 0) {
        await conn.commit();
      return res.send({ success: false, message: "Book already saved" });
    }

    // The user doesn't have the book saved, insert the record into the User_Books table.
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

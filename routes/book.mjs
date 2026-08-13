import express from "express";
import pool from "../db.mjs";
import { randomUUID } from "node:crypto";
const router = express.Router();

import { searchBooks, getBookById } from "../services/openLibraryService.mjs";

router.get("/book", (req, res) => {
  res.render("./book/index", {
    search: { title: "", author: "" },
    results: [],
    error: null,
  });
});

// Shows the manual Add Book page
router.get("/book/add", (req, res) => {

  // Send logged-out users back to the login page
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  res.render("./book/add", {
    error: null,
    formData: {}
  });
});

// Adds a manually entered book to the user's library
router.post("/book/add", async (req, res) => {

  // Make sure the user is logged in
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  // Grab the information from the Add Book form
  const { title, author, isbn, publishYear, bookCoverUrl } = req.body;

  // Clean up the required text fields
  const cleanTitle = title?.trim();
  const cleanAuthor = author?.trim();

  // Make sure title and author were actually entered
  if (!cleanTitle || !cleanAuthor) {
    return res.status(400).render("./book/add", {
      error: "Title and author are required.",
      formData: req.body
    });
  }

  // Get the logged-in user's ID from their session
  const userId = req.session.userId;

  // Manual books do not have an Open Library ID,
  // so we create our own unique ID
  const olId = `manual-${randomUUID()}`;

  // Empty optional fields should be stored as NULL
  const cleanIsbn = isbn?.trim() || null;
  const cleanYear = publishYear ? Number(publishYear) : null;

  // Reject invalid publication years
  if (cleanYear !== null && (Number.isNaN(cleanYear) || cleanYear < 0)) {
    return res.status(400).render("./book/add", {
      error: "Please enter a valid publication year.",
      formData: req.body
    });
  }
  const cleanCoverUrl = bookCoverUrl?.trim() || null;

  // Check if the ISBN is already used by another book
  if (cleanIsbn) {
    const [existingBooks] = await pool.query(
        "SELECT bookId FROM Books WHERE isbn = ?",
        [cleanIsbn]
    );

    if (existingBooks.length > 0) {
      return res.status(400).render("./book/add", {
        error: "A book with this ISBN already exists.",
        formData: req.body
      });
    }
  }

  const conn = await pool.getConnection();

  try {

    // Start a transaction so both inserts succeed together
    await conn.beginTransaction();

    // Add the book to the Books table
    const [bookResult] = await conn.query(
        `INSERT INTO Books
       (olId, title, author, isbn, publishYear, bookCoverUrl)
       VALUES (?, ?, ?, ?, ?, ?)`,
        [
          olId,
          cleanTitle,
          cleanAuthor,
          cleanIsbn,
          cleanYear,
          cleanCoverUrl
        ]
    );

    // Get the new book's database ID
    const bookId = bookResult.insertId;

    // Connect the new book to the logged-in user
    await conn.query(
        `INSERT INTO User_Books (userId, bookId)
       VALUES (?, ?)`,
        [userId, bookId]
    );

    // Save both database changes
    await conn.commit();

    // Store a one-time success message for the library page
    req.session.successMessage = `${title.trim()} was added to your library.`;

    // Send the user to their library
    res.redirect("/library");

  } catch (error) {

    // Undo the inserts if something fails
    await conn.rollback();

    console.error("Add Book error:", error);

    res.status(500).send("Unable to add book.");

  } finally {

    // Give the database connection back to the pool
    conn.release();
  }
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
  let message = "";
  const userId = req.session.userId;

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

    // Check if the user alread has the book saved in thier list.
   
    let [userBooks] = await conn.query(
      `select * from User_Books where userId = ? and bookId = ?`,
      [userId, bookId]
    );

    // If the user already has saved the book we exit as we don't want to insert a duplicate record.
    if (userBooks.length > 0) {
        await conn.commit();
        message = `${title} is already in your library`;
      return res.send({ success: false, message: message });
    }

    // The user doesn't have the book saved, insert the record into the User_Books table.
    let userBooksQry = `insert into User_Books (userId, bookId) values (?, ?)`;
    let userBooksParams = [userId, bookId];

    await conn.query(userBooksQry, userBooksParams);
    await conn.commit();
    message = `${title} has been successfully added to your library`;
    return res.send({ success: true , message: message });

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

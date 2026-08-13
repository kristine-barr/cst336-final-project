import express from "express";
const router = express.Router();

import pool from "../db.mjs";

router.get("/book/edit", async (req, res) => {
    const userId = req.session.userId;
    const userBookId = req.query.userBookId;

    const [books] = await pool.query(`
        SELECT
            User_Books.userBookId,
            User_Books.readingStatus,
            User_Books.rating,
            Books.title,
            Books.bookCoverUrl as coverUrl,
            Books.author,
            Books.publishYear as year,
            Books.isbn
        FROM User_Books
        JOIN Books
            ON User_Books.bookId = Books.bookId
        WHERE User_Books.userBookId = ?
          AND User_Books.userId = ?
    `, [userBookId, userId]);

    if (books.length === 0) {
        return res.status(404).send("Book not found on your shelf.");
    }

    res.render("book/EditBook", {
        book: books[0]
    });
});

router.post("/book/edit", async (req, res) => {
    const userId = req.session.userId;

    const userBookId = req.body.userBookId;
    const readStatus = req.body.readingStatus;

    const rating =
        req.body.rating === ""
            ? null
            : req.body.rating;

    const sql = `
        UPDATE User_Books
        SET readingStatus = ?,
            rating = ?
        WHERE userBookId = ?
          AND userId = ?
    `;
    
    await pool.query(sql, [
        readStatus,
        rating,
        userBookId,
        userId
    ]);

    res.redirect("/library");
});

export default router;
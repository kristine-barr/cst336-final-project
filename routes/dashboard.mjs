import express from "express";
const router = express.Router();

import pool from "../db.mjs";


// ======================
// Dashboard Routes
// ======================

// Display the Dashboard 
router.get("/dashboard", (req, res) => {

    res.render("./dashboard/index");
});

// ======================
// Library Route
// ======================

// Display the user's saved books 
router.get("/library", async function (req, res) {

    try {

        // Temporary user ID until login sessions are connected
        let userId = 1;

        let sql = `
    SELECT
        User_Books.userBookId,
        Books.title,
        Books.author,
        Books.isbn,
        Books.publishYear,
        Books.bookCoverUrl,
        User_Books.readingStatus,
        User_Books.rating,
        GROUP_CONCAT(Categories.categoryName SEPARATOR ', ') AS categories
    FROM User_Books
    INNER JOIN Books
        ON User_Books.bookId = Books.bookId
    LEFT JOIN User_Book_Categories
        ON User_Books.userBookId = User_Book_Categories.userBookId
    LEFT JOIN Categories
        ON User_Book_Categories.categoryId = Categories.categoryId
    WHERE User_Books.userId = ?
    GROUP BY
        User_Books.userBookId,
        Books.title,
        Books.author,
        Books.isbn,
        Books.publishYear,
        Books.bookCoverUrl,
        User_Books.readingStatus,
        User_Books.rating
    ORDER BY Books.title
`;

        const [rows] = await pool.query(sql, [userId]);

        res.render("./dashboard/library", {
            books: rows
        });

    } catch (err) {

        console.error("Library database error:", err);
        console.error("Error details:", err.errors);

        res.status(500).send("Unable to load the library.");
    }
});

// ======================
// Delete Book Route
// ======================

// Remove a book from the user's library 
router.post("/library/delete", async function (req, res) {
    try {
        // Get the selected userBookId from the form
        let userBookId = req.body.userBookId;

        // Temporary user ID until login sessions are connected 
        let userId = 1;

        // Delete only the selected book belonging to this user 
        let sql = `
            DELETE FROM User_Books
            WHERE userBookId = ?
            AND userId = ?
        `;

        await pool.query(sql, [userBookId, userId]);

        res.redirect("/library");

    }
    catch (err) {
        console.error("Delete book error:", err);
        res.status(500).send("Unable to remove the book.");
    }
});

export default router;
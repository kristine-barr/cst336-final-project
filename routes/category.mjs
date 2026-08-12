import express from "express";
const router = express.Router();

import pool from "../db.mjs";

router.get("/categories", async (req, res) => {
    const userId = 1;  // Temporary until sessions are implemented

    try {
        const [categories] = await pool.query(`
            SELECT categoryId, categoryName
            FROM Categories
            WHERE userId = ?
            ORDER BY categoryName
        `, [userId]);

        const [books] = await pool.query(`
            SELECT
                User_Books.userBookId,
                Books.title
            FROM User_Books
            JOIN Books
                ON User_Books.bookId = Books.bookId
            WHERE User_Books.userId = ?
            ORDER BY Books.title
        `, [userId]);

        let message = "";

        if (req.query.message === "alreadyAssigned") {
            message = "That book is already in this category.";
        } else if (req.query.message === "assigned") {
            message = "Book added to category.";
        } else if (req.query.message === "removed") {
            message = "Book removed from category.";
        } else if (req.query.message === "notAssigned") {
            message = "That book was not assigned to the selected category.";
}

        res.render("category/catManage", {
            categories,
            books,
            message
        });

    } catch (error) {
        console.error("DATABASE ERROR:", error);
        res.status(500).send("Unable to load categories.");
    }
});

router.post("/categories/new", async (req, res) => {
    const userId = 1; // temporary until sessions are connected
    
    const categoryName = req.body.categoryName;

    const sql = `
        INSERT INTO Categories (userId, categoryName)
        VALUES (?, ?)
    `;

    await pool.query(sql, [userId, categoryName]);

    res.redirect("/categories");
});

router.post("/categories/assign", async (req, res) => {
    const userBookId = req.body.userBookId;
    const categoryId = req.body.categoryId;

    const [existing] = await pool.query(`
        SELECT *
        FROM User_Book_Categories
        WHERE userBookId = ?
          AND categoryId = ?
    `, [userBookId, categoryId]);

    if (existing.length > 0) {
        return res.redirect("/categories?message=alreadyAssigned");
    }

    await pool.query(`
        INSERT INTO User_Book_Categories
            (userBookId, categoryId)
        VALUES (?, ?)
    `, [userBookId, categoryId]);

    res.redirect("/categories?message=assigned");
});

router.post("/categories/remove", async (req, res) => {
    const userBookId = req.body.userBookId;
    const categoryId = req.body.categoryId;

    const sql = `
        DELETE FROM User_Book_Categories
        WHERE userBookId = ?
          AND categoryId = ?
    `;

    const [result] = await pool.query(sql, [
        userBookId,
        categoryId
    ]);

    if (result.affectedRows === 0) {
        return res.redirect("/categories?message=notAssigned");
    }

    res.redirect("/categories?message=removed");
});

export default router;
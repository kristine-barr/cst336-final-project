import express from "express";
const router = express.Router();

import pool from "../db.mjs";


// ======================
// Dashboard Routes
// ======================
router.get("/dashboard", (req, res) => {

    // TODO: 
    // Replace sample data with a MySQL query once 
    // the Books and User_Books tables are completed. 

    // Temporary sample data 
    let books = [
        {
            title: "The Hobbit",
            author: "J.R.R. Tolkien",
            readingStatus: "Reading",
            rating: "★★★★★"
        },
        {
            title: "Dune",
            author: "Frank Herbert",
            readingStatus: "Finished",
            rating: "★★★★"
        }
    ];

    // Send the books to the dashboard 
    res.render("./dashboard/index", {
        books:books
    });
});

export default router;
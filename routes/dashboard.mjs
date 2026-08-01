import express from "express";
const router = express.Router();

import pool from "../db.mjs";


// ======================
// Dashboard Routes
// ======================

// Display the Dashboard 
router.get("/dashboard", (req, res) => {

    // Send the books to the dashboard 
    res.render("./dashboard/index");
});

// ======================
// Library Route
// ======================

// Display the user's saved books 
router.get("/library", (req, res) => {
    
    // TODO: 
    // Replace sample data with a MySQL query once 
    // the Books and User_Books tables are completed. 

    // Temporary sample data 
    let books = [
        {
            title: "The Hobbit",
            author: "J.R.R. Tolkien",
            isbn: "9780547928227",
            publishYear: 1937, 
            readingStatus: "Reading",
            rating: "★★★★★",
            categories: "Fantasy"
        },
        {
            title: "Dune",
            author: "Frank Herbert",
            isbn: "9780441172719",
            readingStatus: "Finished",
            rating: "★★★★",
            categories: "Science Fiction"
        }
    ];

    // Send the books to the My Library page  
    res.render("./dashboard/library", {
        books:books
    });
});

// Delete the selected book 

export default router;
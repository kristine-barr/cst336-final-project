import express, { urlencoded } from "express";
import axios from "axios";

const router = express.Router();

import pool from "../db.mjs";

const BASE_URL = "https://openlibrary.org";
const COVER_IMG_URL = "https://covers.openlibrary.org/b/id";
const SEARCH = "/search.json?lang=en";

const constructCoverURL = (coverId) => {
  // null check, return empty image url
  if (!coverId) {
    return "";
  }

  const strCoverId = String(coverId).trim();

  return `${COVER_IMG_URL}/${strCoverId}-M.jpg`;
};

const mapBook = (book) => {
  // routes/books.mjs
  return {
    title: book.title,
    author: book.author_name?.join(", "),
    year: book.first_publish_year,
    coverId: book.cover_i,
    coverUrl: constructCoverURL(book.cover_i),
  };
};

router.get("/", async (req, res) => {
  const response = await fetch(url);
  const data = await response.json();

  res.json(data.docs.map(mapBook));
});

// /search
// /works/{worksID}

router.get("/search", async (req, res) => {
  const { title, author } = req.query;
  let bookTitle = `title=${encodeURIComponent(title)}`;
  let bookAuthor = `author=${encodeURIComponent(author)}`;
  let url = `${BASE_URL}${SEARCH}&${bookTitle}&${bookAuthor}`;
  console.log(url);

  let resp = await getData(url);

  res.json(resp.docs.map(mapBook));
});

async function getData(url) {
  try {
    const response = await axios.get(url, 
      { headers:{
         'Content-Type': 'application/json',
         'User-Agent': 'Email : stemendoza@csumb.edu CST336 Final Project'

    }});
    console.log(response.data); // Axios auto-parses JSON
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return { error: "Failed to fetch data" };
  }
}

// Here we would create our CRUD operation for reading and writing from the db.

export default router;

import axios from "axios";

// The open library service for this project is grab the first editon of book
// A book can have 1 to many editons to keep it simple for this project for each book we
// grab the first editon

const BASE_URL = "https://openlibrary.org";
const FIELDS_LIST = "key,cover_i,ia,title,subtitle,author_name,author_key,first_publish_year,editions,editions.language,editions.key,editions.title,editions.cover_i,editions.isbn,editions.description";
const COVER_IMG_URL = "https://covers.openlibrary.org/b/id";
const MISSING_BOOK_URL = "/img/missing-book-transparent.png";
const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    Accept: "application/json",
    "User-Agent": "CST336 Final Project (contact: stemendoza@csumb.edu)",
  },
});


 function constructCoverUrl(coverId) {
  if (coverId === null || coverId === undefined) {
    return MISSING_BOOK_URL;
  }

  const normalizedCoverId = String(coverId).trim();

  if (!normalizedCoverId) {
    return MISSING_BOOK_URL;
  }

  return `${COVER_IMG_URL}/${normalizedCoverId}-L.jpg`;
}

// remove the "/books/" prefix from the edition key
function cleanEditionKey(value) {
 if(typeof value !== "string"){
    return "";
  }
  let keyId = value.split("/").pop();
  return keyId.trim();
}

function mapBook(book) {
  return {
    // title: book.title,
    author: book.author_name?.join(", ") || "Unknown",
    title: book.editions?.docs?.[0]?.title,
    year: book.first_publish_year || null,
    // coverId: book.cover_i || null,
    // coverUrl: constructCoverUrl(book.cover_i),
    editionKey: book.editions?.docs?.[0]?.key,
    key: cleanEditionKey(book.editions?.docs?.[0]?.key), 
    coverId: book.editions?.docs?.[0]?.cover_i,
    coverUrl: constructCoverUrl(book.editions?.docs?.[0]?.cover_i),
    isbn: book.editions?.docs?.[0]?.isbn?.[0] ?? '',
  };
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}



export async function searchBooks({ title = "", author = "" } = {}) {
  const cleanTitle = cleanText(title);
  const cleanAuthor = cleanText(author); 

  if (!cleanTitle && !cleanAuthor) {
    const err = new Error("Please provide title or author.");
    err.statusCode = 400;
    throw err;
  }

  const params = new URLSearchParams({ lang: "en" });

  if (cleanTitle) {
    params.set("title", cleanTitle);
  }

  if (cleanAuthor) {
    params.set("author", cleanAuthor);
  }


  try {

    const response = await httpClient.get(`/search.json?${params.toString()}&fields=${FIELDS_LIST}`);

    // console.log(response.data.docs[0])
    // console.log(response.data.docs[0].editions)

    const docs = Array.isArray(response.data?.docs) ? response.data.docs : [];

    return docs.map(mapBook);
  } catch (error) {
    const err = new Error("Failed to fetch books from OpenLibrary.");
    err.statusCode = error.response?.status || 502;
    throw err;
  }
}

export async function getBookById(id) {
  const keyId = cleanText(id);

    // check if the keyId contains books. We will use that to query information about the book to save. 
    // console.log("keyId:", keyId);
    // console.log("keyId includes 'books':", keyId.toLowerCase().includes("books"));
  if (!keyId || !keyId.toLowerCase().includes("books")) {
    const err = new Error("Please provide book editions key id");
    err.statusCode = 400;
    throw err;
  }

  try {
    
    const response = await httpClient.get(`${keyId}/`);

    // console.log(response.data.docs[0])
    // console.log(response.data.docs[0].editions)

    const docs = Array.isArray(response.data?.docs) ? response.data.docs : [];

    return docs.map(mapBook);
  } catch (error) {
    const err = new Error("Failed to fetch books from OpenLibrary.");
    err.statusCode = error.response?.status || 502;
    throw err;
  }
}
import axios from "axios";

const BASE_URL = "https://openlibrary.org";
const COVER_IMG_URL = "https://covers.openlibrary.org/b/id";

function constructCoverUrl(coverId) {
  if (!coverId) {
    return "";
  }

  return `${COVER_IMG_URL}/${String(coverId).trim()}-M.jpg`;
}

function mapBook(book) {
  return {
    title: book.title,
    author: book.author_name?.join(", ") || "Unknown",
    year: book.first_publish_year || null,
    coverId: book.cover_i || null,
    coverUrl: constructCoverUrl(book.cover_i),
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
    const response = await axios.get(`${BASE_URL}/search.json?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "CST336 Final Project (stemendoza@csumb.edu)",
      },
      timeout: 5000,
    });

    const docs = Array.isArray(response.data?.docs) ? response.data.docs : [];
    return docs.map(mapBook);
  } catch (error) {
    const err = new Error("Failed to fetch books from OpenLibrary.");
    err.statusCode = error.response?.status || 502;
    throw err;
  }
}

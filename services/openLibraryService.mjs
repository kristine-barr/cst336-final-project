import axios from "axios";

const BASE_URL = "https://openlibrary.org";
const COVER_IMG_URL = "https://covers.openlibrary.org/b/id";

const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    Accept: "application/json",
    "User-Agent": "CST336 Final Project (contact: stemendoza@csumb.edu)",
  },
});

function constructCoverUrl(coverId) {
  if (!coverId) {
    return "";
  }

  return `${COVER_IMG_URL}/${String(coverId).trim()}-M.jpg`;
}

function mapBook(book) {
  return {
    title: book.title,
    author: book.author_name?.join(", ") ?? "Unknown",
    year: book.first_publish_year ?? null,
    coverId: book.cover_i ?? null,
    coverUrl: constructCoverUrl(book.cover_i),
  };
}

function toTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export async function searchBooks({ title = "", author = "" } = {}) {
  const cleanTitle = toTrimmedString(title);
  const cleanAuthor = toTrimmedString(author);

  if (!cleanTitle && !cleanAuthor) {
    const err = new Error("At least one search parameter is required.");
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
    const response = await httpClient.get(`/search.json?${params.toString()}`);
    const docs = Array.isArray(response.data?.docs) ? response.data.docs : [];
    return docs.map(mapBook);
  } catch (error) {
    const statusCode = error.response?.status ?? 502;
    const err = new Error("OpenLibrary request failed.");
    err.statusCode = statusCode;
    throw err;
  }
}

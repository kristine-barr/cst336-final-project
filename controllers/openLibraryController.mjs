import { searchBooks } from "../services/openLibraryService.mjs";

function toQueryString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export async function searchOpenLibrary(req, res, next) {
  const title = toQueryString(req.query.title);
  const author = toQueryString(req.query.author);

  if (!title && !author) {
    return res.status(400).json({
      error: "Please provide title or author as a query parameter.",
    });
  }

  try {
    const books = await searchBooks({ title, author });
    return res.json({
      count: books.length,
      results: books,
    });
  } catch (error) {
    return next(error);
  }
}

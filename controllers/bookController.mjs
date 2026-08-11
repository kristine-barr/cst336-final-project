import { searchBooks } from "../services/openLibraryService.mjs";

function baseViewModel() {
  return {
    search: {
      title: "",
      author: "",
    },
    results: [],
    error: null,
  };
}

function toQueryString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function renderBookPage(req, res) {
  return res.render("./book/index", baseViewModel());
}

export async function renderBookSearchResults(req, res, next) {
  const title = toQueryString(req.query.title);
  const author = toQueryString(req.query.author);

  if (!title && !author) {
    return res.status(400).render("./book/index", {
      search: { title, author },
      results: [],
      error: "Please enter a title or author.",
    });
  }

  try {
    const results = await searchBooks({ title, author });

    return res.render("./book/index", {
      search: { title, author },
      results,
      error: null,
    });
  } catch (error) {
    return next(error);
  }
}

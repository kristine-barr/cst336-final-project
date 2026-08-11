import express from "express";
import path  from "node:path";
import { fileURLToPath } from 'url';
// mysql connection pool setup.
import conn from "./db.mjs";
// routes
import routes from './routes/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.set("view engine", "ejs");

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


// all the routes are registered in /routes/index.mjs
// this will allow us to keep the index.mjs slim.
app.use('/', routes);
app.use('/', (req, res) => {
    res.render("index");
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error("Request failed:", err.message);

  if (req.path.startsWith("/api/")) {
    return res.status(statusCode).json({
      error: err.message || "Unexpected server error.",
    });
  }

  return res.status(statusCode).render("index");
});


app.listen(3000, () => {
  console.log("Express server running. http://localhost:3000");
});
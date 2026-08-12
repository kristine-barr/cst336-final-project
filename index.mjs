import express from "express";
import session from "express-session"
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

//for Express to get values using POST method
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Keeps track of the logged in user
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// all the routes are registered in /routes/index.mjs
// this will allow us to keep the index.mjs slim.
app.use('/', routes);
app.use('/', (req, res) => {
    res.render("index");
});


app.listen(3000, () => {
  console.log("Express server running. http://localhost:3000");
});
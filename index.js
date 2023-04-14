import http from "http";
import express from "express";
import cors from "cors";
import session from "express-session";
import { config } from "dotenv";
import { default as allRouter } from "./routes/index.js";
import { genMyKeys } from "./keys/key_management.js";
config();
await genMyKeys()
const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

app.use(
  `/api`,
  (req, res, next) => {
    next();
  },
  allRouter
);
server.listen(8080, () => {
  console.log("Listening on ", server.address().port);
});

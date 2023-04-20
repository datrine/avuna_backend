import http from "http";
import express from "express";
import cors from "cors";
import session from "express-session";
import { config } from "dotenv";
import { default as allRouter } from "./routes/index.js";
import { genMyKeys } from "./keys/key_management.js";
import {
  httpPartialStreamFromS3,
  streamFromS3,
  videoPartialStream,
} from "./aws/s3/streamFromS3.js";
import { pipeline } from "stream";
import { createReadStream } from "fs";
config();
await genMyKeys();
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

app.get(`/video/partial`, async (req, res, next) => {
  let range = req.headers["range"];
  if (range) {
    let [startRange, endRange] = range.replace(/bytes=/, "").split("-");
    startRange = parseInt(startRange, 10);
    endRange = parseInt(endRange, 10);
    console.log({ startRange, endRange });
    let { stream, acceptRanges, contentLength, contentRange, contentType } =
      await /*httpPartialStreamFromS3*/  videoPartialStream({
        startRange,
        endRange,
      });
    res.writeHead(206, {
      "Accept-Ranges": acceptRanges,
      "Content-Length": contentLength,
      "Content-Range": contentRange,
      "Content-Type": contentType,
      "Access-Control-Expose-Headers": " Accept-Ranges, Content-Length, Content-Range, Content-Type",
    });
    // console.log( res.headers["accept-ranges"]);
    pipeline(stream, res, (err) => {
      console.log(err);
    });
  }
 // res.end();
});

app.get(`/video`, async (req, res, next) => {
  //res.headers["accept-ranges"];
  let yy = await streamFromS3();
  let done = false;
  if (!done) {
    let iter = await yy.next();
    let value = iter.value;
    done = true || iter.done;
    res.write(value);
    console.log(value);
  }
  res.end();
});

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

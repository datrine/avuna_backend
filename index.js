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
import { createReadStream, fstatSync } from "fs";
import getVideoCodecInfo from "./utils/video.js";
import { open } from "fs/promises";
import path from "path";
config();
//await genMyKeys();
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
  console.log(range)
  if (range) {
    let [startRange, endRange] = range.replace(/bytes=/, "").split("-");
    startRange = parseInt(startRange, 10);
    endRange = parseInt(endRange, 10)||undefined;
    console.log({ startRange, endRange });
    let { stream, acceptRanges, contentLength, contentRange, contentType } =
      await httpPartialStreamFromS3  /*videoPartialStream*/({
        startRange,
        endRange,
      });
    res.writeHead(206, {
      "Accept-Ranges": acceptRanges,
      "Content-Length": contentLength,
      "Content-Range": contentRange,
      "Content-Type": contentType,
      "Access-Control-Expose-Headers":
        " Accept-Ranges, Content-Length, Content-Range, Content-Type",
    });

    pipeline(stream, res, (err) => {
      if (err) {
        console.log({ err });
      }
    });

    /* stream.on("data", (chunk) => {
      console.log(`Received ${chunk.length} bytes of data.`);
      let isWritten = false;
      if ((isWritten = res.write(chunk)) === true) {
        console.log("Written.");
      } else {
        console.log("There will be no additional data till drained.");
        stream.pause();
      }

      res.once("drain", () => {
        console.log("Now data will start flowing again.");
        stream.resume();
      });
    });

    stream.on("end", () => {
      console.log("All written");
      res.end();
    });*/
  }
});

app.get("/videoplayer", async (req, res) => {
  const range = req.headers.range;
  console.log(range);
  const videoPath = "./video.mp4";
  let fileSize;
  let filehandle
  try {
    filehandle = await open(path.join(process.cwd(), "video.mp4"), "r");
    fileSize = (await filehandle.stat()).size;
  } finally {
    await filehandle?.close();
  }
  const chunkSize = 1 * 1e6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + chunkSize, fileSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const stream = createReadStream(videoPath, {
    start,
    end,
  });
  stream.pipe(res);
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

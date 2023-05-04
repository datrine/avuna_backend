import { Router } from "express";
import { createBusiness } from "../../actions/business_mgt.js";
import { authRouter } from "../subroutes/index.js";
import { pipeline } from "stream";
import { httpPartialStreamFromS3, streamFromS3 } from "../../aws/s3/streamFromS3.js";
const router = Router();

router.get("/:key", async (req, res, next) => {
  let { key } = req.params;
  let range = req.headers["range"];

  if (range) {
    console.log({ range });
    let [startRange, endRange] = range.replace(/bytes=/, "").split("-");
    startRange = parseInt(startRange, 10);
    endRange = parseInt(endRange, 10) || undefined;
    console.log({ startRange, endRange });
    let { stream, acceptRanges, contentLength, contentRange, contentType } =
      await httpPartialStreamFromS3(
        /*videoPartialStream*/ {
          startRange,
          endRange,
          key,
        }
      );
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
  else{
 let stream=  await streamFromS3({key})
 pipeline(stream, res, (err) => {
   if (err) {
     console.log({ err });
   }
 });
  }
});

export default router;

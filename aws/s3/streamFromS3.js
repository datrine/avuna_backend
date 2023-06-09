/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { fileURLToPath } from "url";

// snippet-start:[s3.JavaScript.buckets.getobjectV3]
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { open } from "node:fs/promises";
import path from "path";

export const generatorFnFromS3 = async function* ({
  key = "baerbock-in-china-can-she-root-european-uncerta.mp4",
}) {
  const client = new S3Client({ region: "us-east-1" });
  let streaming = true;
  const command = new GetObjectCommand({
    Bucket: "avunabucket",
    Key: key,
  });
  let executor = async (res, rej) => {
    try {
      const response = await client.send(command);
      // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
      response.Body.on("data", (chunk) => {
        //console.log(chunk)
        res(chunk);
        prom = new Promise(executor);
      });
      // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
      response.Body.on("end", (chunk) => {
        //console.log(chunk)
        res(chunk);
        prom = new Promise(executor);
      });
    } catch (err) {
      console.error(err);
      streaming = false;
    }
  };
  let prom = new Promise(executor);

  while (streaming) {
    yield prom;
  }
};

export const streamFromS3 = async function ({
  key = "baerbock-in-china-can-she-root-european-uncerta.mp4",
}) {
  const client = new S3Client({ region: "us-east-1" });
  let streaming = true;
  const command = new GetObjectCommand({
    Bucket: "avunabucket",
    Key: key,
  });
      const response = await client.send(command);
      return response.Body
};
export const httpPartialStreamFromS3 = async function ({
  startRange,
  endRange,
  key = "baerbock-in-china-can-she-root-european-uncerta.mp4",
}) {
  endRange = endRange - 1;
  const client = new S3Client({ region: "us-east-1" });
  let range = `bytes=${startRange}-${endRange}`;
  console.log(range);
  const command = new GetObjectCommand({
    Bucket: "avunabucket",
    Key: key,
    Range: range,
  });
  const response = await client.send(command);
  let contentLength = response.ContentLength + 1;
  let contentRange =
    response.ContentRange || `bytes ${startRange}-${contentLength}/*`;
  let contentType = response.ContentType;
  let acceptRanges = response.ContentType;
  /*  let prom = new Promise(async (res, rej) => {
    let buff = Buffer.alloc(contentLength);
    let start = 0;
    let end = 0;
    response.Body.on(
      "data",
      (chunk) => {
        let buf = Buffer.from(chunk);
        end += buf.byteLength;
        buf.copy(buff, 0, end);
      }
    );
    response.Body.on(
      "end",
      () => {
        res(buff)
      }
    );
    //pipeline(response.Body,)
  });
  console.log({contentLength,contentRange,contentType,acceptRanges})
  let stream = await prom;*/
  console.log({ contentLength, contentRange, contentType });
  let stream = response.Body;
  return {
    stream,
    acceptRanges,
    contentRange,
    contentType,
    contentLength,
    stream,
  };
};

export const videoPartialStream = async function ({ startRange, endRange }) {
  let fileSize;
  let stream; //= createReadStream(path.join([process.cwd(), "video.mp4"]) );
  let filehandle;
  try {
    let filehandle = await open(path.join(process.cwd(), "video.mp4"), "r");
    fileSize = (await filehandle.stat()).size;
    stream = filehandle.createReadStream({
      start: startRange,
      end: Math.min(endRange, fileSize),
    });
  } finally {
    await filehandle?.close();
  }
  /*stream.on("readable", () => {
    let chunk;
    while (null !== (chunk = stream.read())) {
      console.log(chunk);
    }
  }); */

  let contentRange = `bytes ${startRange}-${Math.min(
    endRange,
    fileSize
  )}/${fileSize}`;
  let contentLength = Math.min(endRange, fileSize) - startRange;
  let contentType = "video/mp4";
  let acceptRanges = "bytes";
  console.log({
    contentLength,
    contentRange,
    contentType,
    fileSize,
    acceptRanges,
  });
  return {
    stream,
    acceptRanges,
    contentRange,
    contentType,
    contentLength,
  };
};
// snippet-end:[s3.JavaScript.buckets.getobjectV3]

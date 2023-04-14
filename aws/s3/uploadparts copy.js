/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { fileURLToPath } from "url";

// snippet-start:[javascript.v3.s3.scenarios.multipartupload]
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const minChunk = 5 * 1024 * 1024;
const maxChunk = 10 * 1024 * 1024;

/**
 *
 * @param {object} param0
 * @param {Buffer} param0.buffer
 * @param {string} param0.filename
 * @returns
 */
export const uploadLightContent = async ({ buffer, filename }) => {
  const client = new S3Client({ region: "us-east-1" });
  const bucketName = "avunabucket";
  const key = filename;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
  });

  try {
    const response = await client.send(command);
    console.log(response);
    return response
  } catch (err) {
    console.error(err);
    throw err
  }
};

/**
 *
 * @param {object} param0
 * @param {Buffer} param0.buffer
 * @param {string} param0.filename
 * @returns
 */
export const uploadHeavyContent = async ({ buffer, filename }) => {
  const s3Client = new S3Client({ region: "us-east-1" });
  const bucketName = "avunabucket";
  const key = filename;

  let uploadId;

  try {
    const multipartUpload = await s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    uploadId = multipartUpload.UploadId;

    const uploadPromises = [];
    let startBuf = 0;
    let endBuff = minChunk;
    let count = 0;
    while (endBuff < buffer.byteLength) {
      endBuff =
        buffer.byteLength - startBuf > maxChunk
          ? startBuf + minChunk
          : buffer.byteLength;
      let chunk = buffer.subarray(startBuf, endBuff);
      console.log({ chunkSize: chunk.byteLength, startBuf, endBuff, count });
      /*
       */ uploadPromises.push(
        s3Client
          .send(
            new UploadPartCommand({
              Bucket: bucketName,
              Key: key,
              UploadId: uploadId,
              Body: chunk,
              PartNumber: count + 1,
            })
          )
          .then((d) => {
            console.log("Part ", count, " uploaded");
            console.log(d);
            return d;
          })
          .catch(console.log)
      );
      startBuf = endBuff;
      count++;
    }

    /*
     */ const uploadResults = await Promise.all(uploadPromises);
    console.log({ uploadResults });
    return await s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: bucketName,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: uploadResults.map(({ ETag }, i) => ({
            ETag,
            PartNumber: i + 1,
          })),
        },
      })
    );
    // Verify the output by downloading the file from the Amazon Simple Storage Service (Amazon S3) console.
    // Because the output is a 25 MB string, text editors might struggle to open the file.
  } catch (err) {
    console.error(err);

    if (uploadId) {
      const abortCommand = new AbortMultipartUploadCommand({
        Bucket: bucketName,
        Key: key,
        UploadId: uploadId,
      });

      await s3Client.send(abortCommand);
    }
    throw err
  }
};
// snippet-end:[javascript.v3.s3.scenarios.multipartupload]

// Invoke main function if this file was run directly.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

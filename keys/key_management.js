const { generateKeyPair, createPrivateKey } = await import("node:crypto");
import { config } from "dotenv";
import { existsSync, readFile } from "node:fs";
import fs from "node:fs/promises";
config();
let PASS_PHRASE = process.env.PASS_PHRASE;
let genMyKeys = async () => {
  let exist = await existsSync("./my_private.key");
  if (!exist) {
    generateKeyPair(
      "ec",
      {
        namedCurve: "secp384r1",
        modulusLength: 2048,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
          //cipher: "aes-256-cbc",
          //passphrase: PASS_PHRASE,
        },
      },
      (err, publicKey, privateKey) => {
        (async () => {
          let fd = await fs.open("./my_private.key", "w");
          await fd.write(privateKey);
          await fd.close();

          let fdPub = await fs.open("./my_public.crt", "w");
          await fdPub.write(publicKey);
          console.log("Created...");

          await fdPub.close();
        })();
      }
    );
  }
};

let decryptPEMKey = async (path, passphrase) => {
  let fd = await fs.open(path, "r");
  let encryptedPrivateKey = await fd.read();
  await fd.close();
  let privateKey = await createPrivateKey({
    key: encryptedPrivateKey.buffer.buffer,
    passphrase,
    type: "pkcs8",
    format: "pem",
  });
  return privateKey;
};

let getPEMAsKeyObject = async (path) => {
  let fd = await fs.open(path, "r");
  let encryptedPrivateKey = await fd.read();
  await fd.close();
  let privateKey = await createPrivateKey({
    key: encryptedPrivateKey.buffer,
    type: "pkcs8",
    format: "pem",
  });
  return privateKey;
};

let getPEMKey = async (path) => {
  let data = await fs.readFile(path, { encoding: "utf8" });
  return data;
};

export { genMyKeys, decryptPEMKey, getPEMAsKeyObject, getPEMKey };

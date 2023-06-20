import { Router } from "express";
import { editProfile } from "../../../actions/account_mgt.js";
import multer from "multer";
import {
  uploadLightContent,
  uploadHeavyContent,
} from "../../../aws/s3/uploadparts.js";
import getCloudinary from "../../../cloudinary/index.js";
let cloudinary = getCloudinary();
import { nanoid } from "nanoid";
import { unlink } from "node:fs/promises";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./tmp/my-uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname);
  },
});
const upload = multer({ storage });
const router = Router();

router.get("/", async (req, res, next) => {
  let { account: selfAccount, userBio } = req.session.self;
  let { pass_hash, accountID, ...restOfAccount } = selfAccount;
  let accountInfo = { ...restOfAccount, ...userBio, accountID };
  return res.json(accountInfo);
});

router.post(
  "/edit",
  upload.single("prof_pic"),
  async (req, res, next) => {
    try {
      let body = req.body;
      let file = req.file;

      let prof_pic_info;
      if (file) {
        
        
        let uploadRes;
        if (file.size < 100000000) {
          uploadRes = await cloudinary.v2.uploader.upload(file.path);
        } else {
          uploadRes = await cloudinary.v2.uploader.upload_large(file.path);
        }
        try {
          await unlink(file.path);
        } catch (error) {
          console.log({ error });
        }
        prof_pic_info = await processProfilePic(file);
      }
      let { f_name, l_name, sex, age_range, country } = body;
      let selfAccount = req.session.self.account;
      let queriedAccount = req.session.queried.account;
      if (!selfAccount) {
        console.log("Editting done by another.");
      } else {
        console.log("Editting done by self.");
        let accountID = queriedAccount.accountID;
        let editorID = accountID;
        let updates = {
          f_name,
          l_name,
          sex,
          age_range,
          country,
          prof_pic_info:JSON.stringify(prof_pic_info),
        };

        if (!updates.f_name) {
          delete updates.f_name
        }
        if (!updates.sex||(updates.sex!=="female"&&updates.sex!=="male")) {
          delete updates.sex
        }
      
        if (!updates.country) {
          delete updates.country
        }
        updates = JSON.parse(JSON.stringify(updates));
        console.log(updates);
        let responseOfEdit = await editProfile({
          editorID,
          accountID,
          updates,
        });
        res.json({ info: "Changes made " });
      }
    } catch (error) {
      console.log(error);
      res.status(400);
      res.json({ err: error });
    }
  }
);

let processProfilePic = async (file) => {
  try {
    let { buffer, originalname: filename, mimetype, size } = file;
    let ext = filename.split(".")[1];
    let key = nanoid() + `.${ext}`;
    let processUpload = async ({ buffer, key }) => {
      let uploadRes;
      let upTo5 = 5 * 1024 * 1024 < buffer.byteLength;
    console.log({key,buffer:buffer.byteLength,upTo5,ll:5 * 1024 * 1024})
      if (upTo5) {
        uploadRes = await uploadHeavyContent({
          buffer,
          filename: key,
          contentType: mimetype,
        });
        uploadRes.Key;
      } else {
        uploadRes = await uploadLightContent({
          buffer,
          filename: key,
          contentType: mimetype,
        });
      }
      console.log({ uploadRes });
      let mediaItem = {
        size,
        name: filename,
        mimetype,
        key,
      };
      return mediaItem;
    };
    return await processUpload({ buffer, key });
  } catch (error) {}
};
export default router;

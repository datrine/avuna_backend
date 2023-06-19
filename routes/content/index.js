import { Router } from "express";
import {
  addContent,
  createRole,
  createScope,
  getCourseByCourseID,
} from "../../actions/index.js";
import { authRouter, registerRouter } from "../subroutes/index.js";
import multer from "multer";
import {
  uploadHeavyContent,
  uploadLightContent,
} from "../../aws/s3/uploadparts.js";
import { nanoid } from "nanoid";
import { unlink } from "node:fs/promises";
import getCloudinary from "../../cloudinary/index.js";
let cloudinary = getCloudinary();
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

router.post(
  "/add",
  authRouter,
  upload.array("media"),
  async (req, res, next) => {
    try {
      let { accountID } = req.session.self.account;
      let { courseID, desc, title, mode = "publish" } = req.body;
      let course = await getCourseByCourseID(courseID);
      if (!course) {
        throw { msg: "No courseID matches" };
      }
      let { category: courseCategory } = course;
      let files = req.files;
      let media = [];
      for (const fl of files) {
        
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
        media.push(uploadRes);
        /*
        let { buffer, originalname: filename, mimetype, size } = fl;
        let ext = filename.split(".")[1];
        let key = nanoid() + `.${ext}`;
        let processUpload = async ({ buffer, key }) => {
          let uploadRes;
          let upTo5 = 5 * 1024 * 1024 <= buffer.byteLength;
          if (upTo5) {
            uploadRes = await uploadHeavyContent({
              buffer,
              filename: key,
              contentType: mimetype,
            });
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
          media.push(mediaItem);
        };
        await processUpload({ buffer, key });*/
      }
      let resDB = await addContent({
        creatorID: accountID,
        courseID,
        desc,
        title,
        mode,
        courseCategory,
        media: JSON.stringify(media),
      });
      let { contentID } = resDB;
      res.json({ contentID, info: "content saved" });
    } catch (error) {
      console.log(error);
      res.status(400);
      res.json({ err: error });
    }
  }
);

router.get("/", async (req, res, next) => {
  try {
    let { courseID } = req.query;
    console.log({ params });
  } catch (error) {
    console.log(error);
    res.status(400);
    res.json(error);
  }
});
export default router;

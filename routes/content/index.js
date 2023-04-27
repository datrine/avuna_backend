import { Router } from "express";
import { addContent, createRole, createScope } from "../../actions/index.js";
import { authRouter, registerRouter } from "../subroutes/index.js";
import multer from "multer";
import {
  uploadHeavyContent,
  uploadLightContent,
} from "../../aws/s3/uploadparts.js";
import { nanoid } from "nanoid";
const upload = multer();
const router = Router();

router.post(
  "/add",
  authRouter,
  upload.array("media"),
  async (req, res, next) => {
    try {
      let { accountID } = req.session.self.account;
      let { courseID, desc, title, mode = "publish" } = req.body;
      let files = req.files;
      let media = [];
      for (const fl of files) {
        let { buffer, originalname: filename, mimetype, size } = fl;
        let ext=filename.split(".")[1]
        let key = nanoid()+`.${ext}`;
        let processUpload = async ({ buffer, key }) => {
          let uploadRes;
          let upTo5 = 5 * 1024 * 1024 >= buffer.byteLength;
          if (upTo5) {
            uploadRes = await uploadHeavyContent({ buffer, filename: key ,contentType:mimetype});
            uploadRes.Key;
          } else {
            uploadRes = await uploadLightContent({ buffer, filename: key ,contentType:mimetype});
          }
          console.log({ uploadRes });
          let mediaItem = {
            size,
            name: key,
            mimetype,
             key,
          };
          media.push(mediaItem);
        };
        await processUpload({ buffer, key });
      }
      let resDB = await addContent({
        creatorID: accountID,
        courseID,
        desc,
        title,
        mode,
        media:JSON.stringify(media),
      });
      let { contentID } = resDB;
      res.json({ contentID, info: "content saved" });
    } catch (error) {
      console.log(error);
      res.status=400
      res.json({err:error});
    }
  }
);

router.get("/content", authRouter, async (req, res, next) => {
  try {
    let { ...roleObj } = req.body;
    let { accountID } = req.session.self.account;
    console.log({ roleObj, accountID });
    let { roleID } = await createRole({ ...roleObj, creatorID: accountID });
    res.json({ roleID });
  } catch (error) {
    console.log(error);
    res.status=400
    res.json(error);
  }
});
export default router;

import { Router } from "express";
import { createRole, createScope } from "../../actions/index.js";
import { authRouter, registerRouter } from "../subroutes/index.js";
import multer from "multer";
import {
  uploadHeavyContent,
  uploadLightContent,
} from "../../aws/s3/uploadparts.js";
const upload = multer();
const router = Router();

router.post(
  "/add",
  authRouter,
  upload.array("media"),
  async (req, res, next) => {
    try {
      let { accountID } = req.session.self.account;
      let { courseID } = req.body;
      let files = req.files;
      for (const fl of files) {
        let { buffer, originalname: filename } = fl;
        let processUpload = async ({}) => {
          let uploadRes;
          let upTo5 = 5 * 1024 * 1024 >= buffer.byteLength;
          if (upTo5) {
            uploadRes = await uploadHeavyContent({ buffer, filename });
          } else {
            uploadRes = await uploadLightContent({ buffer, filename });
          }
          
        };
      }
      res.json({ scopeID: "" });
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  }
);

router.post("/create_role", authRouter, async (req, res, next) => {
  try {
    let { ...roleObj } = req.body;
    let { accountID } = req.session.self.account;
    console.log({ roleObj, accountID });
    let { roleID } = await createRole({ ...roleObj, creatorID: accountID });
    res.json({ roleID });
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});
export default router;

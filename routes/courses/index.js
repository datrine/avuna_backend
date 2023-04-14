import { Router } from "express";
import { createCourse, editCourse } from "../../actions/index.js";
import { courseValidator } from "../../utils/validate/index.js";
import { authRouter } from "../subroutes/index.js";
const router = Router();
router.post("/create", authRouter, async (req, res, next) => {
  try {
    let { account } = req.session.self;

    let regObj = req.body;
    //validate each property
    let validationResponse = courseValidator({
      ...regObj,
    });
    if (!validationResponse.isValid) {
      res.statusCode = 403;
      return res.json({ err: { msg: validationResponse.msg } });
    }

    // create account
    let { ...info } = validationResponse.regObj;
    let createRes = await createCourse({
      ...info,
      creatorID: account.accountID,
    });
    res.json(createRes);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

router.use("/:courseID/edit", authRouter, async (req, res, next) => {
  try {
    let account = req.session.self;

    let regObj = req.body;
    //validate each property
    let validationResponse = courseValidator({
      ...regObj,
      creatorID: account.accountID,
    });
    if (!validationResponse.isValid) {
      res.statusCode = 403;
      return res.json({ err: { msg: validationResponse.msg } });
    }

    // create account
    let { ...info } = validationResponse.regObj;

    let createRes = await editCourse({ ...info, editorID: account.accountID });
    res.json(createRes);
  } catch (error) {}
});

export default router;

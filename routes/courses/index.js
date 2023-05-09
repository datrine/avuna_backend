import { Router } from "express";
import { createCourse, editCourse, getCourses, getLessons } from "../../actions/index.js";
import { courseValidator } from "../../utils/validate/index.js";
import { authRouter } from "../subroutes/index.js";
import { default as contentsRouter } from "../content/index.js";
import { default as courseCategoriesRouter } from "../courseCategories/index.js";
const router = Router();
router.post("/create", authRouter, async (req, res, next) => {
  try {
    let { account } = req.session.self;

    let regObj = req.body;
    //validate each property
    if (regObj.price && !regObj.accessType) {
      regObj.accessType = "full_paid";
    }
    if (!regObj.price) {
      regObj.price = 0;
    }
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
    res.status(400);
    res.json(error);
  }
});

router.use("/categories/", courseCategoriesRouter);

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
  } catch (error) {
    res.status(400);
    res.json({ err: error });
  }
});

router.get("/:courseID/contents", async (req, res, next) => {
  try {
    let{courseID}=req.params
    let lessons = await getLessons({courseID});
    res.json(lessons);
  } catch (error) {
    res.status(400);
    res.json({ err: error });
  }
});

router.get("/", authRouter, async (req, res, next) => {
  try {
    let { account } = req.session.self;

    let regObj = req.body;
    //validate each property
    let validationResponse = await getCourses({});
    res.json(validationResponse);
  } catch (error) {
    console.log(error);
    res.status(400);
    res.json(error);
  }
});
export default router;

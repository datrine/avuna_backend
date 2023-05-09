import { Router } from "express";
import { createCourse, editCourse, getCategories, getCourses, getCoursesInCategory, getLessons } from "../../actions/index.js";
import { courseValidator } from "../../utils/validate/index.js";
import { authRouter } from "../subroutes/index.js";
import { default as contentsRouter } from "../content/index.js";
import course from "../../utils/validate/course.js";
const router = Router();

router.get("/:category/courses", authRouter, async (req, res, next) => {
  try {
    let {category} = req.params
    let courses=await getCoursesInCategory(category)
    res.json({courses})
  } catch (error) {
    res.status(400);
    res.json({ err: error });
  }
});

router.get("/", authRouter, async (req, res, next) => {
  try {
    let categories=await getCategories()
    res.json({categories})
  } catch (error) {
    console.log(error)
    res.status(400);
    res.json({ err: error });
  }
});

export default router;

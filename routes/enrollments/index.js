import { Router } from "express";
import { authRouter } from "../subroutes/index.js";
import { addPreferences,
  getPreferences,
} from "../../actions/account_mgt.js";
import { getActiveEnrollments, getCourseByCourseID } from "../../actions/index.js";
import { enrollCourse } from "../../actions/courses_mgt.js";
const router = Router();
router.post("/enroll", authRouter, async (req, res, next) => {
  try {
    let { accountID, account_type } = req.session.self.account;
    let { courseID } = req.body;
    let enrollRes=await enrollCourse({courseID,accountID})
    res.json(enrollRes);
  } catch (error) {
    console.log(error);
    res.status(400);
    res.json(error);
  }
});

router.get("/active", authRouter, async (req, res, next) => {
  try {
    let { accountID, account_type } = req.session.self.account;
    if (account_type !== "student") {
      throw { msg: "Can only be done on the student account" };
    }
    let enrollments = await getActiveEnrollments(accountID);
    res.json(enrollments);
  } catch (error) {
    console.log(error);
    res.status(400);
    res.json({ err: error });
  }
});
export default router;
export { router };

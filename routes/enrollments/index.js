import { Router } from "express";
import { authRouter } from "../subroutes/index.js";
import { addPreferences,
  getPreferences,
} from "../../actions/account_mgt.js";
import { getActiveEnrollments } from "../../actions/index.js";
const router = Router();
router.post("/add", authRouter, async (req, res, next) => {
  try {
    let { accountID, account_type } = req.session.self.account;
    let { preferences } = req.body;
    if (account_type !== "student") {
      throw { msg: "Can only be done on the student account" };
    }
    if (!preferences) {
      throw { msg: "A valid preference must be selected" };
    }
    let prefArr=[]
    for (const preference in preferences) {
      if (Object.hasOwnProperty.call(preferences, preference)) {
        const element = { name: preference,value:preferences[preference] };
        prefArr.push(element)
      }
    }
    let addRes = await addPreferences({ accountID, preferences:prefArr });
    res.json(addRes);
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

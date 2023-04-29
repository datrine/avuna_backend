import { Router } from "express";
import {authRouter} from "../subroutes/index.js"
import { addPreference } from "../../actions/account_mgt.js";
const router = Router();
router.post("/add",authRouter, async (req, res, next) => {
  try {
    let {accountID,}=req.session.self.account
    let {preference}=req.body
     let addRes=await addPreference({accountID,preference});
     res.json(addRes)
  } catch (error) {
    console.log(error);
    res.status(400)
    res.json(error);
  }
});

router.post("/change", async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400)
    res.json({ err: error });
  }
});
export default router;
export { router };

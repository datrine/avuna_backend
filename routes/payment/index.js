import { Router } from "express";
import { authRouter } from "../subroutes/index.js";
import {
  addPreference as addPreferences,
  getPreferences,
} from "../../actions/account_mgt.js";
import { paymentRequestSuccess } from "../../utils/templates/paystack.js";
const router = Router();
router.post("/courses", authRouter, async (req, res, next) => {
  try {
    let { accountID, account_type } = req.session.self.account;
    let { courseID, quantity } = req.body;

    res.json(addRes);
  } catch (error) {
    console.log(error);
    res.status(400);
    res.json(error);
  }
});
router.post("/paystack/callback", async (req, res, next) => {
  try {
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");
    if (hash == req.headers["x-paystack-signature"]) {
      // Do something with event
      let callbackBody = req.body;
      let { event } = callbackBody;
      if (event === "paymentrequest.success") {
        /**
         * @type {paymentRequestSuccess}
         */
        let paymentRequestSuccessCBBody = callbackBody;
      }
    }
  } catch (error) {
    console.log(error);
  }
});
router.get("/", authRouter, async (req, res, next) => {
  try {
    let { accountID, account_type } = req.session.self.account;
    if (account_type !== "student") {
      throw { msg: "Can only be done on the student account" };
    }
    let preference = await getPreferences(accountID);
    res.json(preference);
  } catch (error) {
    console.log(error);
    res.status(400);
    res.json({ err: error });
  }
});
export default router;
export { router };

import { Router } from "express";
import { authRouter } from "../../subroutes/index.js";
import {
  getCartInfo,
  updateSuccessfulPaymentInfo,
} from "../../../actions/index.js";
import { paymentRequestSuccess } from "../../../utils/templates/paystack.js";
import { createHmac } from "node:crypto";
const router = Router();

router.get("/callback", async (req, res, next) => {
  try {
    console.log(req.query);
    let { reference: referenceID } = req.query;
    await updateSuccessfulPaymentInfo({ referenceID });
    res.status(200).end();
  } catch (error) {
    console.log(error);
  }
});

router.post("/webhook", async (req, res, next) => {
  try {
    console.log(req.body);
    const hash = createHmac("sha512", "secret")
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
    res.status(200).end();
  } catch (error) {
    console.log(error);
  }
});
export default router;
export { router };

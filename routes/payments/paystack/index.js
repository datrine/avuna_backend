import { Router } from "express";
import { authRouter } from "../subroutes/index.js";
import { getPreferences, getCartInfo } from "../../actions/index.js";
import { paymentRequestSuccess } from "../../utils/templates/paystack.js";
import { initiatePayment } from "../../actions/payment_mgt.js";
import { createHmac } from "node:crypto";
const router = Router();

router.post("/paystack/callback", async (req, res, next) => {
  try {
    console.log(req.body)
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
    res.status(200).end()
  } catch (error) {
    console.log(error);
  }
});

router.post("/pay", authRouter, async (req, res, next) => {
  try {
    let { accountID, account_type } = req.session.self.account;
    let { cartID, shippingInfo } = req.body;
    let cartInfo = await getCartInfo(cartID);
    let shippingEmail = shippingInfo?.email;
    let initiateRes = await initiatePayment({
      accountID,
      itemID: cartInfo.cartID,
      amount: cartInfo.cart.totalPrice,
      email: shippingEmail,
    });
    res.json({ initiateRes });
  } catch (error) {
    console.log(error);
    res.status(400);
    res.json(error);
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

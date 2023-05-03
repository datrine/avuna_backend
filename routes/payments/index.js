import { Router } from "express";
import { authRouter } from "../subroutes/index.js";
import  paystackRouter from "./paystack/index.js";
import { getPreferences, getCartInfo } from "../../actions/index.js";
import { initiatePayment } from "../../actions/payment_mgt.js";
const router = Router();

router.use("/paystack/",paystackRouter);

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

import { Router } from "express";
import { authRouter } from "../subroutes/index.js";
import { addPreferences, getPreferences } from "../../actions/account_mgt.js";
import { paymentRequestSuccess } from "../../utils/templates/paystack.js";
import { createCart, getMyActiveCarts, getPricesOfCourses } from "../../actions/index.js";
import { createHmac } from "node:crypto";
const router = Router();

router.post("/save", authRouter, async (req, res, next) => {
  try {
    let { accountID } = req.session.self.account;
    let { cart } = req.body;
    //cart = { id: "", items: [{ quantity: 1, itemID: "", unitPrice: 100 }] };
    let priceObjs =
      (await getPricesOfCourses({
        courseIDs: cart.items.map((item) => item.itemID),
      })) || [];
    let items = cart.items;
    items.forEach((element, index, arr) => {
      let getIndex = priceObjs.findIndex(
        (prcObj) => (prcObj.courseID = element)
      );
      let mod = priceObjs[getIndex]?.price || 0;
      items[index].unitPrice = Number(mod);
      items[index].totalPrice = mod * items[index].quantity;
    });
    cart.items = items;
    cart.totalItems = cart.items.reduce(
      (prev, current) => prev + current.quantity,
      0
    );
    cart.totalPrice = cart.items.reduce(
      (prev, current) => prev + current.totalPrice,
      0
    );
    console.log({ ...cart });
    let createCartRes = await createCart({ cart,state:"active", accountID });
    res.json(createCartRes);
    //res.json(addRes);
  } catch (error) {
    console.log(error);
    res.status(400);
    res.json(error);
  }
});


router.get("/active_carts", authRouter, async (req, res, next) => {
  try {
    let { accountID, account_type } = req.session.self.account;
    let carts = await getMyActiveCarts(accountID);
    res.json(carts);
  } catch (error) {
    console.log(error);
    res.status(400);
    res.json({ err: error });
  }
});

router.get("/:cardID/", async (req, res, next) => {
  try {
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
  } catch (error) {
    console.log(error);
  }
});
export default router;
export { router };

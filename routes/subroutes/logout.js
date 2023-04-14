import { Router } from "express";
import { basicLoginValidator } from "../../utils/validate/index.js";
import { createAccount } from "../../queries/index.js";
import { basicLogin } from "../../actions/index.js";
import { logout } from "../../actions/account_mgt.js";
const router = Router();
router.use("/", (req, res, next) => {
  next();
});

router.post("/", async (req, res, next) => {
  try {
    let loginObj = req.body;
    //validate each property
    let validationResponse = logout({clientID,});
    if (!validationResponse.isValid) {
      res.statusCode = 403;
      return res.json({ err: { msg: validationResponse.msg } });
    }

    let { email, password } = validationResponse.loginObj;

    let loginRes = await basicLogin({ email, password });
    if (loginRes?.err) {
      res.statusCode = 403;
      return res.json({ err: loginRes.err });
    }
    return res.json(loginRes);
  } catch (error) {
    console.log(error);
  }
});
export default router;

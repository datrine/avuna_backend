import { Router } from "express";
import { basicLoginValidator } from "../../utils/validate/index.js";
import { createAccount } from "../../queries/index.js";
import { basicLogin } from "../../actions/index.js";
const router = Router();
router.use("/", (req, res, next) => {
  next();
});
router.post("/basic", async (req, res, next) => {
  try {
    let loginObj = req.body;
    //validate each property
    let validationResponse = basicLoginValidator(loginObj);
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

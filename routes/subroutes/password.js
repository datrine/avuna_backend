import { Router } from "express";
import {
  generateEmailToken,
  verifyTempToken,
  initiatePasswordChange,
  completePasswordChange,
} from "../../actions/index.js";
import {
  getAccountByEmailAddress,
} from "../../queries/index.js";
const router = Router();
router.get("/recovery/request", async (req, res, next) => {
  try {
    let { email } = req.query;
    let account = await getAccountByEmailAddress(email);
    let token = generateEmailToken();
    console.log({ token, account });
    let resOf = await initiatePasswordChange({ account });
    res.json({ sent: true });
  } catch (error) {
    console.log(error);
    res.status=400
    res.json({ err: error });
  }
});

router.post("/recovery/change", async (req, res, next) => {
  try {
    let { token, email } = req.query;
    let { password } = req.body;
    let account = await verifyTempToken({
      token,
      tokenType: "password_recovery",
      recipient: email,
    });
    console.log({ token, account });
    let resOf = await completePasswordChange({ email,password });
    res.json(resOf);
  } catch (error) {
    console.log(error);
    res.status=400
    res.json({ err: error });
  }
});

export default router;

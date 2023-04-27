import { Router } from "express";
import { basicLoginValidator } from "../../utils/validate/index.js";
import {
  validateAccessToken,
  verifyAccessToken,
  saveEmailVerificationToken,
  generateEmailToken,
  verifyTempToken,
  initiateEmailVerification,
  verifyEmail,
} from "../../actions/index.js";
import {
  getAccountByEmailAddress,
  getSessionData,
  startLoginSession,
} from "../../queries/index.js";
import { sendEmail } from "../../utils/email_service/index.js";
const router = Router();
router.get("/send", async (req, res, next) => {
  try {
    let { email } = req.query;
    res.json({ sent: true });
  } catch (error) {
    console.log(error);
    res.json({ err: error });
  }
});

router.get("/verification/token/generate", async (req, res, next) => {
  try {
    let { email } = req.query;
    if (!email) {
      throw {msg:"No email supplied"}
    }
    let account = await getAccountByEmailAddress(email);
    console.log({email})
    let result = await initiateEmailVerification({ account });
    res.json({ sent: true, ...result });
  } catch (error) {
    console.log(error);
    res.status=400
    res.json({ err: error });
  }
});

router.get("/verification/token/verify", async (req, res, next) => {
  try {
    let { email, token } = req.query;
    await verifyTempToken({
      recipient: email,
      token,
      tokenType: "verification",
    });
    let account = await getAccountByEmailAddress(email);
     let verRes=await verifyEmail(email)
    res.json({ verified: true });
  } catch (error) {
    console.log(error);
    res.status=400
    res.json({ err: error });
  }
});
export default router;

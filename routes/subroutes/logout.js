import { Router } from "express";
import { logout } from "../../actions/account_mgt.js";
import { router as authRouter } from "./auth.js";
const router = Router();
router.use("/", (req, res, next) => {
  next();
});

router.get("/",authRouter, async (req, res, next) => {
  try {
    //validate each property
    let { clientID, sessionID, accountID } = req.session.self.account;
    let validationResponse = await logout({ clientID, sessionID, accountID });
    if (!validationResponse?.isValid) {
      res.statusCode = 403;
      return res.json({ err: { msg: validationResponse?.msg } });
    }

    return res.json(validationResponse);
  } catch (error) {
    console.log(error);
    return res.json({ err: error });
  }
});
export default router;

import { Router } from "express";
import { basicLoginValidator } from "../../utils/validate/index.js";
import {
  basicLogin,
  refreshTokens,
  validateAccessToken,
  verifyAccessToken,
} from "../../actions/index.js";
import {
  getAccountByAccountID,
  getSessionData,
  startLoginSession,
} from "../../queries/index.js";
import { getSessionDataMySQL } from "../../data/mysql/session.js";
const router = Router();
router.get("/refresh_token", async (req, res, next) => {
  try {
    let { refresh_token } = req.query;

    if (!refresh_token) {
      throw new Error({ err: { msg: "No refresh token" } });
    }
    let tokens = await refreshTokens({ refreshToken: refresh_token });
    res.json(tokens);
  } catch (error) {
    console.log(error);
    res.status(400)
    res.json(error);
  }
});

router.use("/", async (req, res, next) => {
  try {
    let bearerToken = req.headers["authorization"]?.split(" ")[1];
    if (!bearerToken) {
      throw { msg: "No bearer token" };
    }
    let valRes = await validateAccessToken({ token: bearerToken });
    let tokenData = await verifyAccessToken({ token: bearerToken });
    let { sessID, accountID, clientID } = tokenData;
    let account = await getAccountByAccountID(accountID);
    if (!account) {
      throw  { msg: "No such account exists!" };
    }
    startLoginSession({ accountID, sessID, clientID }).catch(console.log);
    let { session: loginSession } = await getSessionData({ clientID, sessID });
    console.log({ loginSession });
    if (loginSession.end_by < new Date()) {
      throw { msg: "Session already ended" };
    }
    req.session.self = { account, token: bearerToken, loginSession };
    console.log("ghvghcfgcfgcgff");
    next();
  } catch (error) {
    console.log(error);
    res.status(400)
    res.json({ err: error });
  }
});
export default router;
export { router };

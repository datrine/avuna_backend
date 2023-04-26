import { Router } from "express";
import profileRouter from "./profile/index.js";
import { authRouter, emailRouter, passwordRouter } from "../subroutes/index.js";
import { getUserBioByAccountID } from "../../queries/user.js";
import accountIDRouter from "./[accountID].js";
const router = Router();

router.use("/", authRouter, async (req, res, next) => {
  try {
    let { account: selfAccount } = req.session.self;
    let { pass_hash, accountID, ...restOfAccount } = selfAccount;
    let userBio = await getUserBioByAccountID(selfAccount?.accountID);
    req.session.self.userBio = userBio;
    next();
  } catch (error) {
    res.json(error);
  }
});

router.use(
  "/profile/",
  async (req, res, next) => {
    let {account} = req.session.self;
    req.session.queried = { ...req.session.queried, account };
    next();
  },
  profileRouter
);

router.get("/", authRouter, async (req, res, next) => {
  try {
    let { account: selfAccount, userBio } = req.session.self;
    let { pass_hash, accountID, ...restOfAccount } = selfAccount;
    let accountInfo = { ...restOfAccount, ...userBio, accountID };
    return res.json(accountInfo);
  } catch (error) {
    res.json(error);
  }
});

export default router;

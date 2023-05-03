import { Router } from "express";
import { editProfile } from "../../../actions/account_mgt.js";
import { authRouter } from "../../subroutes/index.js";
const router = Router();
router.use("/", async (req, res, next) => {
  let selfAccount = req.session.self.account;
  let queriedAccount = req.session.queried.account;
  next();
});
router.get("/", async (req, res, next) => {
  let { account: selfAccount, userBio } = req.session.self;
  let { pass_hash, accountID, ...restOfAccount } = selfAccount;
  console.log({userBio})
  let accountInfo = { ...restOfAccount, ...userBio, accountID };
  return res.json(accountInfo);
});
router.post("/edit", async (req, res, next) => {
  try {
    let body = req.body;
    let { f_name, l_name, sex, age_range, country } = body;
    let selfAccount = req.session.self.account;
    let queriedAccount = req.session.queried.account;
    if (!selfAccount) {
      console.log("Editting done by another.");
    } else {
      console.log("Editting done by self.");
      let accountID = queriedAccount.accountID;
      let editorID = accountID;
      let updates = {
        f_name,
        l_name,
        sex,
        age_range,
        country,
      };
      console.log(updates)
      updates=JSON.parse(JSON.stringify(updates)) 
      console.log(updates)
      let responseOfEdit = await editProfile({ editorID, accountID, updates });
      res.json({info:"Changes made "});
    }
  } catch (error) {
    console.log(error);
    res.status(400)
    res.json({ err: error });
  }
});
export default router;

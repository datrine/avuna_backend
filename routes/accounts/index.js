import { Router } from "express";
import { authRouter, emailRouter, passwordRouter, } from "../subroutes/index.js";
import { getUserBioByAccountID } from "../../queries/user.js";
const router = Router();

router.use(
  "/password",
  passwordRouter
);

router.use(
  "/email",
  emailRouter
);
router.get(
  "/me",authRouter,
  async(req,res,next)=>{
try {
  let {account: selfAccount}=req.session.self;
let {pass_hash,accountID,...restOfAccount}=selfAccount
let userBio=await  getUserBioByAccountID(selfAccount?.accountID);
let accountInfo={...restOfAccount,...userBio,accountID}
return res.json(accountInfo)
} catch (error) {
  res.json(error)
}
  }
);
export default router;

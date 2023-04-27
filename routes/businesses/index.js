import { Router } from "express";
import { createBusiness } from "../../actions/business_mgt.js";
import { authRouter } from "../subroutes/index.js";
const router = Router();
router.post(
  "/create",authRouter,
  async (req, res, next) => {
    try {
      
  let body=req.body
  let { name, sector, phone_num, size,}=body
  let account=req.session.self.account;
  console.log({account})
  if (account.account_type!=="student") {
    throw {msg:"Only student accounts can create business"}
  }
  let creatorID=account.accountID;

  let creationRes=await  createBusiness({name,sector,phone_num,size,creatorID})
    } catch (error) {
      console.log(error)
      res.status(400)
      res.json({err:error})
    }
  }
);

export default router;

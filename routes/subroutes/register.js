import { Router } from "express";
import { regValidator } from "../../utils/validate/index.js";
import { createAccount, createUserBio } from "../../queries/index.js";
const router = Router();
router.use("/", (req, res, next) => {
  next();
});
router.post("/", async (req, res, next) => {
  try {
    let regObj = req.body;
    //validate each property
    let validationResponse = regValidator(regObj);
    if (!validationResponse.isValid) {
      res.statusCode = 403;
      return res.json({ err: { msg: validationResponse.msg } });
    }

    // create account
    let { email, password ,account_type,roles,roleCreatorID} = validationResponse.regObj;

    let createRes = await createAccount({ email, password,account_type,roles ,roleCreatorID});
    if (createRes.err) {
      res.statusCode = 403;
      return res.json({ err: createRes.err });
    }
     res.json({saved:true});
     let {accountID}=createRes
     console.log({accountID})
     let { f_name,l_name,sex,age_range,country } = validationResponse.regObj;
     await createUserBio({accountID, f_name,l_name,sex,age_range,country})
     // process referral_code
     let { referral_code} = validationResponse.regObj;
  } catch (error) {
    console.log(error);
  }
});
export default router;

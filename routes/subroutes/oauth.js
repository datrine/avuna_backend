import { Router } from "express";
import { basicLoginValidator,  } from "../../utils/validate/index.js";
import { createAccount } from "../../queries/index.js";
import { basicLogin } from "../../actions/index.js";
const router = Router();
router.use("/", (req, res, next) => {
  next();
});
router.get("/authorize", async (req, res, next) => {
  try {
    let client_id=req.query.client_id;
    let client=getClientByID(client_id)
  } catch (error) {
    console.log(error);
  }
});
export default router;

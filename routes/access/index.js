import { Router } from "express";
import { createRole, createScope } from "../../actions/index.js";
import { authRouter, registerRouter } from "../subroutes/index.js";
const router = Router();

router.post(
  "/create_scope",
  authRouter,
  async (req, res, next) => {
    try {
      let { ...scopeObj } = req.body;
      let { accountID } = req.session.self.account;
      let { scopeID } = await createScope({
        ...scopeObj,
        creatorID: accountID,
      });
      res.json({ scopeID });
    } catch (error) {
      console.log(error);
      res.status(400)
      res.json(error);
    }
  }
);

router.post(
  "/create_role",
  authRouter,
  async (req, res, next) => {
    try {
      let { ...roleObj } = req.body;
      let { accountID } = req.session.self.account;
      console.log({roleObj,accountID})
      let { roleID } = await createRole({ ...roleObj, creatorID: accountID });
      res.json({ roleID });
    } catch (error) {
      console.log(error);
      res.status(400)
      res.json(error);
    }
  },
);
export default router;

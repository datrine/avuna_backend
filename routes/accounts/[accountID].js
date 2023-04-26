import { Router } from "express";
import profileRouter from "./profile/index.js";
const router = Router();
router.use(
  "/profile/",
  async (req, res, next) => {
    let { account } = req.session.self;
    req.session.queried = { ...req.session.queried, account };
    next();
  },
  profileRouter
);

export default router;
export { router };

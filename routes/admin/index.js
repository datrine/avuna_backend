import { Router } from "express";
import {
  authRouter,
  emailRouter,
  loginRouter,
  logoutRouter,
  registerRouter,
} from "../subroutes/index.js";
const router = Router();
router.use(
  "/register",
  async (req, res, next) => {
    req.body = { ...req.body, account_type: "admin",roles:["admin"],roleCreatorID:"system" };
    next();
  },
  registerRouter
);
router.use("/login", loginRouter);
router.use("/email", emailRouter);
router.use("/logout", logoutRouter);
export default router;

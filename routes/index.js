import { Router } from "express";
import { default as avunaStudentsRouter } from "./avuna_students/index.js";
import { default as avunaAdminsRouter } from "./admin/index.js";
import { default as accessRouter } from "./access/index.js";
import { default as accountsRouter } from "./accounts/index.js";
import { default as coursesRouter } from "./courses/index.js";
import { default as contentsRouter } from "./content/index.js";
import {
  emailRouter,
  authRouter,
  logoutRouter,
  loginRouter,
} from "./subroutes/index.js";

const router = Router();
router.use("/students", avunaStudentsRouter);
router.use("/accounts", accountsRouter);
router.use("/courses", coursesRouter);
router.use("/contents", contentsRouter);
router.use("/admin", avunaAdminsRouter);
router.use("/login", loginRouter);
router.use("/email", emailRouter);
router.use("/access", accessRouter);
router.use("/test_auth", authRouter, (req, res, next) => {
  res.json({ test: true });
});
router.use("/", authRouter, (req, res, next) => {
  res.json({ test: true });
});
router.use("/logout", logoutRouter);
export default router;

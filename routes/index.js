import { Router } from "express";
import { default as avunaStudentsRouter } from "./avuna_students/index.js";
import { default as avunaAdminsRouter } from "./admin/index.js";
import { default as accessRouter } from "./access/index.js";
import { default as accountsRouter } from "./accounts/index.js";
import { default as coursesRouter } from "./courses/index.js";
import { default as contentsRouter } from "./content/index.js";
import { default as businessesRouter } from "./businesses/index.js";
import { default as preferencesRouter } from "./preferences/index.js";
import { default as cartsRouter } from "./carts/index.js";
import { default as paymentsRouter } from "./payments/index.js";
import { default as enrollmentsRouter } from "./enrollments/index.js";
import { default as mediaRouter } from "./media/index.js";
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
router.use("/preferences", preferencesRouter);
router.use("/businesses", businessesRouter);
router.use("/admin", avunaAdminsRouter);
router.use("/login", loginRouter);
router.use("/email", emailRouter);
router.use("/access", accessRouter);
router.use("/carts", cartsRouter);
router.use("/payments", paymentsRouter);
router.use("/enrollments", enrollmentsRouter);
router.use("/media", mediaRouter);
router.use("/test_auth", authRouter, (req, res, next) => {
  res.json({ test: true });
});
router.use("/auth", authRouter);
router.use("/", authRouter, (req, res, next) => {
  res.json({ test: true });
});
router.use("/logout", logoutRouter);
export default router;

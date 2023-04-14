import { Router } from "express";
import { createRole, createScope } from "../../actions/index.js";
import { authRouter, passwordRouter, } from "../subroutes/index.js";
const router = Router();

router.use(
  "/password",
  passwordRouter
);
export default router;

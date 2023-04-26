import { Router } from "express";
import { emailRouter, passwordRouter } from "../subroutes/index.js";
import accountIDRouter from "./[accountID].js";
import meRouter from "./me.js";
const router = Router();

router.use("/password", passwordRouter);

router.use("/email", emailRouter);

router.use("/me/",meRouter);

router.use("/:accountID/",accountIDRouter);


export default router;

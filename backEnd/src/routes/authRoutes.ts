import { Router } from "express";
import { login, loginWithGoogle } from "../controller/authController";

const router = Router();

router.post("/login", login);
router.post("/google", loginWithGoogle);

export default router;


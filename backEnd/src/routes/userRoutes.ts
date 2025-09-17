
import { Router } from "express";
import { registerUser, loginUser, listUsers, getUser } from "../controller/userController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", authenticate, listUsers);
router.get("/:id", authenticate, getUser);

export default router;

import { Router } from "express";
import { suggestTeacherHandler } from "../controller/aiController";

const router = Router();

router.post("/suggest", suggestTeacherHandler);

export default router;

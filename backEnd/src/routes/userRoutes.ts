import { Router, type NextFunction } from "express";
import multer, { MulterError } from "multer";
import { authenticate } from "../middlewares/authMiddleware";
import { registerStudent, listStudents, getStudent, getMe, updateMyPhoto } from "../controller/userController";
import { login as loginUnified } from "../controller/authController";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(file.mimetype)) {
      const err = new Error("INVALID_FILE_TYPE");
      return cb(err);
    }
    cb(null, true);
  },
});

const handlePhotoUpload = (req: any, res: any, next: NextFunction) => {
  upload.single("photo")(req, res, (err?: any) => {
    if (err) {
      if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "Imagem muito grande. MÃ¡x 2MB." });
      }
      if (err?.message === "INVALID_FILE_TYPE") {
        return res.status(400).json({ message: "Formato invÃ¡lido. Use JPG, PNG ou WEBP." });
      }
      return res.status(400).json({ message: "NÃ£o foi possÃ­vel processar o arquivo de foto." });
    }
    return next();
  });
};

// Público
router.post("/register", registerStudent);
router.post("/login", loginUnified);

// Protegidas
router.get("/me", authenticate, getMe);
router.patch("/me/photo", authenticate, handlePhotoUpload, updateMyPhoto);
router.get("/", authenticate, listStudents);
router.get("/:id", authenticate, getStudent);

export default router;

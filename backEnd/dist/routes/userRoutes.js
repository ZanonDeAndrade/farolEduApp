"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importStar(require("multer"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const userController_1 = require("../controller/userController");
const authController_1 = require("../controller/authController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
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
const handlePhotoUpload = (req, res, next) => {
    upload.single("photo")(req, res, (err) => {
        if (err) {
            if (err instanceof multer_1.MulterError && err.code === "LIMIT_FILE_SIZE") {
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
router.post("/register", userController_1.registerStudent);
router.post("/login", authController_1.login);
// Protegidas
router.get("/me", authMiddleware_1.authenticate, userController_1.getMe);
router.patch("/me/photo", authMiddleware_1.authenticate, handlePhotoUpload, userController_1.updateMyPhoto);
router.get("/", authMiddleware_1.authenticate, userController_1.listStudents);
router.get("/:id", authMiddleware_1.authenticate, userController_1.getStudent);
exports.default = router;

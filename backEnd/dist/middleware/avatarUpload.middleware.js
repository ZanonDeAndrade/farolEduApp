"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.avatarUploadConstraints = exports.handleAvatarUploadError = exports.avatarUploadSingle = exports.avatarUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const MAX_AVATAR_SIZE_MB = Number(process.env.AVATAR_MAX_SIZE_MB ?? 5);
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
class InvalidAvatarMimeTypeError extends Error {
    constructor(mimetype) {
        super(`Invalid avatar file type: ${mimetype}. Allowed: image/jpeg, image/png, image/webp.`);
        this.name = "InvalidAvatarMimeTypeError";
    }
}
const fileFilter = (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        callback(new InvalidAvatarMimeTypeError(file.mimetype));
        return;
    }
    callback(null, true);
};
exports.avatarUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: MAX_AVATAR_SIZE_BYTES,
        files: 1,
    },
    fileFilter,
});
exports.avatarUploadSingle = exports.avatarUpload.single("avatar");
const handleAvatarUploadError = (error, _req, res, next) => {
    if (!error) {
        next();
        return;
    }
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            res.status(413).json({
                message: `Avatar exceeds size limit (${MAX_AVATAR_SIZE_MB}MB).`,
            });
            return;
        }
        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            res.status(400).json({
                message: 'Invalid multipart field. Use "avatar".',
            });
            return;
        }
        res.status(400).json({
            message: "Invalid multipart/form-data payload.",
        });
        return;
    }
    if (error instanceof InvalidAvatarMimeTypeError) {
        res.status(400).json({
            message: error.message,
        });
        return;
    }
    next(error);
};
exports.handleAvatarUploadError = handleAvatarUploadError;
exports.avatarUploadConstraints = {
    allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
    maxSizeBytes: MAX_AVATAR_SIZE_BYTES,
    maxSizeMb: MAX_AVATAR_SIZE_MB,
    fieldName: "avatar",
};

import type { NextFunction, Request, Response } from "express";
import multer, { type FileFilterCallback } from "multer";

const MAX_AVATAR_SIZE_MB = Number(process.env.AVATAR_MAX_SIZE_MB ?? 5);
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

class InvalidAvatarMimeTypeError extends Error {
  constructor(mimetype: string) {
    super(`Invalid avatar file type: ${mimetype}. Allowed: image/jpeg, image/png, image/webp.`);
    this.name = "InvalidAvatarMimeTypeError";
  }
}

const fileFilter = (_req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    callback(new InvalidAvatarMimeTypeError(file.mimetype));
    return;
  }

  callback(null, true);
};

export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_AVATAR_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});

export const avatarUploadSingle = avatarUpload.single("avatar");

export const handleAvatarUploadError = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!error) {
    next();
    return;
  }

  if (error instanceof multer.MulterError) {
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

export const avatarUploadConstraints = {
  allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
  maxSizeBytes: MAX_AVATAR_SIZE_BYTES,
  maxSizeMb: MAX_AVATAR_SIZE_MB,
  fieldName: "avatar",
};

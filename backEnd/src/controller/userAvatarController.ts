import type { NextFunction, Request, Response } from "express";
import { findUserById, updateUserPhoto } from "../modules/userModel";
import { StorageServiceError, uploadUserAvatar } from "../services/storage.service";

type AuthenticatedRequest = Request & {
  user?: {
    id?: number;
  };
  file?: Express.Multer.File;
};

export const updateMyAvatar = async (req: Request, res: Response, next: NextFunction) => {
  const request = req as AuthenticatedRequest;
  const userId = Number(request.user?.id);

  if (!Number.isFinite(userId)) {
    res.status(401).json({ message: "Unauthorized." });
    return;
  }

  if (!request.file) {
    res.status(400).json({ message: 'File is required in multipart field "avatar".' });
    return;
  }

  try {
    const currentUser = await findUserById(userId);

    if (!currentUser) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const { photoUrl } = await uploadUserAvatar(
      String(userId),
      request.file.buffer,
      request.file.mimetype,
      currentUser.photoUrl,
    );

    await updateUserPhoto(userId, photoUrl);

    res.status(200).json({ photoUrl });
  } catch (error: unknown) {
    if (error instanceof StorageServiceError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
};

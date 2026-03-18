import { randomUUID } from "node:crypto";
import { bucket } from "../config/firebaseAdmin";

const AVATAR_CACHE_CONTROL = "public,max-age=31536000,immutable";
const SIGNED_URL_EXPIRATION_YEARS = 10;

export class StorageServiceError extends Error {
  public readonly statusCode: number;
  public readonly cause?: unknown;

  constructor(message: string, statusCode = 500, cause?: unknown) {
    super(message);
    this.name = "StorageServiceError";
    this.statusCode = statusCode;
    this.cause = cause;
  }
}

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const getAvatarExtension = (mimetype: string): string => {
  const extension = extensionByMimeType[mimetype];
  if (!extension) {
    throw new StorageServiceError("Unsupported avatar file type.", 400);
  }
  return extension;
};

const signedUrlExpiration = (): Date => {
  const expiration = new Date();
  expiration.setFullYear(expiration.getFullYear() + SIGNED_URL_EXPIRATION_YEARS);
  return expiration;
};

const buildAvatarPath = (userId: string, extension: string): string => {
  return `avatars/${userId}/${randomUUID()}.${extension}`;
};

const extractStoragePathFromUrl = (url?: string | null): string | null => {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === "storage.googleapis.com") {
      const rawPath = decodeURIComponent(parsedUrl.pathname).replace(/^\/+/, "");
      if (!rawPath.startsWith(`${bucket.name}/`)) return null;
      return rawPath.replace(`${bucket.name}/`, "");
    }

    if (parsedUrl.hostname.includes("firebasestorage.googleapis.com")) {
      const regex = /\/b\/([^/]+)\/o\/([^/?]+)/;
      const matches = parsedUrl.pathname.match(regex);
      if (!matches) return null;
      const bucketName = decodeURIComponent(matches[1] ?? "");
      const objectPath = decodeURIComponent(matches[2] ?? "");
      if (bucketName !== bucket.name) return null;
      return objectPath;
    }
  } catch {
    return null;
  }

  return null;
};

export const uploadUserAvatar = async (
  userId: string,
  buffer: Buffer,
  mimetype: string,
  currentPhotoUrl?: string | null,
): Promise<{ photoUrl: string; filePath: string }> => {
  const extension = getAvatarExtension(mimetype);
  const filePath = buildAvatarPath(userId, extension);
  const file = bucket.file(filePath);

  try {
    await file.save(buffer, {
      contentType: mimetype,
      resumable: false,
      metadata: {
        contentType: mimetype,
        cacheControl: AVATAR_CACHE_CONTROL,
      },
    });

    const [photoUrl] = await file.getSignedUrl({
      action: "read",
      expires: signedUrlExpiration(),
    });

    const previousPath = extractStoragePathFromUrl(currentPhotoUrl);
    if (previousPath && previousPath.startsWith(`avatars/${userId}/`) && previousPath !== filePath) {
      try {
        await bucket.file(previousPath).delete();
      } catch (deleteError: unknown) {
        const deleteMessage = deleteError instanceof Error ? deleteError.message : "";
        if (!/not.?found|no such/i.test(deleteMessage)) {
          throw deleteError;
        }
      }
    }

    return { photoUrl, filePath };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to upload avatar to storage.";

    if (/permission|forbidden|denied/i.test(message)) {
      throw new StorageServiceError("Storage permission denied.", 500, error);
    }

    if (/bucket|not.?found|no such/i.test(message)) {
      throw new StorageServiceError(
        "Storage bucket not found or misconfigured. Check FIREBASE_STORAGE_BUCKET.",
        500,
        error,
      );
    }

    throw new StorageServiceError("Avatar upload failed.", 500, error);
  }
};

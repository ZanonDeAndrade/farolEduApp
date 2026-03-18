"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadUserAvatar = exports.StorageServiceError = void 0;
const node_crypto_1 = require("node:crypto");
const firebaseAdmin_1 = require("../config/firebaseAdmin");
const AVATAR_CACHE_CONTROL = "public,max-age=31536000,immutable";
const SIGNED_URL_EXPIRATION_YEARS = 10;
class StorageServiceError extends Error {
    constructor(message, statusCode = 500, cause) {
        super(message);
        this.name = "StorageServiceError";
        this.statusCode = statusCode;
        this.cause = cause;
    }
}
exports.StorageServiceError = StorageServiceError;
const extensionByMimeType = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};
const getAvatarExtension = (mimetype) => {
    const extension = extensionByMimeType[mimetype];
    if (!extension) {
        throw new StorageServiceError("Unsupported avatar file type.", 400);
    }
    return extension;
};
const signedUrlExpiration = () => {
    const expiration = new Date();
    expiration.setFullYear(expiration.getFullYear() + SIGNED_URL_EXPIRATION_YEARS);
    return expiration;
};
const buildAvatarPath = (userId, extension) => {
    return `avatars/${userId}/${(0, node_crypto_1.randomUUID)()}.${extension}`;
};
const extractStoragePathFromUrl = (url) => {
    if (!url)
        return null;
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname === "storage.googleapis.com") {
            const rawPath = decodeURIComponent(parsedUrl.pathname).replace(/^\/+/, "");
            if (!rawPath.startsWith(`${firebaseAdmin_1.bucket.name}/`))
                return null;
            return rawPath.replace(`${firebaseAdmin_1.bucket.name}/`, "");
        }
        if (parsedUrl.hostname.includes("firebasestorage.googleapis.com")) {
            const regex = /\/b\/([^/]+)\/o\/([^/?]+)/;
            const matches = parsedUrl.pathname.match(regex);
            if (!matches)
                return null;
            const bucketName = decodeURIComponent(matches[1] ?? "");
            const objectPath = decodeURIComponent(matches[2] ?? "");
            if (bucketName !== firebaseAdmin_1.bucket.name)
                return null;
            return objectPath;
        }
    }
    catch {
        return null;
    }
    return null;
};
const uploadUserAvatar = async (userId, buffer, mimetype, currentPhotoUrl) => {
    const extension = getAvatarExtension(mimetype);
    const filePath = buildAvatarPath(userId, extension);
    const file = firebaseAdmin_1.bucket.file(filePath);
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
                await firebaseAdmin_1.bucket.file(previousPath).delete();
            }
            catch (deleteError) {
                const deleteMessage = deleteError instanceof Error ? deleteError.message : "";
                if (!/not.?found|no such/i.test(deleteMessage)) {
                    throw deleteError;
                }
            }
        }
        return { photoUrl, filePath };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to upload avatar to storage.";
        if (/permission|forbidden|denied/i.test(message)) {
            throw new StorageServiceError("Storage permission denied.", 500, error);
        }
        if (/bucket|not.?found|no such/i.test(message)) {
            throw new StorageServiceError("Storage bucket not found or misconfigured. Check FIREBASE_STORAGE_BUCKET.", 500, error);
        }
        throw new StorageServiceError("Avatar upload failed.", 500, error);
    }
};
exports.uploadUserAvatar = uploadUserAvatar;

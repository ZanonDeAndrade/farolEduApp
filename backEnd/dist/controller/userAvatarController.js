"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyAvatar = void 0;
const userModel_1 = require("../modules/userModel");
const storage_service_1 = require("../services/storage.service");
const updateMyAvatar = async (req, res, next) => {
    const request = req;
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
        const currentUser = await (0, userModel_1.findUserById)(userId);
        if (!currentUser) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        const { photoUrl } = await (0, storage_service_1.uploadUserAvatar)(String(userId), request.file.buffer, request.file.mimetype, currentUser.photoUrl);
        await (0, userModel_1.updateUserPhoto)(userId, photoUrl);
        res.status(200).json({ photoUrl });
    }
    catch (error) {
        if (error instanceof storage_service_1.StorageServiceError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        next(error);
    }
};
exports.updateMyAvatar = updateMyAvatar;

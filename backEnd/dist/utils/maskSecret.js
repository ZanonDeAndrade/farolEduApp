"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskSecret = void 0;
const maskSecret = (value) => {
    if (!value)
        return value ?? "";
    if (value.length <= 12)
        return "*".repeat(value.length);
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
};
exports.maskSecret = maskSecret;

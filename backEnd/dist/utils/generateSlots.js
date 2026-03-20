"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlots = void 0;
const dateTime_1 = require("./dateTime");
const generateSlots = (start, end, duration) => {
    if (!Number.isFinite(duration) || duration <= 0) {
        throw new Error("INVALID_DURATION");
    }
    if (!(0, dateTime_1.validateTimeRange)(start, end)) {
        throw new Error("INVALID_TIME_RANGE");
    }
    const startMinutes = (0, dateTime_1.parseTimeToMinutes)(start);
    const slots = [];
    for (let current = startMinutes; (0, dateTime_1.doesTimeRangeFit)((0, dateTime_1.formatMinutesToTime)(current), end, duration); current += duration) {
        slots.push((0, dateTime_1.formatMinutesToTime)(current));
    }
    return slots;
};
exports.generateSlots = generateSlots;
exports.default = exports.generateSlots;

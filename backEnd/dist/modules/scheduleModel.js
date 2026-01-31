"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchedulesByUser = exports.createSchedule = void 0;
const bookingModel_1 = require("./bookingModel");
// Legacy shim to preserve old imports/names
const createSchedule = (data) => (0, bookingModel_1.createBooking)({ studentId: data.studentId, offerId: data.offerId, startTime: data.startTime, notes: data.notes });
exports.createSchedule = createSchedule;
const getSchedulesByUser = (userId, role, range) => (0, bookingModel_1.listBookingsByUser)(userId, role, range);
exports.getSchedulesByUser = getSchedulesByUser;

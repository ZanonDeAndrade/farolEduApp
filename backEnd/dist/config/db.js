"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextId = exports.resetMemoryDb = exports.memoryDb = void 0;
const initialState = () => ({
    users: [],
    teacherProfiles: [],
    teacherClasses: [],
    schedules: [],
});
const idCounters = {
    user: 1,
    teacherProfile: 1,
    teacherClass: 1,
    schedule: 1,
};
exports.memoryDb = initialState();
const resetMemoryDb = () => {
    exports.memoryDb.users.length = 0;
    exports.memoryDb.teacherProfiles.length = 0;
    exports.memoryDb.teacherClasses.length = 0;
    exports.memoryDb.schedules.length = 0;
    idCounters.user = 1;
    idCounters.teacherProfile = 1;
    idCounters.teacherClass = 1;
    idCounters.schedule = 1;
};
exports.resetMemoryDb = resetMemoryDb;
const nextId = (key) => {
    const next = idCounters[key];
    idCounters[key] += 1;
    return next;
};
exports.nextId = nextId;

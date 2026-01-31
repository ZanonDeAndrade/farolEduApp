"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/test.ts
const db_1 = require("./config/db");
async function main() {
    console.log("Users in memory:", db_1.memoryDb.users);
}
main().catch((e) => console.error(e));

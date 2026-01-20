// src/test.ts
import { memoryDb } from "./config/db";

async function main() {
  console.log("Users in memory:", memoryDb.users);
}

main().catch((e) => console.error(e));

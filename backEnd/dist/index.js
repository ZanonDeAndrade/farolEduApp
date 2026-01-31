"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const env_1 = require("./config/env");
const start = async () => {
    await server_1.appReady;
    server_1.app.listen(env_1.PORT, () => console.log(`Server running on port ${env_1.PORT}`));
};
start().catch(err => {
    console.error("Falha ao iniciar servidor:", err);
    process.exit(1);
});

import { app, appReady } from "./server";
import { PORT } from "./config/env";

const start = async () => {
  await appReady;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start().catch(err => {
  console.error("Falha ao iniciar servidor:", err);
  process.exit(1);
});

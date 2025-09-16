// src/index.ts
import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Backend Node + TypeScript funcionando! 🎉");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
